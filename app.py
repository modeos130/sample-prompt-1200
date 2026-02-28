import streamlit as st
import google.generativeai as genai
import base64
import re

st.set_page_config(page_title="SP-1200 // 130 MODE", layout="centered")

st.markdown("""
<style>
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700;900&family=Orbitron:wght@400;700;900&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

html, body, .stApp {
    background: #111 !important;
    font-family: 'JetBrains Mono', monospace;
    color: #e0e0e0;
}

header, footer, #MainMenu, .stDeployButton { visibility: hidden !important; }
.block-container { padding: 1rem 1rem 3rem 1rem !important; max-width: 680px !important; }

/* ── UNIT BODY ── */
.sp-unit {
    background: linear-gradient(160deg, #2a2a2a 0%, #1a1a1a 40%, #222 100%);
    border-radius: 16px 16px 10px 10px;
    border: 2px solid #333;
    border-bottom: 6px solid #0a0a0a;
    box-shadow:
        0 0 0 1px #444 inset,
        0 20px 60px rgba(0,0,0,0.9),
        0 4px 0 #000;
    padding: 0;
    overflow: hidden;
    position: relative;
}

/* ── TOP STRIP ── */
.sp-top-strip {
    background: linear-gradient(180deg, #3a3a3a 0%, #2e2e2e 30%, #262626 70%, #1e1e1e 100%);
    border-bottom: 2px solid #111;
    padding: 16px 24px 14px 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: relative;
}
.sp-top-strip::after {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, #555, transparent);
}

/* ── BRANDING ── */
.brand-left {
    display: flex;
    flex-direction: column;
    gap: 1px;
}
.brand-company {
    font-family: 'Orbitron', sans-serif;
    font-size: 9px;
    font-weight: 700;
    color: #888;
    letter-spacing: 4px;
    text-transform: uppercase;
}
.brand-model {
    font-family: 'Orbitron', sans-serif;
    font-size: 26px;
    font-weight: 900;
    color: #c8a84b;
    letter-spacing: 3px;
    text-shadow: 0 0 20px rgba(200,168,75,0.4);
    line-height: 1;
}
.brand-tagline {
    font-family: 'Orbitron', sans-serif;
    font-size: 7px;
    font-weight: 400;
    color: #555;
    letter-spacing: 3px;
    text-transform: uppercase;
    margin-top: 3px;
}

/* ── 130 MODE BADGE ── */
.logo-badge {
    width: 72px; height: 72px;
    border-radius: 50%;
    background: #0a0a0a;
    border: 2px solid #39FF14;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    box-shadow: 0 0 20px rgba(57,255,20,0.5), inset 0 0 10px rgba(57,255,20,0.05);
}
.logo-badge .n130 {
    font-family: 'Orbitron', sans-serif;
    font-size: 22px;
    font-weight: 900;
    color: #39FF14;
    line-height: 1;
    text-shadow: 0 0 10px #39FF14;
}
.logo-badge .mode {
    font-size: 8px;
    font-weight: 700;
    color: #39FF14;
    letter-spacing: 2px;
    text-transform: uppercase;
    text-shadow: 0 0 6px #39FF14;
}

/* ── LCD ── */
.sp-display-zone {
    background: #1a1a1a;
    padding: 16px 24px;
    border-bottom: 2px solid #111;
}
.lcd-outer {
    background: #0c1a0c;
    border: 2px solid #0a0a0a;
    border-radius: 6px;
    padding: 16px 20px;
    min-height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow:
        inset 0 0 30px rgba(0,0,0,0.8),
        inset 0 0 60px rgba(57,255,20,0.04),
        0 2px 4px rgba(0,0,0,0.5);
    position: relative;
    overflow: hidden;
}
.lcd-outer::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background: repeating-linear-gradient(
        0deg,
        rgba(0,0,0,0.03) 0px,
        rgba(0,0,0,0.03) 1px,
        transparent 1px,
        transparent 3px
    );
    pointer-events: none;
}
.lcd-text {
    font-family: 'Orbitron', sans-serif;
    font-size: 14px;
    font-weight: 700;
    color: #39FF14;
    letter-spacing: 4px;
    text-align: center;
    text-shadow: 0 0 10px #39FF14, 0 0 20px rgba(57,255,20,0.5);
    text-transform: uppercase;
    position: relative;
    z-index: 1;
}
.lcd-sub {
    font-size: 9px;
    color: #2a8c2a;
    letter-spacing: 2px;
    margin-top: 6px;
    text-align: center;
    font-family: 'JetBrains Mono', monospace;
}

/* ── DRUM PADS ── */
.sp-pads-zone {
    background: #1e1e1e;
    padding: 18px 24px;
    border-bottom: 2px solid #111;
}
.pads-label {
    font-size: 7px;
    color: #444;
    letter-spacing: 4px;
    text-transform: uppercase;
    margin-bottom: 10px;
    font-family: 'JetBrains Mono', monospace;
}
.pads-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
}
.pad {
    aspect-ratio: 1.2;
    border-radius: 6px;
    background: linear-gradient(145deg, #2c2c2c, #1a1a1a);
    border: 1px solid #333;
    border-bottom: 3px solid #0a0a0a;
    border-right: 2px solid #0a0a0a;
    position: relative;
    overflow: hidden;
    cursor: default;
}
.pad::after {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse at 30% 30%, rgba(255,255,255,0.04), transparent 60%);
}
.pad-num {
    position: absolute;
    bottom: 5px; right: 7px;
    font-size: 8px;
    font-family: 'Orbitron', sans-serif;
    color: #444;
    font-weight: 700;
    z-index: 2;
}
.pad.idle { box-shadow: none; }

.pad.running-1 { animation: padFlash 1.6s ease-in-out 0.0s infinite; }
.pad.running-2 { animation: padFlash 1.6s ease-in-out 0.2s infinite; }
.pad.running-3 { animation: padFlash 1.6s ease-in-out 0.4s infinite; }
.pad.running-4 { animation: padFlash 1.6s ease-in-out 0.6s infinite; }
.pad.running-5 { animation: padFlash 1.6s ease-in-out 0.8s infinite; }
.pad.running-6 { animation: padFlash 1.6s ease-in-out 1.0s infinite; }
.pad.running-7 { animation: padFlash 1.6s ease-in-out 1.2s infinite; }
.pad.running-8 { animation: padFlash 1.6s ease-in-out 1.4s infinite; }

@keyframes padFlash {
    0%, 100% {
        background: linear-gradient(145deg, #2c2c2c, #1a1a1a);
        box-shadow: none; border-color: #333;
    }
    50% {
        background: linear-gradient(145deg, #1a3a1a, #0d200d);
        box-shadow: 0 0 14px rgba(57,255,20,0.7), inset 0 0 8px rgba(57,255,20,0.2);
        border-color: #39FF14;
    }
}

.pad.done-1 { animation: padPulse 3s ease-in-out 0.0s infinite; }
.pad.done-2 { animation: padPulse 3s ease-in-out 0.3s infinite; }
.pad.done-3 { animation: padPulse 3s ease-in-out 0.6s infinite; }
.pad.done-4 { animation: padPulse 3s ease-in-out 0.9s infinite; }
.pad.done-5 { animation: padPulse 3s ease-in-out 1.2s infinite; }
.pad.done-6 { animation: padPulse 3s ease-in-out 1.5s infinite; }
.pad.done-7 { animation: padPulse 3s ease-in-out 1.8s infinite; }
.pad.done-8 { animation: padPulse 3s ease-in-out 2.1s infinite; }

@keyframes padPulse {
    0%, 100% {
        background: linear-gradient(145deg, #1a3a1a, #0d200d);
        box-shadow: 0 0 10px rgba(57,255,20,0.5), inset 0 0 5px rgba(57,255,20,0.1);
        border-color: #39FF14;
    }
    50% {
        background: linear-gradient(145deg, #1f4a1f, #112511);
        box-shadow: 0 0 22px rgba(57,255,20,0.9), inset 0 0 10px rgba(57,255,20,0.25);
        border-color: #39FF14;
    }
}

.pad.error {
    background: linear-gradient(145deg, #3a1a1a, #200d0d) !important;
    box-shadow: 0 0 12px rgba(255,60,60,0.6), inset 0 0 6px rgba(255,60,60,0.15) !important;
    border-color: #ff3c3c !important;
    animation: padError 0.8s ease-in-out infinite !important;
}
@keyframes padError {
    0%, 100% { box-shadow: 0 0 8px rgba(255,60,60,0.4); }
    50%       { box-shadow: 0 0 20px rgba(255,60,60,0.9); }
}

/* ── KNOBS ROW ── */
.sp-controls {
    background: #1a1a1a;
    padding: 12px 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 2px solid #111;
    gap: 16px;
}
.knobs-row { display: flex; gap: 14px; align-items: center; }
.knob-wrap { display: flex; flex-direction: column; align-items: center; gap: 4px; }
.knob {
    width: 30px; height: 30px;
    border-radius: 50%;
    background: radial-gradient(circle at 35% 30%, #4a4a4a, #1a1a1a);
    border: 2px solid #111;
    box-shadow: 0 2px 4px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.08);
    position: relative;
}
.knob::after {
    content: '';
    position: absolute;
    top: 4px; left: 50%;
    transform: translateX(-50%);
    width: 2px; height: 7px;
    background: #c8a84b;
    border-radius: 1px;
}
.knob-label { font-size: 7px; color: #555; letter-spacing: 1px; text-transform: uppercase; font-family: 'JetBrains Mono', monospace; }

/* ── FILE LOADER ── */
.sp-loader {
    background: #1c1c1c;
    padding: 12px 24px;
    border-bottom: 2px solid #111;
}
.loader-label {
    font-size: 7px; color: #555;
    letter-spacing: 3px; text-transform: uppercase;
    margin-bottom: 8px;
    font-family: 'JetBrains Mono', monospace;
}

/* ── CONVERT BUTTON ZONE — on-machine panel ── */
.sp-convert-panel {
    background: linear-gradient(180deg, #1c1c1c 0%, #161616 100%);
    border-top: 1px solid #2a2a2a;
    padding: 16px 24px 22px 24px;
    display: flex;
    flex-direction: column;
    gap: 6px;
}
.convert-instruction {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 6px;
}
.convert-step {
    font-family: 'JetBrains Mono', monospace;
    font-size: 8px;
    color: #555;
    letter-spacing: 2px;
    text-transform: uppercase;
    line-height: 1.5;
}
.convert-arrow {
    color: #39FF14;
    font-size: 10px;
}
.convert-tag {
    font-family: 'Orbitron', sans-serif;
    font-size: 7px;
    font-weight: 700;
    color: #39FF14;
    letter-spacing: 3px;
    text-transform: uppercase;
    border: 1px solid #39FF14;
    border-radius: 3px;
    padding: 2px 6px;
    opacity: 0.7;
}

/* Streamlit widget overrides */
.stFileUploader {
    background: #111 !important;
    border: 1px dashed #39FF14 !important;
    border-radius: 8px !important;
    padding: 4px !important;
}

.stButton > button {
    background: linear-gradient(180deg, #242424 0%, #161616 100%) !important;
    color: #39FF14 !important;
    border: 1px solid #2a2a2a !important;
    border-top: 1px solid #333 !important;
    border-bottom: 5px solid #060606 !important;
    border-radius: 10px !important;
    font-family: 'Orbitron', sans-serif !important;
    font-weight: 900 !important;
    font-size: 12px !important;
    letter-spacing: 3px !important;
    height: auto !important;
    min-height: 70px !important;
    width: 100% !important;
    text-transform: uppercase !important;
    box-shadow: 0 4px 20px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04) !important;
    transition: all 0.1s !important;
    white-space: normal !important;
    line-height: 1.4 !important;
    padding: 12px 16px !important;
}
.stButton > button:hover {
    box-shadow: 0 0 24px rgba(57,255,20,0.25), 0 4px 20px rgba(0,0,0,0.6) !important;
    border-color: #39FF14 !important;
    color: #39FF14 !important;
}
.stButton > button:active {
    border-bottom: 2px solid #060606 !important;
    transform: translateY(3px) !important;
}

/* ── RESULTS ── */
.results-outer { margin-top: 20px; }
.section-label {
    font-size: 8px;
    color: #c8a84b;
    letter-spacing: 4px;
    text-transform: uppercase;
    font-family: 'Orbitron', sans-serif;
    margin: 20px 0 8px 0;
    padding-bottom: 5px;
    border-bottom: 1px solid #252525;
    display: flex;
    align-items: center;
    gap: 8px;
}
.section-label::before { content: '▶'; color: #39FF14; font-size: 8px; }

.analysis-block {
    background: #0d0d0d;
    border: 1px solid #222;
    border-left: 3px solid #c8a84b;
    border-radius: 6px;
    padding: 16px 18px;
    font-size: 11.5px;
    line-height: 1.9;
    color: #bbb;
    white-space: pre-wrap;
    word-break: break-word;
    font-family: 'JetBrains Mono', monospace;
}

.stTextArea textarea {
    background-color: #080808 !important;
    color: #39FF14 !important;
    border: 1px solid #333 !important;
    border-left: 3px solid #39FF14 !important;
    border-radius: 6px !important;
    font-family: 'JetBrains Mono', monospace !important;
    font-size: 12px !important;
    line-height: 1.7 !important;
    padding: 14px !important;
    box-shadow: inset 0 0 20px rgba(57,255,20,0.03) !important;
    resize: vertical !important;
}
.stTextArea label { display: none !important; }

.neon-divider { border: none; border-top: 1px solid #1d1d1d; margin: 22px 0; }

.sp-footer {
    text-align: center;
    margin-top: 28px;
    font-size: 7px;
    color: #2a2a2a;
    letter-spacing: 4px;
    font-family: 'Orbitron', sans-serif;
    text-transform: uppercase;
}
.stSpinner > div { border-top-color: #39FF14 !important; }
</style>
""", unsafe_allow_html=True)

