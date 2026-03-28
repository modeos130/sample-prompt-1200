const socket = io();

// ── Elements ──────────────────────────────────────────────
const $ = id => document.getElementById(id);
const lobby = $('lobby');
const waiting = $('waiting');
const game = $('game');
const nameInput = $('nameInput');
const codeInput = $('codeInput');
const lobbyError = $('lobbyError');
const roomCodeEl = $('roomCode');
const playerList = $('playerList');
const startBtn = $('startBtn');
const waitMsg = $('waitMsg');
const opponents = $('opponents');
const topCardEl = $('topCard');
const colorDot = $('colorDot');
const turnLabel = $('turnLabel');
const dirIndicator = $('dirIndicator');
const handEl = $('hand');
const drawBtn = $('drawBtn');
const unoBtn = $('unoBtn');
const colorPicker = $('colorPicker');
const winnerOverlay = $('winnerOverlay');
const winnerName = $('winnerName');
const playAgainBtn = $('playAgainBtn');
const toast = $('toast');

let currentState = null;
let pendingWildCard = null;
let isHost = false;
let networkUrl = null;
let currentRoomCode = null;

// ── Card display helpers ──────────────────────────────────
const SYMBOLS = {
  'skip': '⊘',
  'reverse': '⇄',
  'draw2': '+2',
  'wild': '★',
  'wild4': '+4',
};

const LABELS = {
  'skip': 'Skip',
  'reverse': 'Rev',
  'draw2': 'Draw 2',
  'wild': 'Wild',
  'wild4': 'Wild +4',
};

function cardSymbol(card) {
  return SYMBOLS[card.value] || card.value;
}

function cardColorClass(card, prefix) {
  const c = card.color === 'wild' ? 'wild' : card.color;
  return `${prefix}-${c}`;
}

// ── Lobby ─────────────────────────────────────────────────
$('createBtn').addEventListener('click', () => {
  const name = nameInput.value.trim();
  if (!name) { lobbyError.textContent = 'Enter your name first!'; return; }
  lobbyError.textContent = '';
  socket.emit('createRoom', name, (res) => {
    if (res.success) {
      isHost = true;
      showWaiting(res.code);
    } else {
      lobbyError.textContent = res.error;
    }
  });
});

$('joinBtn').addEventListener('click', () => {
  const name = nameInput.value.trim();
  const code = codeInput.value.trim();
  if (!name) { lobbyError.textContent = 'Enter your name first!'; return; }
  if (!code) { lobbyError.textContent = 'Enter the room code!'; return; }
  lobbyError.textContent = '';
  socket.emit('joinRoom', code, name, (res) => {
    if (res.success) {
      showWaiting(res.code);
    } else {
      lobbyError.textContent = res.error;
    }
  });
});

// Enter key support
nameInput.addEventListener('keydown', e => { if (e.key === 'Enter') $('createBtn').click(); });
codeInput.addEventListener('keydown', e => { if (e.key === 'Enter') $('joinBtn').click(); });

function showWaiting(code) {
  lobby.style.display = 'none';
  waiting.style.display = 'flex';
  roomCodeEl.textContent = code;
  currentRoomCode = code;
  loadQRCode(code);
}

async function loadQRCode(code) {
  try {
    const res = await fetch(`/api/network-url?code=${code}`);
    const data = await res.json();
    networkUrl = data.url;
    const qrImg = $('qrCode');
    const shareBtn = $('shareBtn');
    if (data.qr) {
      qrImg.src = data.qr;
      qrImg.style.display = 'inline-block';
    }
    if (data.url) {
      const joinUrl = `${data.url}?join=${code}`;
      shareBtn.onclick = () => {
        if (navigator.share) {
          navigator.share({
            title: 'Join my UNO game!',
            text: `Join my UNO game! Room code: ${code}`,
            url: joinUrl,
          }).catch(() => {});
        } else {
          navigator.clipboard.writeText(joinUrl).then(() => {
            shareBtn.textContent = 'Link Copied!';
            setTimeout(() => { shareBtn.textContent = 'Share Game Link'; }, 2000);
          });
        }
      };
    }
  } catch (e) {
    // Non-critical, skip QR
  }
}

// Auto-join from QR code URL
(function autoJoin() {
  const params = new URLSearchParams(window.location.search);
  const joinCode = params.get('join');
  if (joinCode) {
    codeInput.value = joinCode;
    // Clean URL
    window.history.replaceState({}, '', '/');
  }
})();

startBtn.addEventListener('click', () => {
  socket.emit('startGame');
});

// ── Game state updates ────────────────────────────────────
socket.on('gameState', (state) => {
  currentState = state;

  if (!state.started) {
    renderWaiting(state);
    return;
  }

  waiting.style.display = 'none';
  game.style.display = 'flex';

  if (state.winner) {
    renderWinner(state);
  } else {
    winnerOverlay.classList.remove('active');
  }

  renderOpponents(state);
  renderTopCard(state);
  renderHand(state);
  renderTurn(state);
});

