import streamlit as st
import google.generativeai as genai
import base64
import re
import html as html_module
import json

st.set_page_config(
    page_title="Sample Prompt 1200",
    layout="centered",
    initial_sidebar_state="collapsed",
)

# ══════════════════════════════════════════════════════════════════════════════
# STYLES
# ══════════════════════════════════════════════════════════════════════════════
st.markdown("""
<style>
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@300;400;500&display=swap');

:root {
    --bg:        #141618;
    --surface:   #1c1f23;
    --surface2:  #22262b;
    --border:    #2a2f36;
    --border2:   #343b44;
    --gold:      #c9a84c;
    --gold-dim:  #7a6530;
    --green:     #3ddc84;
    --text:      #e8eaed;
    --text-dim:  #8a9099;
    --text-faint:#454c56;
    --red:       #ff5555;
    --orange:    #ff9640;
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

html, body, .stApp {
    background: var(--bg) !important;
    font-family: 'DM Mono', monospace;
    color: var(--text);
}

header, footer, #MainMenu, .stDeployButton,
[data-testid="stToolbar"], [data-testid="stDecoration"] {
    visibility: hidden !important; display: none !important;
}

.block-container {
    padding: 0 !important;
    max-width: 720px !important;
    margin: 0 auto !important;
}

.page { padding: 32px 24px 80px; }

/* ── HEADER ── */
.app-header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    margin-bottom: 40px;
    padding-bottom: 24px;
    border-bottom: 1px solid var(--border);
}
.app-eyebrow {
    font-family: 'DM Mono', monospace;
    font-size: 10px; font-weight: 500;
    color: var(--gold);
    letter-spacing: 3px; text-transform: uppercase;
    margin-bottom: 6px;
}
.app-title {
    font-family: 'Syne', sans-serif;
    font-size: 28px; font-weight: 800;
    color: var(--text);
    letter-spacing: -0.5px; line-height: 1;
}
.app-title span { color: var(--gold); }
.app-badge {
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    width: 54px; height: 54px;
    border-radius: 50%;
    border: 1.5px solid var(--gold-dim);
    background: var(--surface);
}
.badge-num {
    font-family: 'Syne', sans-serif;
    font-size: 16px; font-weight: 800;
    color: var(--gold); line-height: 1;
}
.badge-txt {
    font-size: 7px; font-weight: 500;
    color: var(--gold-dim); letter-spacing: 1.5px;
    text-transform: uppercase; margin-top: 1px;
}

/* ── STATUS BAR ── */
.status-bar {
    display: flex; align-items: center; gap: 10px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 12px 16px; margin-bottom: 24px;
    font-size: 11px; color: var(--text-dim); letter-spacing: 0.5px;
}
.status-dot {
    width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0;
}
.status-dot.idle  { background: var(--text-faint); }
.status-dot.active{ background: var(--green); animation: pulse 1.4s ease-in-out infinite; }
.status-dot.done  { background: var(--green); }
.status-dot.error { background: var(--red); }
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }

/* ── UPLOAD ── */
.upload-label {
    font-family: 'Syne', sans-serif;
    font-size: 11px; font-weight: 700;
    color: var(--text-dim);
    letter-spacing: 2px; text-transform: uppercase;
    margin-bottom: 12px; display: block;
}
.stFileUploader {
    background: var(--surface) !important;
    border: 1px dashed var(--border2) !important;
    border-radius: 12px !important;
}
.stFileUploader:hover { border-color: var(--gold-dim) !important; }
[data-testid="stFileUploaderDropzone"] {
    background: transparent !important; padding: 20px !important;
}
[data-testid="stFileUploaderDropzoneInstructions"] {
    color: var(--text-dim) !important; font-size: 12px !important;
}

/* ── FILE INFO ── */
.file-info {
    display: flex; align-items: center; gap: 8px;
    padding: 10px 14px;
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: 8px; margin-top: 10px;
    font-family: 'DM Mono', monospace;
    font-size: 11px; color: var(--text-dim);
}
.fi-dot { color: var(--gold); font-size: 8px; }
.fi-name { color: var(--text); font-weight: 500; flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.fi-size { color: var(--text-faint); flex-shrink: 0; }

/* ── ANALYZE BUTTON ── */
.stButton > button {
    background: var(--gold) !important;
    color: #0d0e10 !important;
    border: none !important;
    border-radius: 8px !important;
    font-family: 'Syne', sans-serif !important;
    font-weight: 700 !important; font-size: 13px !important;
    letter-spacing: 1.5px !important; text-transform: uppercase !important;
    height: 52px !important; width: 100% !important;
    transition: all 0.2s ease !important;
    padding: 0 24px !important; margin-top: 16px !important; margin-bottom: 8px !important;
}
.stButton > button:hover {
    background: #d4b05a !important;
    box-shadow: 0 4px 24px rgba(201,168,76,0.25) !important;
    transform: translateY(-1px) !important;
}
.stButton > button:active { transform: translateY(0) !important; box-shadow: none !important; }
.stButton > button:disabled { opacity: 0.35 !important; cursor: not-allowed !important; transform: none !important; }

/* ── SECTION LABEL ── */
.section-label {
    font-family: 'Syne', sans-serif;
    font-size: 10px; font-weight: 700;
    color: var(--text-dim);
    letter-spacing: 3px; text-transform: uppercase;
    margin: 0 0 12px 0;
    display: flex; align-items: center; gap: 10px;
}
/* char badge — defined at top level so it works regardless of nesting */
.lbadge {
    font-family: 'DM Mono', monospace;
    font-size: 9px; font-weight: 400;
    text-transform: none; letter-spacing: 0;
    margin-left: auto;
}
.lbadge.ok   { color: var(--green); }
.lbadge.warn { color: var(--orange); }
.lbadge.over { color: var(--red); }

/* ── SUBLABEL ── */
.prompt-sublabel {
    font-family: 'DM Mono', monospace;
    font-size: 10px; color: var(--text-faint);
    letter-spacing: 1px; margin: -6px 0 10px 0;
}

/* ── ALERT ── */
.alert {
    background: rgba(255,85,85,0.08);
    border: 1px solid var(--red);
    border-radius: 8px;
    padding: 14px 16px;
    font-family: 'DM Mono', monospace;
    font-size: 11px; color: var(--red);
    margin-bottom: 16px; line-height: 1.6;
}

/* ── ANALYSIS CARD ── */
.analysis-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-left: 3px solid var(--gold);
    border-radius: 8px;
    overflow: hidden;
    margin-bottom: 8px;
}
.analysis-row {
    display: flex; gap: 12px;
    padding: 9px 16px;
    border-bottom: 1px solid var(--border);
    font-size: 11.5px; line-height: 1.55;
    align-items: flex-start;
}
.analysis-row:last-child { border-bottom: none; }
.ar-key {
    font-family: 'Syne', sans-serif;
    font-size: 8.5px; font-weight: 700;
    color: var(--gold); letter-spacing: 1.5px;
    text-transform: uppercase;
    min-width: 120px; padding-top: 2px; flex-shrink: 0;
}
.ar-val {
    font-family: 'DM Mono', monospace;
    color: var(--text-dim); flex: 1; word-break: break-word;
}

/* ── FLIP CARD ── */
.flip-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-left: 3px solid var(--gold-dim);
    border-radius: 8px;
    padding: 14px 16px; margin-top: 6px;
}
.flip-hdr {
    font-family: 'Syne', sans-serif;
    font-size: 8.5px; font-weight: 700;
    color: var(--gold-dim); letter-spacing: 1.5px;
    text-transform: uppercase; margin-bottom: 10px;
}
.flip-item {
    font-family: 'DM Mono', monospace;
    font-size: 11px; color: var(--text-dim);
    padding: 3px 0; line-height: 1.6;
}
.flip-ltr { color: var(--gold); margin-right: 8px; font-weight: 700; }

/* ── PROMPT TEXTAREA ── */
.stTextArea textarea {
    background: var(--surface2) !important;
    color: var(--text) !important;
    border: 1px solid var(--border2) !important;
    border-radius: 8px !important;
    font-family: 'DM Mono', monospace !important;
    font-size: 12.5px !important; line-height: 1.75 !important;
    padding: 14px 16px !important; resize: none !important;
    caret-color: var(--gold) !important;
}
.stTextArea textarea:focus {
    border-color: var(--gold-dim) !important;
    box-shadow: 0 0 0 2px rgba(201,168,76,0.1) !important;
    outline: none !important;
}
.stTextArea label { display: none !important; }

/* ── COPY BUTTON ── */
.copy-btn {
    display: inline-flex; align-items: center; gap: 6px;
    background: var(--surface2);
    border: 1px solid var(--border2);
    border-radius: 6px;
    padding: 8px 16px;
    font-family: 'DM Mono', monospace; font-size: 11px;
    color: var(--text-dim);
    cursor: pointer; transition: all 0.15s;
    margin-top: 8px;
}
.copy-btn:hover { border-color: var(--gold-dim); color: var(--gold); }
.copy-btn.copied { border-color: var(--green) !important; color: var(--green) !important; }

/* ── DIVIDER ── */
.divider { height: 1px; background: var(--border); margin: 28px 0; }

/* ── FOOTER ── */
.app-footer {
    margin-top: 40px; padding-top: 24px;
    border-top: 1px solid var(--border);
    display: flex; align-items: center; justify-content: space-between;
    font-size: 10px; color: var(--text-faint); letter-spacing: 1px;
}
.footer-brand { font-family: 'Syne', sans-serif; font-weight: 700; color: var(--text-faint); }

/* ── SPINNER ── */
.stSpinner > div { border-top-color: var(--gold) !important; }
</style>
""", unsafe_allow_html=True)


