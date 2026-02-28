import streamlit as st
import google.generativeai as genai
import base64
import re

st.set_page_config(page_title="SP-1200 // 130 MODE", layout="centered")

# ── CSS ────────────────────────────────────────────────────────────────────────
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

/* brushed metal top strip */
.sp-top-strip {
    background: linear-gradient(180deg,
        #3a3a3a 0%, #2e2e2e 30%, #262626 70%, #1e1e1e 100%);
    border-bottom: 2px solid #111;
    padding: 18px 24px 14px 24px;
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
    gap: 2px;
}
.brand-emu {
    font-family: 'Orbitron', sans-serif;
    font-size: 10px;
    font-weight: 700;
    color: #888;
    letter-spacing: 5px;
    text-transform: uppercase;
}
.brand-model {
    font-family: 'Orbitron', sans-serif;
    font-size: 22px;
    font-weight: 900;
    color: #c8a84b;
    letter-spacing: 3px;
    text-shadow: 0 0 20px rgba(200,168,75,0.4);
    line-height: 1;
}

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

/* ── LCD DISPLAY ── */
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
    font-weight: 400;
    color: #2a8c2a;
    letter-spacing: 2px;
    margin-top: 6px;
    text-align: center;
    font-family: 'JetBrains Mono', monospace;
}

/* ── DRUM PADS ── */
.sp-pads-zone {
    background: #1e1e1e;
    padding: 20px 24px;
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
    transition: all 0.1s;
    cursor: default;
}
.pad::after {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse at 30% 30%, rgba(255,255,255,0.04), transparent 60%);
}
/* pad number labels */
.pad-num {
    position: absolute;
    bottom: 5px;
    right: 7px;
    font-size: 8px;
    font-family: 'Orbitron', sans-serif;
    color: #444;
    font-weight: 700;
    z-index: 2;
}

/* IDLE — subtle amber breathing */
.pad.idle {
    box-shadow: none;
}

/* RUNNING — sequence flash green */
.pad.running-1  { animation: padFlash 1.6s ease-in-out 0.0s infinite; }
.pad.running-2  { animation: padFlash 1.6s ease-in-out 0.2s infinite; }
.pad.running-3  { animation: padFlash 1.6s ease-in-out 0.4s infinite; }
.pad.running-4  { animation: padFlash 1.6s ease-in-out 0.6s infinite; }
.pad.running-5  { animation: padFlash 1.6s ease-in-out 0.8s infinite; }
.pad.running-6  { animation: padFlash 1.6s ease-in-out 1.0s infinite; }
.pad.running-7  { animation: padFlash 1.6s ease-in-out 1.2s infinite; }
.pad.running-8  { animation: padFlash 1.6s ease-in-out 1.4s infinite; }