# ── PROMPT ─────────────────────────────────────────────────────────────────────
MASTER_PROMPT = """
You are an expert music analyst for sample-based hip-hop producers.
Analyze this audio strictly for musical and production elements.

CONTEXT:
- Use case: drumless sample chopping, boom bap flipping, AI recreation via Suno and Udio
- NEVER include drums, beats, kick, snare, hi-hats, or any rhythmic percussion anywhere
- Focus entirely on: melody, harmony, chord texture, mood, timbre, instrumentation, vocal feel, arrangement

OUTPUT FORMAT — use these exact section headers with ## prefix. Nothing else.

## ANALYSIS
BPM: [tight 2-number range e.g. 88–92]
Groove: [straight / swung / triplet — with nuance about the feel]
Key: [key + mode e.g. F minor, Dorian, Mixolydian]
Chord Movement: [describe progressions, cycles, harmonic tendencies in plain language]
Vocal Tone: [texture, register, delivery style — or "No vocals detected"]
Arrangement Arc: [how energy and instrumentation evolve — intro through peak through resolution]
Emotional Intensity: [map the emotional journey low→high, with rough timestamps if detectable]
Flip Directions:
A. [a specific alternate production direction for this exact sample]
B. [another direction — different tempo, key shift, genre pivot, etc.]
C. [a third creative direction]

## SUNO PROMPT (DETAILED)
Write a single flowing paragraph — NO bullet points, NO line breaks, NO headers. HARD CAP: 1000 characters total. Follow this exact structural order, adapted to what you actually heard in the audio:

1. ERA + RECORDING STYLE: Identify the decade and recording aesthetic (e.g. "Vintage 1970s soul recording", "Late 80s R&B studio session", "Early 2000s neo-soul ballad", "Classic 90s boom bap instrumental") — match what the audio actually sounds like
2. PRODUCTION TEXTURE: Name the sonic patina — analog tape saturation, lo-fi vinyl warmth, digital clarity, cassette warmth, studio sheen — whatever the audio has
3. TEMPO FEEL: Describe the pace and feel — slow burn, mid-tempo groove, languid — plus the BPM range
4. INSTRUMENTATION: List only the instruments actually heard — NO drums, NO percussion, NO beats, NO rhythm section hits
5. VOCAL CHARACTER: If vocals are present describe tone, register, and style. If no vocals write: "no vocals, purely instrumental"
6. SONIC TEXTURE + IMPERFECTIONS: reverb character, room ambience, vinyl crackle, wow and flutter, human timing imperfections, breath, warmth
7. MOOD: Two or three strong descriptors — dark, pensive, melancholic, triumphant, euphoric, tense, nostalgic, brooding
8. SAMPLE PURPOSE CLOSER: End with "designed to feel loopable" plus one sentence on what kind of producer or genre would chop and flip this record

CRITICAL: No drums. No percussion. No beats. Stay under 1000 characters including spaces.

## SUNO PROMPT (MINIMAL)
[Two sentences max. Under 300 characters total. Drumless. Hit era + key instruments + core mood only. Ready to paste directly into Suno or Udio.]

## UDIO PROMPT
[Udio responds best to tags + one sentence. Line 1: comma-separated genre/mood/era/instrument tags — no drums. Line 2: one production direction sentence under 180 characters. Drumless only.]
""".strip()


