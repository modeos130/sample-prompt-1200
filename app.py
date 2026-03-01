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

.sp-unit {
    background: linear-gradient(160deg, #2a2a2a 0%, #1a1a1a 40%, #222 100%);
    border-radius: 16px 16px 10px 10px;
    border: 2px solid #333;
    border-bottom: 6px solid #0a0a0a;
    box-shadow: 0 0 0 1px #444 inset, 0 20px 60px rgba(0,0,0,0.9), 0 4px 0 #000;
    padding: 0;
    overflow: hidden;
    position: relative;
}

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

.brand-left { display: flex; flex-direction: column; gap: 1px; }
.brand-company {
    font-family: 'Orbitron', sans-serif;
    font-size: 9px; font-weight: 700;
    color: #888; letter-spacing: 4px; text-transform: uppercase;
}
.brand-model {
    font-family: 'Orbitron', sans-serif;
    font-size: 26px; font-weight: 900;
    color: #c8a84b; letter-spacing: 3px;
    text-shadow: 0 0 20px rgba(200,168,75,0.4); line-height: 1;
}
.brand-tagline {
    font-family: 'Orbitron', sans-serif;
    font-size: 7px; font-weight: 400;
    color: #555; letter-spacing: 3px;
    text-transform: uppercase; margin-top: 3px;
}

.logo-badge {
    width: 72px; height: 72px;
    border-radius: 50%; background: #0a0a0a;
    border: 2px solid #39FF14;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    box-shadow: 0 0 20px rgba(57,255,20,0.5), inset 0 0 10px rgba(57,255,20,0.05);
}
.logo-badge .n130 {
    font-family: 'Orbitron', sans-serif;
    font-size: 22px; font-weight: 900;
    color: #39FF14; line-height: 1;
    text-shadow: 0 0 10px #39FF14;
}
.logo-badge .mode {
    font-size: 8px; font-weight: 700;
    color: #39FF14; letter-spacing: 2px;
    text-transform: uppercase; text-shadow: 0 0 6px #39FF14;
}

.sp-display-zone {
    background: #1a1a1a;
    padding: 16px 24px;
    border-bottom: 2px solid #111;
}
.lcd-outer {
    background: #0c1a0c;
    border: 2px solid #0a0a0a;
    border-radius: 6px; padding: 16px 20px;
    min-height: 80px;
    display: flex; align-items: center; justify-content: center;
    box-shadow: inset 0 0 30px rgba(0,0,0,0.8), inset 0 0 60px rgba(57,255,20,0.04), 0 2px 4px rgba(0,0,0,0.5);
    position: relative; overflow: hidden;
}
.lcd-outer::before {
    content: '';
    position: absolute; top: 0; left: 0; right: 0; bottom: 0;
    background: repeating-linear-gradient(0deg, rgba(0,0,0,0.03) 0px, rgba(0,0,0,0.03) 1px, transparent 1px, transparent 3px);
    pointer-events: none;
}
.lcd-text {
    font-family: 'Orbitron', sans-serif;
    font-size: 14px; font-weight: 700;
    color: #39FF14; letter-spacing: 4px; text-align: center;
    text-shadow: 0 0 10px #39FF14, 0 0 20px rgba(57,255,20,0.5);
    text-transform: uppercase; position: relative; z-index: 1;
}
.lcd-sub {
    font-size: 9px; color: #2a8c2a; letter-spacing: 2px;
    margin-top: 6px; text-align: center;
    font-family: 'JetBrains Mono', monospace;
}

.sp-pads-zone {
    background: #1e1e1e; padding: 18px 24px;
    border-bottom: 2px solid #111;
}
.pads-label {
    font-size: 7px; color: #444; letter-spacing: 4px;
    text-transform: uppercase; margin-bottom: 10px;
    font-family: 'JetBrains Mono', monospace;
}
.pads-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
.pad {
    aspect-ratio: 1.2; border-radius: 6px;
    background: linear-gradient(145deg, #2c2c2c, #1a1a1a);
    border: 1px solid #333;
    border-bottom: 3px solid #0a0a0a; border-right: 2px solid #0a0a0a;
    position: relative; overflow: hidden; cursor: default;
}
.pad::after {
    content: ''; position: absolute; inset: 0;
    background: radial-gradient(ellipse at 30% 30%, rgba(255,255,255,0.04), transparent 60%);
}
.pad-num {
    position: absolute; bottom: 5px; right: 7px;
    font-size: 8px; font-family: 'Orbitron', sans-serif;
    color: #444; font-weight: 700; z-index: 2;
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
    0%, 100% { background: linear-gradient(145deg, #2c2c2c, #1a1a1a); box-shadow: none; border-color: #333; }
    50%       { background: linear-gradient(145deg, #1a3a1a, #0d200d); box-shadow: 0 0 14px rgba(57,255,20,0.7), inset 0 0 8px rgba(57,255,20,0.2); border-color: #39FF14; }
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
    0%, 100% { background: linear-gradient(145deg, #1a3a1a, #0d200d); box-shadow: 0 0 10px rgba(57,255,20,0.5), inset 0 0 5px rgba(57,255,20,0.1); border-color: #39FF14; }
    50%       { background: linear-gradient(145deg, #1f4a1f, #112511); box-shadow: 0 0 22px rgba(57,255,20,0.9), inset 0 0 10px rgba(57,255,20,0.25); border-color: #39FF14; }
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

.sp-controls {
    background: #1a1a1a; padding: 12px 24px;
    display: flex; align-items: center; justify-content: space-between;
    border-bottom: 2px solid #111; gap: 16px;
}
.knobs-row { display: flex; gap: 14px; align-items: center; }
.knob-wrap { display: flex; flex-direction: column; align-items: center; gap: 4px; }
.knob {
    width: 30px; height: 30px; border-radius: 50%;
    background: radial-gradient(circle at 35% 30%, #4a4a4a, #1a1a1a);
    border: 2px solid #111;
    box-shadow: 0 2px 4px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.08);
    position: relative;
}
.knob::after {
    content: ''; position: absolute; top: 4px; left: 50%;
    transform: translateX(-50%);
    width: 2px; height: 7px; background: #c8a84b; border-radius: 1px;
}
.knob-label { font-size: 7px; color: #555; letter-spacing: 1px; text-transform: uppercase; font-family: 'JetBrains Mono', monospace; }

.sp-loader { background: #1c1c1c; padding: 12px 24px; border-bottom: 2px solid #111; }
.loader-label { font-size: 7px; color: #555; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 8px; font-family: 'JetBrains Mono', monospace; }

.sp-convert-panel {
    background: linear-gradient(180deg, #1c1c1c 0%, #161616 100%);
    border-top: 1px solid #2a2a2a;
    padding: 16px 24px 22px 24px;
    display: flex; flex-direction: column; gap: 6px;
}
.convert-instruction { display: flex; align-items: center; gap: 10px; margin-bottom: 6px; flex-wrap: wrap; }
.convert-step { font-family: 'JetBrains Mono', monospace; font-size: 8px; color: #555; letter-spacing: 2px; text-transform: uppercase; }
.convert-arrow { color: #39FF14; font-size: 10px; }
.convert-tag {
    font-family: 'Orbitron', sans-serif; font-size: 7px; font-weight: 700;
    color: #39FF14; letter-spacing: 3px; text-transform: uppercase;
    border: 1px solid #39FF14; border-radius: 3px; padding: 2px 6px; opacity: 0.7;
}

.stFileUploader { background: #111 !important; border: 1px dashed #39FF14 !important; border-radius: 8px !important; padding: 4px !important; }

.stButton > button {
    background: linear-gradient(180deg, #242424 0%, #161616 100%) !important;
    color: #39FF14 !important;
    border: 1px solid #2a2a2a !important;
    border-top: 1px solid #333 !important;
    border-bottom: 5px solid #060606 !important;
    border-radius: 10px !important;
    font-family: 'Orbitron', sans-serif !important;
    font-weight: 900 !important; font-size: 12px !important;
    letter-spacing: 3px !important;
    height: auto !important; min-height: 70px !important; width: 100% !important;
    text-transform: uppercase !important;
    box-shadow: 0 4px 20px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04) !important;
    transition: all 0.1s !important;
    white-space: normal !important; line-height: 1.4 !important; padding: 12px 16px !important;
}
.stButton > button:hover { box-shadow: 0 0 24px rgba(57,255,20,0.25), 0 4px 20px rgba(0,0,0,0.6) !important; border-color: #39FF14 !important; }
.stButton > button:active { border-bottom: 2px solid #060606 !important; transform: translateY(3px) !important; }

.results-outer { margin-top: 20px; }

.section-label {
    font-size: 8px; color: #c8a84b; letter-spacing: 4px; text-transform: uppercase;
    font-family: 'Orbitron', sans-serif;
    margin: 20px 0 8px 0; padding-bottom: 5px;
    border-bottom: 1px solid #252525;
    display: flex; align-items: center; gap: 8px;
}
.section-label::before { content: '▶'; color: #39FF14; font-size: 8px; }

.section-label-sub {
    font-size: 7px; color: #444; letter-spacing: 2px;
    font-family: 'JetBrains Mono', monospace;
    margin-bottom: 8px; padding-left: 14px;
    line-height: 1.6;
}

.analysis-block {
    background: #0d0d0d; border: 1px solid #222;
    border-left: 3px solid #c8a84b; border-radius: 6px;
    padding: 16px 18px; font-size: 11.5px; line-height: 1.9;
    color: #bbb; white-space: pre-wrap; word-break: break-word;
    font-family: 'JetBrains Mono', monospace;
}

.stTextArea textarea {
    background-color: #080808 !important; color: #39FF14 !important;
    border: 1px solid #333 !important; border-left: 3px solid #39FF14 !important;
    border-radius: 6px !important;
    font-family: 'JetBrains Mono', monospace !important;
    font-size: 12px !important; line-height: 1.7 !important; padding: 14px !important;
    box-shadow: inset 0 0 20px rgba(57,255,20,0.03) !important;
    resize: vertical !important;
}
.stTextArea label { display: none !important; }

.neon-divider { border: none; border-top: 1px solid #1d1d1d; margin: 22px 0; }

.sp-footer {
    text-align: center; margin-top: 28px; font-size: 7px; color: #2a2a2a;
    letter-spacing: 4px; font-family: 'Orbitron', sans-serif; text-transform: uppercase;
}
.stSpinner > div { border-top-color: #39FF14 !important; }
</style>
""", unsafe_allow_html=True)


# ══════════════════════════════════════════════════════════════════════════════
# PASS 1 — Pure audio analysis. No prompt generation. No template hints.
# Let Gemini hear what it hears without any leading language.
# ══════════════════════════════════════════════════════════════════════════════
ANALYSIS_PROMPT = """
You are an expert musicologist and audio analyst. Listen to this recording carefully and describe exactly what you hear.

Your job is ONLY analysis — do not generate any AI music prompts yet.

Be precise and specific. Do not guess or generalize. If something is ambiguous, say so.
Do not use template language or fill in defaults — every field must reflect this specific recording.

Output using these exact headers:

## ANALYSIS
ERA: [Identify the most likely decade and recording period this was made — e.g. "Late 1950s", "Early 1970s", "Mid 1980s", "Early 1990s". Base this on instrumentation, recording quality, production style, and sonic character. Be specific.]
RECORDING AESTHETIC: [Describe the sonic character — e.g. "Blue Note jazz studio", "Motown studio production", "DIY lo-fi bedroom recording", "major label 70s soul session", "70mm orchestral scoring stage". Be evocative and specific.]
PRODUCTION TEXTURE: [What is the sonic patina of the recording itself? Analog tape warmth, vinyl surface noise, digital clarity, cassette saturation, room bleed, etc.]
BPM: [Estimated tempo range — two numbers e.g. 72–78. If there is no clear pulse, describe the rhythmic feel instead.]
GROOVE: [Straight, swung, triplet feel, rubato, free time — describe the rhythmic character with nuance]
KEY + MODE: [e.g. "Bb minor", "D Dorian", "G Mixolydian", "ambiguous / modal". Include the scale character.]
CHORD MOVEMENT: [Describe the harmonic progression in plain language — what chords are implied, how they move, what the cycle feels like]
INSTRUMENTATION: [List every instrument you can identify. Be specific — not just "bass" but "upright bass" or "electric bass". Not just "keys" but "Rhodes electric piano" or "Hammond B3". DO NOT mention drums, kick, snare, or hi-hats.]
VOCAL TONE: [If vocals are present: describe register, texture, style, and delivery — e.g. "low baritone, smoky and restrained, phrasing like a jazz balladeer". If no vocals: "Instrumental — no vocals detected."]
ARRANGEMENT ARC: [How does the recording build and evolve? Describe the dynamics, what enters and exits, the shape of the performance.]
EMOTIONAL CHARACTER: [What is the emotional core of this recording? Use 3–5 specific descriptors. Go beyond genre — describe the feeling.]
SAMPLE POTENTIAL: [From a producer's perspective — what makes this recording interesting to chop? What melodic or harmonic moments stand out? What would a boom bap or soul sample producer gravitate toward?]
FLIP DIRECTIONS:
A. [Specific production direction grounded in what you heard — different tempo, pitch shift, genre context]
B. [Second direction]
C. [Third direction]
""".strip()


# ══════════════════════════════════════════════════════════════════════════════
# PASS 2 — Prompt generation from analysis. Text-only, no audio re-upload.
# Two prompts: Clone (faithful recreation) + Sampler (flip-ready reframe).
# ══════════════════════════════════════════════════════════════════════════════
def build_prompt_generation(analysis_text: str) -> str:
    return f"""
You are a specialist in writing AI music generation prompts for sample-based hip-hop producers.

Below is a detailed musical analysis of a specific recording. Your job is to write two prompts based EXCLUSIVELY on this analysis. Do not invent details not present in the analysis. Do not default to generic 1970s soul language unless the analysis specifically identifies that era.

ANALYSIS:
{analysis_text}

---

Write two prompts using these exact headers:

## CLONE PROMPT
A single flowing paragraph. Hard cap: 1000 characters including spaces. No bullet points. No line breaks within the paragraph. No drums, no percussion, no beats mentioned anywhere.

This prompt should recreate the source recording as faithfully as possible. Pull directly from the analysis:
- Use the exact ERA identified (not a guess — what the analysis says)
- Use the exact RECORDING AESTHETIC identified
- Name the specific instruments identified
- Use the KEY and CHORD MOVEMENT detected
- Use the VOCAL TONE if vocals were detected, or state "no vocals, purely instrumental"
- Use the PRODUCTION TEXTURE (tape, vinyl, digital, etc.)
- Use the EMOTIONAL CHARACTER descriptors
- End with: "designed to feel loopable"

The goal: someone reading this prompt should be able to generate something that sounds like the original recording. Stay faithful to what was actually heard.

## SAMPLER PROMPT
A single flowing paragraph. Hard cap: 1000 characters including spaces. No bullet points. No line breaks within the paragraph. No drums, no percussion, no beats mentioned anywhere.

This prompt takes the same analysis but reframes it through a sample-flipping lens. Use this structure, populated entirely from the analysis above — not from defaults:

1. ERA + RECORDING TYPE: Use the actual era and aesthetic from the analysis (e.g. "Vintage late 1950s hard bop jazz session" not a generic placeholder)
2. PRODUCTION TEXTURE: Use the actual sonic patina detected — tape hiss, vinyl warmth, digital sheen, whatever was found
3. TEMPO FEEL: Use the actual BPM range and groove character detected
4. INSTRUMENTATION: Use the specific instruments identified — no drums, no percussion
5. VOCAL CHARACTER: Use what was detected, or "no vocals"
6. SONIC IMPERFECTIONS: Pull from the production texture — crackle, wow and flutter, room bleed, human timing, breath
7. MOOD: Use the emotional character descriptors from the analysis — 2 or 3 strong words
8. End with: "designed to feel loopable. Dramatic and [mood word from analysis], the kind of record that would be sampled, chopped and pitched up."

This prompt should work equally well pasted into Suno, Udio, or Sampla.ai.
""".strip()


def extract_section(text, header):
    pattern = rf"##\s*{re.escape(header)}\s*\n(.*?)(?=\n##\s|\Z)"
    match = re.search(pattern, text, re.DOTALL | re.IGNORECASE)
    return match.group(1).strip() if match else ""


def cap_prompt(text, limit=1000):
    if len(text) > limit:
        return text[:limit - 3].rsplit(" ", 1)[0] + "..."
    return text


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
    ("clone_prompt", ""), ("sampler_prompt", "")
]:
    if key not in st.session_state:
        st.session_state[key] = default

# ── RENDER MACHINE ─────────────────────────────────────────────────────────────
st.markdown('<div class="sp-unit">', unsafe_allow_html=True)

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
elif state == "pass1":
    lcd_slot.markdown(render_lcd("PASS 1 — READING SAMPLE", "analyzing audio..."), unsafe_allow_html=True)
elif state == "pass2":
    lcd_slot.markdown(render_lcd("PASS 2 — BUILDING PROMPTS", "generating from analysis..."), unsafe_allow_html=True)
elif state == "done":
    lcd_slot.markdown(render_lcd("DECODE COMPLETE", "prompts ready to copy"), unsafe_allow_html=True)
elif state == "error":
    lcd_slot.markdown(render_lcd("HARDWARE ERROR", "check console"), unsafe_allow_html=True)
st.markdown('</div>', unsafe_allow_html=True)

# ── PADS ───────────────────────────────────────────────────────────────────────
st.markdown('<div class="sp-pads-zone">', unsafe_allow_html=True)
st.markdown('<div class="pads-label">Sample Bank A — Drum Pads</div>', unsafe_allow_html=True)
pads_slot = st.empty()
pads_slot.markdown(render_pads(st.session_state.pad_state if st.session_state.pad_state in ("done",) else
                               "running" if st.session_state.pad_state in ("pass1","pass2") else
                               st.session_state.pad_state), unsafe_allow_html=True)
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

# ── CONVERT PANEL ──────────────────────────────────────────────────────────────
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

# ── TWO-PASS ANALYSIS ──────────────────────────────────────────────────────────
if uploaded_file and run_btn:

    ext  = uploaded_file.name.rsplit(".", 1)[-1].lower()
    mime = "audio/wav" if ext == "wav" else "audio/mpeg"
    b64  = base64.b64encode(uploaded_file.getvalue()).decode("utf-8")
    audio_part = {"inline_data": {"mime_type": mime, "data": b64}}

    try:
        genai.configure(api_key=st.secrets["GEMINI_KEY"])
        model = genai.GenerativeModel("gemini-2.5-flash")

        # ── PASS 1: Audio analysis ─────────────────────────────────────────
        st.session_state.pad_state = "pass1"
        lcd_slot.markdown(render_lcd("PASS 1 — READING SAMPLE", "analyzing audio..."), unsafe_allow_html=True)
        pads_slot.markdown(render_pads("running"), unsafe_allow_html=True)

        with st.spinner(""):
            r1 = model.generate_content([ANALYSIS_PROMPT, audio_part])
            analysis_raw = r1.text
            st.session_state.analysis = extract_section(analysis_raw, "ANALYSIS") or analysis_raw

        # ── PASS 2: Prompt generation (text only, no audio re-upload) ──────
        st.session_state.pad_state = "pass2"
        lcd_slot.markdown(render_lcd("PASS 2 — BUILDING PROMPTS", "generating from analysis..."), unsafe_allow_html=True)

        with st.spinner(""):
            prompt_gen = build_prompt_generation(st.session_state.analysis)
            r2 = model.generate_content(prompt_gen)
            prompts_raw = r2.text

            st.session_state.clone_prompt   = cap_prompt(extract_section(prompts_raw, "CLONE PROMPT"))
            st.session_state.sampler_prompt = cap_prompt(extract_section(prompts_raw, "SAMPLER PROMPT"))

        st.session_state.pad_state = "done"
        lcd_slot.markdown(render_lcd("DECODE COMPLETE", "prompts ready to copy"), unsafe_allow_html=True)
        pads_slot.markdown(render_pads("done"), unsafe_allow_html=True)

    except Exception as e:
        st.session_state.pad_state = "error"
        lcd_slot.markdown(render_lcd("HARDWARE ERROR", str(e)[:40]), unsafe_allow_html=True)
        pads_slot.markdown(render_pads("error"), unsafe_allow_html=True)
        st.error(f"Error: {str(e)}")


# ── RESULTS ────────────────────────────────────────────────────────────────────
if st.session_state.analysis:
    st.markdown('<div class="results-outer">', unsafe_allow_html=True)

    # ANALYSIS
    st.markdown('<div class="section-label">Sample Analysis</div>', unsafe_allow_html=True)
    st.markdown(f'<div class="analysis-block">{st.session_state.analysis}</div>', unsafe_allow_html=True)

    st.markdown('<hr class="neon-divider">', unsafe_allow_html=True)

    # CLONE PROMPT
    if st.session_state.clone_prompt:
        char_c = len(st.session_state.clone_prompt)
        col = "#ff4444" if char_c > 1000 else "#39FF14"
        st.markdown(
            f'<div class="section-label">Clone Prompt'
            f'<span style="margin-left:auto;font-family:JetBrains Mono,monospace;font-size:8px;color:{col};">{char_c}/1000</span>'
            f'</div>',
            unsafe_allow_html=True
        )
        st.markdown(
            '<div class="section-label-sub">Faithful sonic recreation of the source — paste into Suno, Udio, or Sampla.ai</div>',
            unsafe_allow_html=True
        )
        st.text_area("", value=st.session_state.clone_prompt, height=200, key="cp", label_visibility="collapsed")

    # SAMPLER PROMPT
    if st.session_state.sampler_prompt:
        char_s = len(st.session_state.sampler_prompt)
        col = "#ff4444" if char_s > 1000 else "#39FF14"
        st.markdown(
            f'<div class="section-label">Sampler Prompt'
            f'<span style="margin-left:auto;font-family:JetBrains Mono,monospace;font-size:8px;color:{col};">{char_s}/1000</span>'
            f'</div>',
            unsafe_allow_html=True
        )
        st.markdown(
            '<div class="section-label-sub">Flip-ready reframe — loopable, choppable, designed to be sampled — paste into Suno, Udio, or Sampla.ai</div>',
            unsafe_allow_html=True
        )
        st.text_area("", value=st.session_state.sampler_prompt, height=200, key="sp", label_visibility="collapsed")

    st.markdown('</div>', unsafe_allow_html=True)

st.markdown(
    '<div class="sp-footer">12-Bit Linear &nbsp;·&nbsp; 130 MODE © 2026 &nbsp;·&nbsp; Booman Systems</div>',
    unsafe_allow_html=True
)