# ══════════════════════════════════════════════════════════════════════════════
# PASS 1 — Pure audio analysis
# ══════════════════════════════════════════════════════════════════════════════
ANALYSIS_PROMPT = """
You are an expert musicologist and audio analyst. Listen to this recording and describe exactly what you hear.
Your job is ONLY analysis — no AI music prompts yet. Be precise. Never fill in defaults.

Output using these exact headers:

## ANALYSIS
ERA: [Most likely decade and period — e.g. "Late 1950s", "Early 1970s", "Mid 1980s". Base on instrumentation, recording quality, sonic character. Be specific — not just "vintage".]
RECORDING AESTHETIC: [Evocative description — e.g. "Blue Note hard bop session", "Motown studio production", "Major label 70s soul", "DIY 90s lo-fi bedroom recording", "Classic 80s new wave".]
PRODUCTION TEXTURE: [Sonic patina — analog tape warmth, vinyl surface noise, digital clarity, cassette saturation, room bleed, etc. What does the recording feel like?]
BPM: [Tight 2-number range — e.g. "72-78". If no clear pulse, describe rhythmic feel instead.]
GROOVE: [Straight / swung / triplet / rubato / free — with nuance about how it feels.]
KEY + MODE: [e.g. "Bb minor", "D Dorian", "G Mixolydian". Include scale character.]
CHORD MOVEMENT: [Harmonic progression in plain language — what moves, what cycles, what the harmony implies emotionally.]
INSTRUMENTATION: [Every instrument identified, named specifically — "upright bass" not "bass", "Rhodes electric piano" not "keys". NO drums, kick, snare, or hi-hats mentioned.]
VOCAL TONE: [If vocals: register, texture, delivery style. If none: "Instrumental — no vocals."]
EMOTIONAL CHARACTER: [3-5 specific mood descriptors. Describe the actual feeling, not the genre label.]
SAMPLE POTENTIAL: [What would a boom bap or soul producer gravitate toward. What melodic or harmonic moments stand out for chopping and pitching.]
FLIP DIRECTIONS:
A. [Specific direction grounded in what you heard]
B. [Second direction]
C. [Third direction]
""".strip()


