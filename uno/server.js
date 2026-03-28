const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

// ── Card definitions ──────────────────────────────────────────────
const COLORS = ['red', 'blue', 'green', 'yellow'];
const VALUES = ['0','1','2','3','4','5','6','7','8','9','skip','reverse','draw2'];

function buildDeck() {
  const deck = [];
  for (const color of COLORS) {
    // One 0 per color, two of everything else
    deck.push({ color, value: '0', id: `${color}-0` });
    for (const v of VALUES.slice(1)) {
      deck.push({ color, value: v, id: `${color}-${v}-a` });
      deck.push({ color, value: v, id: `${color}-${v}-b` });
    }
  }
  // 4 Wilds + 4 Wild Draw 4
  for (let i = 0; i < 4; i++) {
    deck.push({ color: 'wild', value: 'wild', id: `wild-${i}` });
    deck.push({ color: 'wild', value: 'wild4', id: `wild4-${i}` });
  }
  return deck;
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ── Game rooms ────────────────────────────────────────────────────
const rooms = new Map();

function createRoom(code) {
  const deck = shuffle(buildDeck());
  // Draw a non-wild starter card
  let starterIdx = deck.findIndex(c => c.color !== 'wild');
  const starter = deck.splice(starterIdx, 1)[0];
  return {
    code,
    players: [],       // { id, name, hand: [], calledUno: false }
    deck,
    discard: [starter],
    currentPlayer: 0,
    direction: 1,      // 1 = clockwise, -1 = counter
    started: false,
    winner: null,
    currentColor: starter.color,
    drawStack: 0,      // accumulated draw2/wild4 penalty
  };
}

function getTopCard(room) {
  return room.discard[room.discard.length - 1];
}

function drawCards(room, count) {
  const cards = [];
  for (let i = 0; i < count; i++) {
    if (room.deck.length === 0) {
      // Reshuffle discard into deck (keep top card)
      const top = room.discard.pop();
      room.deck = shuffle(room.discard.map(c => {
        // Reset wild colors
        if (c.value === 'wild' || c.value === 'wild4') c.color = 'wild';
        return c;
      }));
      room.discard = [top];
    }
    if (room.deck.length > 0) cards.push(room.deck.pop());
  }
  return cards;
}

function nextPlayer(room) {
  room.currentPlayer = (room.currentPlayer + room.direction + room.players.length) % room.players.length;
}

function canPlay(card, topCard, currentColor) {
  if (card.color === 'wild') return true;
  if (card.color === currentColor) return true;
  if (card.value === topCard.value) return true;
  return false;
}

function broadcastState(room) {
  for (const p of room.players) {
    const socket = io.sockets.sockets.get(p.id);
    if (!socket) continue;
    socket.emit('gameState', {
      roomCode: room.code,
      started: room.started,
      players: room.players.map(pl => ({
        name: pl.name,
        cardCount: pl.hand.length,
        isMe: pl.id === p.id,
        calledUno: pl.calledUno,
      })),
      hand: p.hand,
      topCard: getTopCard(room),
      currentColor: room.currentColor,
      currentPlayerIndex: room.currentPlayer,
      direction: room.direction,
      winner: room.winner,
      drawStack: room.drawStack,
    });
  }
}

// ── Socket handling ───────────────────────────────────────────────
io.on('connection', (socket) => {
  let currentRoom = null;
  let playerName = null;

  socket.on('createRoom', (name, cb) => {
    const code = Math.random().toString(36).substring(2, 6).toUpperCase();
    const room = createRoom(code);
    rooms.set(code, room);
    currentRoom = code;
    playerName = name.trim().substring(0, 12) || 'Player';
    room.players.push({ id: socket.id, name: playerName, hand: [], calledUno: false });
    socket.join(code);
    cb({ success: true, code });
    broadcastState(room);
  });

  socket.on('joinRoom', (code, name, cb) => {
    code = (code || '').toUpperCase();
    const room = rooms.get(code);
    if (!room) return cb({ success: false, error: 'Room not found' });
    if (room.started) return cb({ success: false, error: 'Game already started' });
    if (room.players.length >= 6) return cb({ success: false, error: 'Room is full (max 6)' });
    if (room.players.some(p => p.id === socket.id)) return cb({ success: false, error: 'Already in room' });

    currentRoom = code;
    playerName = name.trim().substring(0, 12) || 'Player';
    room.players.push({ id: socket.id, name: playerName, hand: [], calledUno: false });
    socket.join(code);
    cb({ success: true, code });
    broadcastState(room);
  });

  socket.on('startGame', () => {
    if (!currentRoom) return;
    const room = rooms.get(currentRoom);
    if (!room || room.started) return;
    if (room.players.length < 2) return;
    // Only host (first player) can start
    if (room.players[0].id !== socket.id) return;

    room.started = true;
    // Deal 7 cards each
    for (const p of room.players) {
      p.hand = drawCards(room, 7);
    }
    // Handle if starter card is an action card
    const top = getTopCard(room);
    if (top.value === 'skip') {
      nextPlayer(room);
    } else if (top.value === 'reverse') {
      room.direction *= -1;
    } else if (top.value === 'draw2') {
      room.drawStack = 2;
    }
    broadcastState(room);
  });

  socket.on('playCard', (cardId, chosenColor) => {
    if (!currentRoom) return;
    const room = rooms.get(currentRoom);
    if (!room || !room.started || room.winner) return;

    const playerIdx = room.players.findIndex(p => p.id === socket.id);
    if (playerIdx === -1 || playerIdx !== room.currentPlayer) return;

    const player = room.players[playerIdx];
    const cardIdx = player.hand.findIndex(c => c.id === cardId);
    if (cardIdx === -1) return;

    const card = player.hand[cardIdx];
    const topCard = getTopCard(room);

    // If there's a draw stack, player must stack or draw
    if (room.drawStack > 0) {
      if (card.value !== 'draw2' && card.value !== 'wild4') return;
    }

    if (!canPlay(card, topCard, room.currentColor)) return;

    // Play the card
    player.hand.splice(cardIdx, 1);
    if (card.color === 'wild') {
      card.color = chosenColor || 'red';
    }
    room.discard.push(card);
    room.currentColor = card.color;

    // Reset UNO call
    player.calledUno = false;

    // Check win
    if (player.hand.length === 0) {
      room.winner = player.name;
      broadcastState(room);
      return;
    }

    // Apply card effects
    if (card.value === 'skip') {
      nextPlayer(room); // skip next
    } else if (card.value === 'reverse') {
      if (room.players.length === 2) {
        nextPlayer(room); // acts as skip in 2-player
      } else {
        room.direction *= -1;
      }
    } else if (card.value === 'draw2') {
      room.drawStack += 2;
    } else if (card.value === 'wild4') {
      room.drawStack += 4;
    }

    nextPlayer(room);

    // If next player faces a draw stack and has no stacking card, force draw
    const nextP = room.players[room.currentPlayer];
    if (room.drawStack > 0) {
      const canStack = nextP.hand.some(c => c.value === 'draw2' || c.value === 'wild4');
      if (!canStack) {
        nextP.hand.push(...drawCards(room, room.drawStack));
        room.drawStack = 0;
        nextPlayer(room);
      }
    }

    broadcastState(room);
  });

  socket.on('drawCard', () => {
    if (!currentRoom) return;
    const room = rooms.get(currentRoom);
    if (!room || !room.started || room.winner) return;

    const playerIdx = room.players.findIndex(p => p.id === socket.id);
    if (playerIdx === -1 || playerIdx !== room.currentPlayer) return;

    const player = room.players[playerIdx];

    // If there's a pending draw stack, the auto-draw already handled it
    // This is for voluntary draws when player can't/won't play
    if (room.drawStack > 0) return;

    const cards = drawCards(room, 1);
    player.hand.push(...cards);
    player.calledUno = false;

    // If drawn card is playable, player can play it (handled client-side)
    // For simplicity, just advance turn
    nextPlayer(room);
    broadcastState(room);
  });

  socket.on('callUno', () => {
    if (!currentRoom) return;
    const room = rooms.get(currentRoom);
    if (!room || !room.started) return;

    const player = room.players.find(p => p.id === socket.id);
    if (player && player.hand.length <= 2) {
      player.calledUno = true;
      broadcastState(room);
    }
  });

  socket.on('catchUno', (targetName) => {
    if (!currentRoom) return;
    const room = rooms.get(currentRoom);
    if (!room || !room.started) return;

    const target = room.players.find(p => p.name === targetName);
    if (target && target.hand.length === 1 && !target.calledUno) {
      // Penalty: draw 2 cards
      target.hand.push(...drawCards(room, 2));
      io.to(currentRoom).emit('notification', `${target.name} was caught! +2 cards`);
      broadcastState(room);
    }
  });

  socket.on('playAgain', () => {
    if (!currentRoom) return;
    const room = rooms.get(currentRoom);
    if (!room || !room.winner) return;
    if (room.players[0].id !== socket.id) return;

    // Reset game
    const newDeck = shuffle(buildDeck());
    let starterIdx = newDeck.findIndex(c => c.color !== 'wild');
    const starter = newDeck.splice(starterIdx, 1)[0];
    room.deck = newDeck;
    room.discard = [starter];
    room.currentPlayer = 0;
    room.direction = 1;
    room.winner = null;
    room.currentColor = starter.color;
    room.drawStack = 0;
    room.started = true;

    for (const p of room.players) {
      p.hand = drawCards(room, 7);
      p.calledUno = false;
    }
    broadcastState(room);
  });

  socket.on('disconnect', () => {
    if (!currentRoom) return;
    const room = rooms.get(currentRoom);
    if (!room) return;

    const idx = room.players.findIndex(p => p.id === socket.id);
    if (idx === -1) return;

    const wasCurrentPlayer = idx === room.currentPlayer;
    room.players.splice(idx, 1);

    if (room.players.length === 0) {
      rooms.delete(currentRoom);
      return;
    }

    // Adjust current player index
    if (room.started && !room.winner) {
      if (wasCurrentPlayer) {
        room.currentPlayer = room.currentPlayer % room.players.length;
      } else if (idx < room.currentPlayer) {
        room.currentPlayer--;
      }
      if (room.players.length < 2) {
        room.winner = room.players[0].name;
      }
    }

    io.to(currentRoom).emit('notification', `${playerName} left the game`);
    broadcastState(room);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`UNO server running on http://localhost:${PORT}`);
  // Show local network IP for phone access
  const os = require('os');
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        console.log(`  Network: http://${net.address}:${PORT}`);
      }
    }
  }
});