def extract_section(text, header):
    pattern = rf"##\s*{re.escape(header)}\s*\n(.*?)(?=\n##\s|\Z)"
    match = re.search(pattern, text, re.DOTALL | re.IGNORECASE)
    return match.group(1).strip() if match else ""


def render_pads(state="idle"):
    pads_html = '<div class="pads-grid">'
    for i in range(1, 9):
        if state in ("running", "done"):
            cls = f"pad {state}-{i}"
        elif state == "error":
            cls = "pad error"
        else:
            cls = "pad idle"
        pads_html += f'<div class="{cls}"><span class="pad-num">{i}</span></div>'
    pads_html += '</div>'
    return pads_html


def render_lcd(line1, line2=""):
    sub = f'<div class="lcd-sub">{line2}</div>' if line2 else ""
    return f'<div class="lcd-outer"><div><div class="lcd-text">{line1}</div>{sub}</div></div>'


def render_knobs():
    labels = ["TUNE", "CUTOFF", "LEVEL", "PITCH"]
    knobs = "".join(
        f'<div class="knob-wrap"><div class="knob"></div><div class="knob-label">{l}</div></div>'
        for l in labels
    )
    return f'<div class="knobs-row">{knobs}</div>'


# ── SESSION STATE ──────────────────────────────────────────────────────────────
for key, default in [
    ("pad_state", "idle"), ("analysis", ""),
    ("suno_detail", ""), ("suno_minimal", ""), ("udio_prompt", "")
]:
    if key not in st.session_state:
        st.session_state[key] = default