# ══════════════════════════════════════════════════════════════════════════════
# PASS 2 — Prompt generation from analysis text only (no audio re-upload)
# Research applied:
#   - 4-7 descriptors = proven sweet spot across 1000+ tested generations
#   - Era as first anchor = strongest structural signal for Suno/Udio
#   - Specific instrument names = single most powerful quality lever
#   - Production/texture/mood language > music theory terms
#   - "No drums" negation worsens results — stem separation is the real solution
# ══════════════════════════════════════════════════════════════════════════════
def build_prompt_generation(analysis_text: str) -> str:
    return f"""
You are a specialist writing AI music generation prompts for sample-based hip-hop producers.

Write two prompts from the analysis below. Base everything ONLY on what the analysis found.
Do NOT default to generic era language unless the analysis specifically identifies it.

STRICT RULES:
1. Single flowing paragraph per prompt — no bullets, no line breaks inside, no sub-headers
2. TARGET 420-560 characters. HARD MAX 700 characters. Punchy beats dense.
3. 4-7 strong descriptors produce better AI output than exhaustive paragraphs
4. Lead with ERA + RECORDING AESTHETIC — this is Suno and Udio's strongest signal
5. Name instruments specifically — "Rhodes electric piano", "upright bass" — biggest quality lever
6. Use production and mood language — outperforms music theory terms with these models
7. NO drums, percussion, kick, snare, hi-hats, or beats in either prompt, ever
8. End both prompts with: "designed to feel loopable"

ANALYSIS:
{analysis_text}

---

## CLONE PROMPT
Single paragraph, 420-560 chars target, no drums anywhere.
Build as: [ERA + RECORDING AESTHETIC from analysis] — [specific instruments named from analysis] — [key and chord feel translated into vibe/emotional language, not theory] — [vocal tone or "no vocals, purely instrumental"] — [production texture from analysis] — [2-3 emotional character words] — "designed to feel loopable."
Goal: someone pasting this should get something that sounds like the original recording.

## SAMPLER PROMPT
Single paragraph, 420-560 chars target, no drums anywhere.
Same analysis reframed for maximum sample-flip value.
Build as: [ERA + RECORDING AESTHETIC] — [specific instruments] — [tempo feel + BPM range in vibe language not numbers] — [vocals or "no vocals"] — [sonic imperfections: crackle, tape hiss, human timing, room feel — pull from production texture in the analysis] — [2-3 mood words from emotional character] — "designed to feel loopable, the kind of record that would be sampled, chopped and pitched up."
Works identically in Suno, Udio, and Sampla.ai.
""".strip()