function renderWaiting(state) {
  playerList.innerHTML = state.players.map((p, i) =>
    `<div class="player-chip ${i === 0 ? 'host' : ''}">${p.name}${p.isMe ? ' (you)' : ''}</div>`
  ).join('');

  const me = state.players.find(p => p.isMe);
  const amHost = state.players[0]?.isMe;

  if (amHost) {
    startBtn.style.display = 'block';
    startBtn.disabled = state.players.length < 2;
    waitMsg.textContent = state.players.length < 2 ? 'Waiting for players to join...' : '';
  } else {
    startBtn.style.display = 'none';
    waitMsg.textContent = 'Waiting for host to start...';
  }
}

function renderOpponents(state) {
  const html = state.players
    .filter(p => !p.isMe)
    .map(p => {
      const idx = state.players.indexOf(p);
      const active = idx === state.currentPlayerIndex;
      return `
        <div class="opponent ${active ? 'active' : ''}" onclick="catchUno('${p.name}')">
          ${p.calledUno ? '<span class="uno-badge">UNO</span>' : ''}
          <div class="name">${p.name}</div>
          <div class="count">${p.cardCount}</div>
        </div>
      `;
    }).join('');
  opponents.innerHTML = html;
}

function renderTopCard(state) {
  const card = state.topCard;
  topCardEl.className = `top-card ${cardColorClass(card, 'top-card')}`;
  topCardEl.innerHTML = `<span>${cardSymbol(card)}</span>`;

  const colors = { red: '#ef4444', blue: '#3b82f6', green: '#22c55e', yellow: '#eab308' };
  colorDot.style.background = colors[state.currentColor] || '#888';

  dirIndicator.textContent = state.direction === 1 ? '↻ Clockwise' : '↺ Counter-clockwise';
}

function renderHand(state) {
  const me = state.players.find(p => p.isMe);
  if (!me) return;

  const myIdx = state.players.findIndex(p => p.isMe);
  const isMyTurn = myIdx === state.currentPlayerIndex && !state.winner;

  handEl.innerHTML = state.hand.map(card => {
    const playable = isMyTurn && canPlayCard(card, state);
    return `
      <div class="card ${cardColorClass(card, 'card')} ${playable ? 'playable' : ''}"
           onclick="playCard('${card.id}')"
           data-id="${card.id}">
        <span>${cardSymbol(card)}</span>
        ${LABELS[card.value] ? `<span class="card-label">${LABELS[card.value]}</span>` : ''}
      </div>
    `;
  }).join('');

  // UNO button visibility
  if (me.cardCount <= 2 && isMyTurn && !me.calledUno) {
    unoBtn.style.display = 'block';
  } else {
    unoBtn.style.display = 'none';
  }

  // Draw button state
  drawBtn.disabled = !isMyTurn || state.drawStack > 0;
}

function canPlayCard(card, state) {
  if (state.drawStack > 0) {
    return card.value === 'draw2' || card.value === 'wild4';
  }
  if (card.color === 'wild') return true;
  if (card.color === state.currentColor) return true;
  if (card.value === state.topCard.value) return true;
  return false;
}

function renderTurn(state) {
  const myIdx = state.players.findIndex(p => p.isMe);
  if (state.winner) {
    turnLabel.textContent = '';
    return;
  }
  if (myIdx === state.currentPlayerIndex) {
    turnLabel.textContent = 'Your turn!';
    turnLabel.className = 'turn-label my-turn';
  } else {
    const current = state.players[state.currentPlayerIndex];
    turnLabel.textContent = `${current?.name || '...'}'s turn`;
    turnLabel.className = 'turn-label';
  }
}

function renderWinner(state) {
  winnerName.textContent = state.winner;
  winnerOverlay.classList.add('active');
  const amHost = state.players[0]?.isMe;
  playAgainBtn.style.display = amHost ? 'block' : 'none';
}

// ── Actions ───────────────────────────────────────────────
window.playCard = function(cardId) {
  if (!currentState) return;
  const myIdx = currentState.players.findIndex(p => p.isMe);
  if (myIdx !== currentState.currentPlayerIndex) return;

  const card = currentState.hand.find(c => c.id === cardId);
  if (!card) return;
  if (!canPlayCard(card, currentState)) return;

  // Wild card — need color pick
  if (card.color === 'wild') {
    pendingWildCard = cardId;
    colorPicker.classList.add('active');
    return;
  }

  socket.emit('playCard', cardId, null);
};

// Color picker
document.querySelectorAll('.color-option').forEach(el => {
  el.addEventListener('click', () => {
    const color = el.dataset.color;
    colorPicker.classList.remove('active');
    if (pendingWildCard) {
      socket.emit('playCard', pendingWildCard, color);
      pendingWildCard = null;
    }
  });
});

drawBtn.addEventListener('click', () => {
  socket.emit('drawCard');
});

unoBtn.addEventListener('click', () => {
  socket.emit('callUno');
});

window.catchUno = function(name) {
  socket.emit('catchUno', name);
};

playAgainBtn.addEventListener('click', () => {
  socket.emit('playAgain');
  winnerOverlay.classList.remove('active');
});

// ── Notifications ─────────────────────────────────────────
socket.on('notification', (msg) => {
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
});

// Vibrate on turn
socket.on('gameState', (state) => {
  const myIdx = state.players.findIndex(p => p.isMe);
  if (state.started && !state.winner && myIdx === state.currentPlayerIndex) {
    if (navigator.vibrate) navigator.vibrate(100);
  }
});