# ── RENDER MACHINE ─────────────────────────────────────────────────────────────
st.markdown('<div class="sp-unit">', unsafe_allow_html=True)

# ── TOP STRIP: BOOMAN SYSTEMS / SP-1200 / SAMPLE PROMPT 1200 ──────────────────
st.markdown("""
<div class="sp-top-strip">
    <div class="brand-left">
        <div class="brand-company">Booman Systems</div>
        <div class="brand-model">SP-1200</div>
        <div class="brand-tagline">Sample Prompt 1200</div>
    </div>
    <div class="logo-badge">
        <div class="n130">130</div>
        <div class="mode">MODE</div>
    </div>
</div>
""", unsafe_allow_html=True)

# ── LCD ────────────────────────────────────────────────────────────────────────
st.markdown('<div class="sp-display-zone">', unsafe_allow_html=True)
lcd_slot = st.empty()
state = st.session_state.pad_state
if state == "idle":
    lcd_slot.markdown(render_lcd("READY // BANK A", "load sample to begin"), unsafe_allow_html=True)
elif state == "running":
    lcd_slot.markdown(render_lcd("ANALYZING...", "quantizing sample data"), unsafe_allow_html=True)
elif state == "done":
    lcd_slot.markdown(render_lcd("DECODE COMPLETE", "prompts ready to copy"), unsafe_allow_html=True)