# ══════════════════════════════════════════════════════════════════════════════
# HELPERS
# ══════════════════════════════════════════════════════════════════════════════
def extract_section(text: str, header: str) -> str:
    pattern = rf"##\s*{re.escape(header)}\s*\n(.*?)(?=\n##\s|\Z)"
    m = re.search(pattern, text, re.DOTALL | re.IGNORECASE)
    return m.group(1).strip() if m else ""


def cap_prompt(text: str, limit: int = 700) -> str:
    if len(text) <= limit:
        return text
    cut = text[:limit - 3]
    return cut.rsplit(" ", 1)[0] + "..."


def char_color(n: int, limit: int = 700) -> str:
    if n > limit: return "over"
    if n > 580:   return "warn"
    return "ok"


def friendly_error(exc: Exception) -> str:
    msg = str(exc)
    if "429" in msg or "quota" in msg.lower():
        return "API quota exceeded. Enable billing at aistudio.google.com or retry after the rate-limit window."
    if "404" in msg:
        return "Gemini model not found. The model identifier may need updating — check Google AI Studio."
    if "403" in msg or "api_key" in msg.lower() or "unauthorized" in msg.lower():
        return "Invalid API key. Verify GEMINI_KEY in Streamlit → Settings → Secrets."
    if "timeout" in msg.lower():
        return "Request timed out. Try a shorter audio clip (under 5 minutes works best)."
    if "too large" in msg.lower() or "payload" in msg.lower():
        return f"Audio file is too large. Keep clips under {MAX_FILE_MB} MB."
    return f"Analysis failed — {msg[:140]}"


def file_size_str(n_bytes: int) -> str:
    if n_bytes >= 1_048_576:
        return f"{n_bytes / 1_048_576:.1f} MB"
    return f"{n_bytes / 1024:.0f} KB"


MAX_FILE_MB = 15


def parse_analysis(raw: str):
    """Return (fields, flip_block).  fields = list of (key, value) tuples."""
    key_pat   = re.compile(r'^([A-Z][A-Z\s+]*?):\s*(.*)')
    flip_re   = re.compile(r'^FLIP\s+DIRECTIONS\s*:', re.IGNORECASE)
    fields    = []
    flip_lines = []
    in_flip   = False
    cur_key   = None
    cur_val   = []

    for raw_line in raw.split('\n'):
        line = raw_line.strip()
        if not line:
            continue

        if flip_re.match(line):
            if cur_key and cur_val:
                fields.append((cur_key, ' '.join(cur_val)))
                cur_key, cur_val = None, []
            in_flip = True
            after = flip_re.sub('', line).strip()
            if after:
                flip_lines.append(after)
            continue

        if in_flip:
            flip_lines.append(line)
            continue

        m = key_pat.match(line)
        if m:
            candidate = m.group(1).strip()
            # Valid key: 2+ chars, only uppercase letters / spaces / +
            if len(candidate) >= 2 and re.match(r'^[A-Z][A-Z\s+]*$', candidate):
                if cur_key and cur_val:
                    fields.append((cur_key, ' '.join(cur_val)))
                cur_key  = candidate
                val_start = m.group(2).strip()
                cur_val  = [val_start] if val_start else []
                continue

        if cur_key:
            cur_val.append(line)

    if cur_key and cur_val:
        fields.append((cur_key, ' '.join(cur_val)))

    return fields, '\n'.join(flip_lines)