@keyframes padFlash {
    0%, 100% {
        background: linear-gradient(145deg, #2c2c2c, #1a1a1a);
        box-shadow: none;
        border-color: #333;
    }
    50% {
        background: linear-gradient(145deg, #1a3a1a, #0d200d);
        box-shadow: 0 0 14px rgba(57,255,20,0.7), inset 0 0 8px rgba(57,255,20,0.2);
        border-color: #39FF14;
    }
}

/* DONE — all pads lit steady */
.pad.done {
    background: linear-gradient(145deg, #1a3a1a, #0d200d);
    box-shadow: 0 0 12px rgba(57,255,20,0.6), inset 0 0 6px rgba(57,255,20,0.15);
    border-color: #39FF14;
    animation: padPulse 3s ease-in-out infinite;
}
.pad.done-1 { animation-delay: 0.0s; }
.pad.done-2 { animation-delay: 0.3s; }
.pad.done-3 { animation-delay: 0.6s; }
.pad.done-4 { animation-delay: 0.9s; }
.pad.done-5 { animation-delay: 1.2s; }
.pad.done-6 { animation-delay: 1.5s; }
.pad.done-7 { animation-delay: 1.8s; }
.pad.done-8 { animation-delay: 2.1s; }

@keyframes padPulse {
    0%, 100% { box-shadow: 0 0 10px rgba(57,255,20,0.5), inset 0 0 5px rgba(57,255,20,0.1); }
    50%       { box-shadow: 0 0 20px rgba(57,255,20,0.9), inset 0 0 10px rgba(57,255,20,0.25); }
}

/* ERROR — red flash all pads */
.pad.error {
    background: linear-gradient(145deg, #3a1a1a, #200d0d);
    box-shadow: 0 0 12px rgba(255,60,60,0.6), inset 0 0 6px rgba(255,60,60,0.15);
    border-color: #ff3c3c;
    animation: padError 0.8s ease-in-out infinite;
}
@keyframes padError {
    0%, 100% { box-shadow: 0 0 8px rgba(255,60,60,0.4); }
    50%       { box-shadow: 0 0 20px rgba(255,60,60,0.9); }
}

/* ── CONTROLS ZONE ── */
.sp-controls {
    background: #1a1a1a;
    padding: 14px 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 2px solid #111;
    gap: 16px;
}
.knobs-row {
    display: flex;
    gap: 14px;
    align-items: center;
}
.knob-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
}
.knob {
    width: 32px; height: 32px;
    border-radius: 50%;
    background: radial-gradient(circle at 35% 30%, #4a4a4a, #1a1a1a);
    border: 2px solid #111;
    box-shadow: 0 2px 4px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.08);
    position: relative;
}
.knob::after {
    content: '';
    position: absolute;
    top: 4px;
    left: 50%;
    transform: translateX(-50%);
    width: 2px; height: 8px;
    background: #c8a84b;
    border-radius: 1px;
}
.knob-label {
    font-size: 7px;
    color: #555;
    letter-spacing: 1px;
    text-transform: uppercase;
    font-family: 'JetBrains Mono', monospace;
}

/* ── FILE LOADER ZONE ── */
.sp-loader {
    background: #1c1c1c;
    padding: 14px 24px;
    border-bottom: 2px solid #111;
}
.loader-label {
    font-size: 7px;
    color: #555;
    letter-spacing: 3px;
    text-transform: uppercase;
    margin-bottom: 8px;
    font-family: 'JetBrains Mono', monospace;
}

/* ── ANALYZE BUTTON ZONE ── */
.sp-button-zone {
    background: #1a1a1a;
    padding: 14px 24px 20px 24px;
}

/* Streamlit component overrides */
.stFileUploader {
    background: #111 !important;
    border: 1px dashed #39FF14 !important;
    border-radius: 8px !important;
    padding: 6px !important;
}
.stFileUploader label { color: #555 !important; font-size: 11px !important; }

.stButton > button {
    background: linear-gradient(180deg, #2a2a2a, #1a1a1a) !important;
    color: #39FF14 !important;
    border: 1px solid #333 !important;
    border-bottom: 5px solid #080808 !important;
    border-radius: 8px !important;
    font-family: 'Orbitron', sans-serif !important;
    font-weight: 900 !important;
    font-size: 13px !important;
    letter-spacing: 4px !important;
    height: 64px !important;
    width: 100% !important;
    text-transform: uppercase !important;
    box-shadow: 0 4px 20px rgba(0,0,0,0.5) !important;
    transition: all 0.1s !important;
}
.stButton > button:hover {
    box-shadow: 0 0 20px rgba(57,255,20,0.3) !important;
    border-color: #39FF14 !important;
}
.stButton > button:active {
    border-bottom: 2px solid #080808 !important;
    transform: translateY(3px) !important;
}

/* ── RESULTS ── */
.results-outer {
    margin-top: 20px;
}
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
.section-label::before {
    content: '▶';
    color: #39FF14;
    font-size: 8px;
}

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

.neon-divider {
    border: none;
    border-top: 1px solid #1d1d1d;
    margin: 22px 0;
}

/* ── FOOTER ── */
.sp-footer {
    text-align: center;
    margin-top: 28px;
    font-size: 7px;
    color: #2a2a2a;
    letter-spacing: 4px;
    font-family: 'Orbitron', sans-serif;
    text-transform: uppercase;
}

/* spinner */
.stSpinner > div { border-top-color: #39FF14 !important; }
</style>
""", unsafe_allow_html=True)

# ── PROMPT ─────────────────────────────────────────────────────────────────────
MASTER_PROMPT = """
You are an expert music analyst for sample-based hip-hop producers.
Analyze this audio strictly for musical and production elements.

CONTEXT:
- Use case: drumless sample chopping, boom bap flipping, AI recreation via Suno and Udio
- DO NOT include drums, beats, kick, snare, hi-hats, or any rhythmic percussion in ANY prompt
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
[One highly detailed, production-rich Suno prompt. Drumless only — no drums, percussion, or beats mentioned anywhere. Describe: instrumentation, harmonic texture, mood and emotional arc, tempo feel, vocal style and tone if vocals present, era and genre influence, production aesthetic. Single flowing descriptive paragraph — no bullet points. Specific and evocative enough to faithfully recreate the vibe. Ready to paste directly into Suno.]

## SUNO PROMPT (MINIMAL)
[Compressed 2–3 sentence version of the detailed prompt. Drumless. Essential vibe only. Ready to paste into Suno or Udio.]

## UDIO PROMPT
[Udio-optimized. Line 1: comma-separated style/mood/genre/instrument tags. Line 2: one directional sentence. Drumless only.]
""".strip()


def extract_section(text, header):
    pattern = rf"##\s*{re.escape(header)}\s*\n(.*?)(?=\n##\s|\Z)"
    match = re.search(pattern, text, re.DOTALL | re.IGNORECASE)
    return match.group(1).strip() if match else ""


def render_pads(state="idle"):
    """Render 8 drum pads with state classes."""
    pads_html = '<div class="pads-grid">'
    for i in range(1, 9):
        cls = f"pad {state}-{i}" if state in ("running", "done") else f"pad {'error' if state == 'error' else 'idle'}"
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
if "pad_state" not in st.session_state:
    st.session_state.pad_state = "idle"
if "analysis" not in st.session_state:
    st.session_state.analysis = ""
if "suno_detail" not in st.session_state:
    st.session_state.suno_detail = ""
if "suno_minimal" not in st.session_state:
    st.session_state.suno_minimal = ""
if "udio_prompt" not in st.session_state:
    st.session_state.udio_prompt = ""

# ── RENDER UNIT ────────────────────────────────────────────────────────────────
st.markdown('<div class="sp-unit">', unsafe_allow_html=True)

# TOP STRIP
st.markdown(f"""
<div class="sp-top-strip">
    <div class="brand-left">
        <div class="brand-emu">E-MU Systems</div>
        <div class="brand-model">SP-1200</div>
    </div>
    <div class="logo-badge">
        <div class="n130">130</div>
        <div class="mode">MODE</div>
    </div>
</div>
""", unsafe_allow_html=True)

# LCD
st.markdown('<div class="sp-display-zone">', unsafe_allow_html=True)
lcd_slot = st.empty()

if st.session_state.pad_state == "idle":
    lcd_slot.markdown(render_lcd("READY // BANK A", "load sample to begin"), unsafe_allow_html=True)
elif st.session_state.pad_state == "running":
    lcd_slot.markdown(render_lcd("ANALYZING...", "quantizing sample data"), unsafe_allow_html=True)
elif st.session_state.pad_state == "done":
    lcd_slot.markdown(render_lcd("DECODE COMPLETE", "prompts ready to copy"), unsafe_allow_html=True)
elif st.session_state.pad_state == "error":
    lcd_slot.markdown(render_lcd("HARDWARE ERROR", "check console"), unsafe_allow_html=True)

st.markdown('</div>', unsafe_allow_html=True)

# PADS
st.markdown('<div class="sp-pads-zone">', unsafe_allow_html=True)
st.markdown('<div class="pads-label">Drum Pads — Sample Bank A</div>', unsafe_allow_html=True)
pads_slot = st.empty()
pads_slot.markdown(render_pads(st.session_state.pad_state), unsafe_allow_html=True)
st.markdown('</div>', unsafe_allow_html=True)

# KNOBS + secondary controls
st.markdown(f"""
<div class="sp-controls">
    {render_knobs()}
    <div style="text-align:right;">
        <div style="font-size:7px; color:#444; letter-spacing:2px; font-family:'JetBrains Mono',monospace;">BOOMAN SYSTEMS</div>
        <div style="font-size:7px; color:#333; letter-spacing:2px; font-family:'JetBrains Mono',monospace; margin-top:2px;">12-BIT LINEAR</div>
    </div>
</div>
""", unsafe_allow_html=True)

# FILE LOADER
st.markdown('<div class="sp-loader">', unsafe_allow_html=True)
st.markdown('<div class="loader-label">Load Sample Disk — MP3 / WAV</div>', unsafe_allow_html=True)
uploaded_file = st.file_uploader("", type=["mp3", "wav"])
st.markdown('</div>', unsafe_allow_html=True)

# ANALYZE BUTTON
st.markdown('<div class="sp-button-zone">', unsafe_allow_html=True)
run_btn = st.button("⬡  Run 12-Bit Analysis")
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
            st.session_state.suno_detail  = extract_section(result, "SUNO PROMPT (DETAILED)")
            st.session_state.suno_minimal = extract_section(result, "SUNO PROMPT (MINIMAL)")
            st.session_state.udio_prompt  = extract_section(result, "UDIO PROMPT")
            st.session_state.pad_state    = "done"

        except Exception as e:
            st.session_state.pad_state = "error"
            lcd_slot.markdown(render_lcd("HARDWARE ERROR", str(e)[:40]), unsafe_allow_html=True)
            pads_slot.markdown(render_pads("error"), unsafe_allow_html=True)
            st.error(f"Error: {str(e)}")

    # Update LCD + pads post-run
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
        st.markdown('<div class="section-label">Suno Prompt — Detailed &nbsp;· tap → select all → copy</div>', unsafe_allow_html=True)
        st.text_area("", value=st.session_state.suno_detail, height=210, key="sd", label_visibility="collapsed")

    if st.session_state.suno_minimal:
        st.markdown('<div class="section-label">Suno Prompt — Minimal &nbsp;· tap → select all → copy</div>', unsafe_allow_html=True)
        st.text_area("", value=st.session_state.suno_minimal, height=120, key="sm", label_visibility="collapsed")

    if st.session_state.udio_prompt:
        st.markdown('<div class="section-label">Udio Prompt &nbsp;· tap → select all → copy</div>', unsafe_allow_html=True)
        st.text_area("", value=st.session_state.udio_prompt, height=120, key="up", label_visibility="collapsed")

    st.markdown('</div>', unsafe_allow_html=True)

st.markdown('<div class="sp-footer">12-Bit Linear &nbsp;·&nbsp; 130 MODE © 2026 &nbsp;·&nbsp; Booman Systems</div>', unsafe_allow_html=True)