elif state == "error":
    lcd_slot.markdown(render_lcd("HARDWARE ERROR", "check console"), unsafe_allow_html=True)
st.markdown('</div>', unsafe_allow_html=True)

# ── PADS ───────────────────────────────────────────────────────────────────────
st.markdown('<div class="sp-pads-zone">', unsafe_allow_html=True)
st.markdown('<div class="pads-label">Sample Bank A — Drum Pads</div>', unsafe_allow_html=True)
pads_slot = st.empty()
pads_slot.markdown(render_pads(st.session_state.pad_state), unsafe_allow_html=True)
st.markdown('</div>', unsafe_allow_html=True)

# ── KNOBS ──────────────────────────────────────────────────────────────────────
st.markdown(f"""
<div class="sp-controls">
    {render_knobs()}
    <div style="text-align:right;">
        <div style="font-size:7px; color:#333; letter-spacing:2px; font-family:'JetBrains Mono',monospace;">12-BIT LINEAR</div>
        <div style="font-size:7px; color:#2a2a2a; letter-spacing:1px; font-family:'JetBrains Mono',monospace; margin-top:2px;">44.1kHz SAMPLE RATE</div>
    </div>
</div>
""", unsafe_allow_html=True)

# ── FILE LOADER ────────────────────────────────────────────────────────────────
st.markdown('<div class="sp-loader">', unsafe_allow_html=True)
st.markdown('<div class="loader-label">① Load Sample — MP3 / WAV</div>', unsafe_allow_html=True)
uploaded_file = st.file_uploader("", type=["mp3", "wav"])
st.markdown('</div>', unsafe_allow_html=True)

# ── CONVERT BUTTON — on-machine panel ─────────────────────────────────────────
st.markdown('<div class="sp-convert-panel">', unsafe_allow_html=True)
st.markdown("""
<div class="convert-instruction">
    <span class="convert-step">② Drop sample above</span>
    <span class="convert-arrow">→</span>
    <span class="convert-step">Press button below</span>
    <span class="convert-arrow">→</span>
    <span class="convert-tag">CONVERT TO PROMPT</span>
</div>
""", unsafe_allow_html=True)