def render_analysis(raw: str) -> None:
    """Render structured analysis as a clean field table, fully HTML-escaped."""
    fields, flip_block = parse_analysis(raw)

    if not fields:
        # Fallback: plain pre-formatted block
        escaped = html_module.escape(raw)
        st.markdown(
            f'<div class="analysis-card" style="padding:16px">'
            f'<pre style="font-family:\'DM Mono\',monospace;font-size:11px;'
            f'color:#9aa3ae;white-space:pre-wrap;margin:0">{escaped}</pre></div>',
            unsafe_allow_html=True,
        )
        return

    rows = "".join(
        f'<div class="analysis-row">'
        f'<div class="ar-key">{html_module.escape(k)}</div>'
        f'<div class="ar-val">{html_module.escape(v)}</div>'
        f'</div>'
        for k, v in fields
    )
    st.markdown(f'<div class="analysis-card">{rows}</div>', unsafe_allow_html=True)

    if flip_block:
        items_html = ""
        for line in flip_block.split('\n'):
            line = line.strip()
            if not line:
                continue
            fm = re.match(r'^([A-C])[\.\)]\s*(.+)', line)
            if fm:
                items_html += (
                    f'<div class="flip-item">'
                    f'<span class="flip-ltr">{html_module.escape(fm.group(1))}.</span>'
                    f'{html_module.escape(fm.group(2))}</div>'
                )
            else:
                items_html += f'<div class="flip-item">{html_module.escape(line)}</div>'
        if items_html:
            st.markdown(
                f'<div class="flip-card">'
                f'<div class="flip-hdr">Flip Directions</div>'
                f'{items_html}</div>',
                unsafe_allow_html=True,
            )


def copy_button(prompt_text: str, btn_id: str) -> None:
    """
    Copy button that embeds the text directly in the onclick handler via
    JSON encoding — no DOM traversal, no textarea index guessing.
    Works reliably on mobile and desktop.
    """
    safe_js = json.dumps(prompt_text)   # JSON-escapes quotes, newlines, unicode
    st.markdown(
        f'<button class="copy-btn" id="{btn_id}" '
        f'onclick="(function(b){{'
        f'navigator.clipboard.writeText({safe_js}).then(function(){{'
        f'b.classList.add(\'copied\');b.innerHTML=\'&#10003;&nbsp;Copied\';'
        f'setTimeout(function(){{b.classList.remove(\'copied\');'
        f'b.innerHTML=\'&#9632;&nbsp;Copy Prompt\';}},2000);}});'
        f'}})(document.getElementById(\'{btn_id}\'))">'
        f'&#9632;&nbsp;Copy Prompt</button>',
        unsafe_allow_html=True,
    )


# ══════════════════════════════════════════════════════════════════════════════
# SESSION STATE
# ══════════════════════════════════════════════════════════════════════════════
for _k, _v in [
    ("app_state",      "idle"),
    ("analysis",       ""),
    ("clone_prompt",   ""),
    ("sampler_prompt", ""),
    ("upload_key",     0),      # incrementing this resets the file uploader
]:
    if _k not in st.session_state:
        st.session_state[_k] = _v


# ══════════════════════════════════════════════════════════════════════════════
# API KEY — validate once at startup, show clear error if missing
# ══════════════════════════════════════════════════════════════════════════════
_api_key   = None
_key_error = None
try:
    _api_key = st.secrets.get("GEMINI_KEY", "")
    if not _api_key:
        _key_error = (
            "GEMINI_KEY is not configured. "
            "Go to Streamlit Cloud → your app → Settings → Secrets and add: "
            "GEMINI_KEY = \"your-key-here\""
        )
except Exception:
    _key_error = (
        "Could not read app secrets. "
        "Add GEMINI_KEY in Streamlit Cloud → Settings → Secrets."
    )


# ══════════════════════════════════════════════════════════════════════════════
# RENDER
# ══════════════════════════════════════════════════════════════════════════════
st.markdown('<div class="page">', unsafe_allow_html=True)

# ── HEADER ────────────────────────────────────────────────────────────────────
st.markdown("""
<div class="app-header">
  <div class="header-left">
    <div class="app-eyebrow">130 MODE · Booman Systems</div>
    <div class="app-title">Sample Prompt <span>1200</span></div>
  </div>
  <div class="app-badge">
    <div class="badge-num">130</div>
    <div class="badge-txt">MODE</div>
  </div>
</div>
""", unsafe_allow_html=True)

# ── API KEY ERROR ──────────────────────────────────────────────────────────────
if _key_error:
    st.markdown(
        f'<div class="alert">{html_module.escape(_key_error)}</div>',
        unsafe_allow_html=True,
    )

# ── STATUS BAR ────────────────────────────────────────────────────────────────
_status_map = {
    "idle":  ("idle",   "Ready — drop a sample to begin"),
    "pass1": ("active", "Pass 1 — Reading and analyzing audio..."),
    "pass2": ("active", "Pass 2 — Building prompts from analysis..."),
    "done":  ("done",   "Decode complete — prompts ready to copy"),
    "error": ("error",  "Error — check details below"),
}
_dot, _status_txt = _status_map.get(st.session_state.app_state, ("idle", "Ready"))
status_slot = st.empty()
status_slot.markdown(
    f'<div class="status-bar">'
    f'<div class="status-dot {_dot}"></div>'
    f'<span>{html_module.escape(_status_txt)}</span>'
    f'</div>',
    unsafe_allow_html=True,
)

# ── UPLOAD ────────────────────────────────────────────────────────────────────
st.markdown('<span class="upload-label">Load Sample</span>', unsafe_allow_html=True)
uploaded_file = st.file_uploader(
    "",
    type=["mp3", "wav"],
    label_visibility="collapsed",
    key=f"uploader_{st.session_state.upload_key}",
)

if uploaded_file:
    raw_bytes = uploaded_file.getvalue()
    fname     = html_module.escape(uploaded_file.name)
    fsize     = file_size_str(len(raw_bytes))
    st.markdown(
        f'<div class="file-info">'
        f'<span class="fi-dot">●</span>'
        f'<span class="fi-name">{fname}</span>'
        f'<span class="fi-size">{fsize}</span>'
        f'</div>',
        unsafe_allow_html=True,
    )

# ── ANALYZE BUTTON ────────────────────────────────────────────────────────────
run_btn = st.button(
    "Analyze Sample → Generate Prompts",
    disabled=bool(_key_error),
)

# ── TWO-PASS ANALYSIS ─────────────────────────────────────────────────────────
if uploaded_file and run_btn and not _key_error:
    raw_bytes = uploaded_file.getvalue()
    size_mb   = len(raw_bytes) / 1_048_576

    if size_mb > MAX_FILE_MB:
        st.session_state.app_state = "error"
        status_slot.markdown(
            f'<div class="status-bar"><div class="status-dot error"></div>'
            f'<span>File too large ({size_mb:.1f} MB) — maximum is {MAX_FILE_MB} MB</span></div>',
            unsafe_allow_html=True,
        )
    else:
        ext        = uploaded_file.name.rsplit(".", 1)[-1].lower()
        mime       = "audio/wav" if ext == "wav" else "audio/mpeg"
        b64        = base64.b64encode(raw_bytes).decode("utf-8")
        audio_part = {"inline_data": {"mime_type": mime, "data": b64}}

        try:
            genai.configure(api_key=_api_key)
            model = genai.GenerativeModel("gemini-2.5-flash")

            # PASS 1 — audio analysis
            st.session_state.app_state = "pass1"
            status_slot.markdown(
                '<div class="status-bar"><div class="status-dot active"></div>'
                '<span>Pass 1 — Reading and analyzing audio...</span></div>',
                unsafe_allow_html=True,
            )
            with st.spinner(""):
                r1 = model.generate_content([ANALYSIS_PROMPT, audio_part])
                st.session_state.analysis = (
                    extract_section(r1.text, "ANALYSIS") or r1.text
                )

            # PASS 2 — text-only prompt generation (no audio re-upload)
            st.session_state.app_state = "pass2"
            status_slot.markdown(
                '<div class="status-bar"><div class="status-dot active"></div>'
                '<span>Pass 2 — Building prompts from analysis...</span></div>',
                unsafe_allow_html=True,
            )
            with st.spinner(""):
                r2  = model.generate_content(
                    build_prompt_generation(st.session_state.analysis)
                )
                raw2 = r2.text
                st.session_state.clone_prompt   = cap_prompt(
                    extract_section(raw2, "CLONE PROMPT")
                )
                st.session_state.sampler_prompt = cap_prompt(
                    extract_section(raw2, "SAMPLER PROMPT")
                )

            st.session_state.app_state = "done"
            status_slot.markdown(
                '<div class="status-bar"><div class="status-dot done"></div>'
                '<span>Decode complete — prompts ready to copy</span></div>',
                unsafe_allow_html=True,
            )

        except Exception as e:
            st.session_state.app_state = "error"
            err_msg = friendly_error(e)
            status_slot.markdown(
                f'<div class="status-bar"><div class="status-dot error"></div>'
                f'<span>{html_module.escape(err_msg[:80])}</span></div>',
                unsafe_allow_html=True,
            )
            st.markdown(
                f'<div class="alert">{html_module.escape(err_msg)}</div>',
                unsafe_allow_html=True,
            )