run_btn = st.button("⬡  ANALYZE SAMPLE → CONVERT TO PROMPT")
st.markdown('</div>', unsafe_allow_html=True)

st.markdown('</div>', unsafe_allow_html=True)  # close sp-unit

# ── RUN ANALYSIS ───────────────────────────────────────────────────────────────
if uploaded_file and run_btn:
    st.session_state.pad_state = "running"
    lcd_slot.markdown(render_lcd("ANALYZING...", "quantizing sample data"), unsafe_allow_html=True)
    pads_slot.markdown(render_pads("running"), unsafe_allow_html=True)

    with st.spinner(""):
        try:
            genai.configure(api_key=st.secrets["GEMINI_KEY"])
            model = genai.GenerativeModel("gemini-2.5-flash")

            ext   = uploaded_file.name.rsplit(".", 1)[-1].lower()
            mime  = "audio/wav" if ext == "wav" else "audio/mpeg"
            b64   = base64.b64encode(uploaded_file.getvalue()).decode("utf-8")
            audio = {"inline_data": {"mime_type": mime, "data": b64}}

            response = model.generate_content([MASTER_PROMPT, audio])
            result   = response.text

            st.session_state.analysis     = extract_section(result, "ANALYSIS") or result
            suno_raw = extract_section(result, "SUNO PROMPT (DETAILED)")
            # Hard-cap at 1000 characters — Suno style field limit
            if len(suno_raw) > 1000:
                suno_raw = suno_raw[:997].rsplit(" ", 1)[0] + "..."
            st.session_state.suno_detail  = suno_raw
            st.session_state.suno_minimal = extract_section(result, "SUNO PROMPT (MINIMAL)")
            st.session_state.udio_prompt  = extract_section(result, "UDIO PROMPT")
            st.session_state.pad_state    = "done"

        except Exception as e:
            st.session_state.pad_state = "error"
            lcd_slot.markdown(render_lcd("HARDWARE ERROR", str(e)[:40]), unsafe_allow_html=True)
            pads_slot.markdown(render_pads("error"), unsafe_allow_html=True)
            st.error(f"Error: {str(e)}")

    if st.session_state.pad_state == "done":
        lcd_slot.markdown(render_lcd("DECODE COMPLETE", "prompts ready to copy"), unsafe_allow_html=True)
        pads_slot.markdown(render_pads("done"), unsafe_allow_html=True)

# ── RESULTS ────────────────────────────────────────────────────────────────────
if st.session_state.analysis:
    st.markdown('<div class="results-outer">', unsafe_allow_html=True)

    st.markdown('<div class="section-label">Sample Analysis</div>', unsafe_allow_html=True)
    st.markdown(f'<div class="analysis-block">{st.session_state.analysis}</div>', unsafe_allow_html=True)

    st.markdown('<hr class="neon-divider">', unsafe_allow_html=True)

    if st.session_state.suno_detail:
        char_count = len(st.session_state.suno_detail)
        char_color = "#ff4444" if char_count > 1000 else "#39FF14"
        st.markdown(
            f'<div class="section-label">Suno Prompt — Detailed &nbsp;· tap → select all → copy'
            f'<span style="margin-left:auto; font-family:JetBrains Mono,monospace; font-size:8px; color:{char_color};">{char_count}/1000 chars</span></div>',
            unsafe_allow_html=True
        )
        st.text_area("", value=st.session_state.suno_detail, height=210, key="sd", label_visibility="collapsed")

    if st.session_state.suno_minimal:
        st.markdown('<div class="section-label">Suno Prompt — Minimal &nbsp;· tap → select all → copy</div>', unsafe_allow_html=True)
        st.text_area("", value=st.session_state.suno_minimal, height=120, key="sm", label_visibility="collapsed")

    if st.session_state.udio_prompt:
        st.markdown('<div class="section-label">Udio Prompt &nbsp;· tap → select all → copy</div>', unsafe_allow_html=True)
        st.text_area("", value=st.session_state.udio_prompt, height=120, key="up", label_visibility="collapsed")

    st.markdown('</div>', unsafe_allow_html=True)

st.markdown('<div class="sp-footer">12-Bit Linear &nbsp;·&nbsp; 130 MODE © 2026 &nbsp;·&nbsp; Booman Systems</div>', unsafe_allow_html=True)