# ── RESULTS ───────────────────────────────────────────────────────────────────
if st.session_state.analysis:
    st.markdown('<div class="divider"></div>', unsafe_allow_html=True)

    # — ANALYSIS —
    st.markdown('<div class="section-label">Sample Analysis</div>', unsafe_allow_html=True)
    render_analysis(st.session_state.analysis)

    # — CLONE PROMPT —
    if st.session_state.clone_prompt:
        n  = len(st.session_state.clone_prompt)
        cc = char_color(n)
        st.markdown(
            f'<div class="section-label" style="margin-top:28px;">Clone Prompt'
            f'<span class="lbadge {cc}">{n} / 700 chars</span></div>'
            f'<div class="prompt-sublabel">Faithful sonic recreation · Suno / Udio / Sampla.ai</div>',
            unsafe_allow_html=True,
        )
        st.text_area(
            "clone",
            value=st.session_state.clone_prompt,
            height=140,
            key="ta_clone",
            label_visibility="collapsed",
        )
        copy_button(st.session_state.clone_prompt, "cb_clone")

    elif st.session_state.app_state == "done":
        st.markdown(
            '<div class="alert">Clone prompt not generated — try analyzing again.</div>',
            unsafe_allow_html=True,
        )

    # — SAMPLER PROMPT —
    if st.session_state.sampler_prompt:
        n  = len(st.session_state.sampler_prompt)
        cc = char_color(n)
        st.markdown(
            f'<div class="section-label" style="margin-top:28px;">Sampler Prompt'
            f'<span class="lbadge {cc}">{n} / 700 chars</span></div>'
            f'<div class="prompt-sublabel">Flip-ready · loopable · choppable · Suno / Udio / Sampla.ai</div>',
            unsafe_allow_html=True,
        )
        st.text_area(
            "sampler",
            value=st.session_state.sampler_prompt,
            height=140,
            key="ta_sampler",
            label_visibility="collapsed",
        )
        copy_button(st.session_state.sampler_prompt, "cb_sampler")

    elif st.session_state.app_state == "done":
        st.markdown(
            '<div class="alert">Sampler prompt not generated — try analyzing again.</div>',
            unsafe_allow_html=True,
        )

    # — RESET —
    st.markdown('<div class="divider"></div>', unsafe_allow_html=True)
    if st.button("↺  New Analysis", key="reset_btn"):
        st.session_state.app_state      = "idle"
        st.session_state.analysis       = ""
        st.session_state.clone_prompt   = ""
        st.session_state.sampler_prompt = ""
        st.session_state.upload_key    += 1   # resets the file uploader widget
        st.rerun()


# ── FOOTER ────────────────────────────────────────────────────────────────────
st.markdown("""
<div class="app-footer">
  <span class="footer-brand">Sample Prompt 1200</span>
  <span>130 MODE · Booman Systems · 2026</span>
</div>
""", unsafe_allow_html=True)

st.markdown('</div>', unsafe_allow_html=True)  # close .page
