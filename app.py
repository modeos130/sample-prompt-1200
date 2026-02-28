import streamlit as st
import google.generativeai as genai
import base64
import re

# --- 130 MODE SP-1200 ---
st.set_page_config(page_title="Sample Prompt 1200", layout="centered")

st.markdown("""
<style>
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap');

* { box-sizing: border-box; }

.stApp {
    background-color: #121212;
    font-family: 'JetBrains Mono', monospace;
    color: #e0e0e0;
}

header, footer, #MainMenu { visibility: hidden; }
.block-container { padding-top: 1rem; padding-bottom: 2rem; }

.chassis {
    background-color: #2d2d2d;
    background-image: url('https://www.transparenttextures.com/patterns/carbon-fibre.png');
    border: 4px solid #1a1a1a;
    border-radius: 24px;
    padding: 28px 24px;
    box-shadow: 0 30px 60px rgba(0,0,0,0.8);
    border-bottom: 12px solid #111;
    margin-top: 16px;
}

.logo-container {
    width: 90px; height: 90px;
    margin: 0 auto 14px auto;
    border-radius: 50%;
    border: 3px solid #39FF14;
    background: black;
    display: flex; flex-direction: column;
    justify-content: center; align-items: center;
    box-shadow: 0 0 25px rgba(57,255,20,0.6);
}
.logo-130  { color: #39FF14; font-size: 30px; font-weight: 900; line-height: 0.8; }
.logo-mode { color: #39FF14; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; }

.lcd-screen {
    background-color: #000;
    border: 4px solid #1a1a1a;
    border-radius: 4px;
    padding: 20px;
    min-height: 100px;
    display: flex; flex-direction: column;
    justify-content: center; align-items: center;
    box-shadow: inset 0 0 20px rgba(57,255,20,0.2);
    margin: 16px 0;
}
.lcd-text {
    color: #39FF14; font-weight: 700;
    text-transform: uppercase; letter-spacing: 3px;
    text-shadow: 0 0 12px rgba(57,255,20,0.9);
    font-size: 16px; text-align: center;
}

.section-label {
    color: #39FF14;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 3px;
    text-transform: uppercase;
    margin: 20px 0 6px 0;
    border-bottom: 1px solid #2a2a2a;
    padding-bottom: 4px;
}

.analysis-block {
    background: #0d0d0d;
    border: 1px solid #1f1f1f;
    border-left: 3px solid #39FF14;
    border-radius: 6px;
    padding: 16px;
    font-size: 12px;
    line-height: 1.8;
    color: #c0c0c0;
    white-space: pre-wrap;
    word-break: break-word;
}

.stTextArea textarea {
    background-color: #0a0a0a !important;
    color: #39FF14 !important;
    border: 2px solid #39FF14 !important;
    border-radius: 8px !important;
    font-family: 'JetBrains Mono', monospace !important;
    font-size: 13px !important;
    line-height: 1.6 !important;
    padding: 14px !important;
    box-shadow: inset 0 0 12px rgba(57,255,20,0.08) !important;
    resize: vertical !important;
}

.stButton > button {
    background-color: #3d3d3d !important;
    color: #39FF14 !important;
    border: 2px solid #1a1a1a !important;
    border-bottom: 6px solid #111 !important;
    border-radius: 8px !important;
    font-weight: bold !important;
    height: 72px !important;
    width: 100% !important;
    font-size: 16px !important;
    font-family: 'JetBrains Mono', monospace !important;
    letter-spacing: 2px !important;
    margin-top: 10px;
}
.stButton > button:active {
    border-bottom: 2px solid #111 !important;
    transform: translateY(4px) !important;
}

.stFileUploader {
    background-color: #1a1a1a;
    border: 2px dashed #39FF14;
    border-radius: 10px;
    padding: 8px;
}

.stSpinner > div { border-top-color: #39FF14 !important; }

.neon-divider {
    border: none;
    border-top: 1px solid #1f1f1f;
    margin: 24px 0;
}
</style>
""", unsafe_allow_html=True)


# ── MASTER ANALYSIS PROMPT ─────────────────────────────────────────────────────
MASTER_PROMPT = """
You are an expert music analyst for sample-based hip-hop producers.
Analyze this audio strictly for musical and production elements.

CONTEXT:
- Use case: drumless sample chopping, boom bap flipping, AI recreation via Suno and Udio
- DO NOT include drums, beats, kick, snare, hi-hats, or any rhythmic percussion in ANY prompt you generate
- Focus entirely on: melody, harmony, chord texture, mood, timbre, instrumentation, vocal feel, and arrangement

OUTPUT FORMAT — use these exact section headers with ## prefix. No other headers.

## ANALYSIS
BPM: [tight 2-number range, e.g. 88–92]
Groove: [straight / swung / triplet — be specific about the feel]
Key: [key + mode, e.g. F minor, Dorian, Mixolydian]
Chord Movement: [describe the progressions, cycles, and harmonic tendencies in plain language]
Vocal Tone: [classify texture, register, delivery — e.g. breathy alto, gospel belt, raspy tenor, no vocals]
Arrangement Arc: [how does energy and instrumentation evolve — intro through peak through resolution]
Emotional Intensity: [map the emotional journey from low to high, with rough timestamps if detectable]
Chop Strategies:
1. [specific chop idea tailored to this sample]
2. [specific chop idea]
3. [specific chop idea]
4. [specific chop idea]
5. [specific chop idea]
Flip Directions:
A. [alternate production direction — e.g. slow it to 70 BPM and pitch down 3 semitones for a dark trap soul flip]
B. [alternate direction]
C. [alternate direction]

## SUNO PROMPT (DETAILED)
[One highly detailed Suno prompt. Drumless only — absolutely no drums or percussion mentioned. Describe: instrumentation, harmonic texture, mood and emotional arc, tempo feel, vocal style and tone if present, era/genre influence, production aesthetic. Write as a single flowing descriptive paragraph — not bullet points. Make it specific and evocative enough to recreate the vibe faithfully. Ready to paste directly into Suno.]

## SUNO PROMPT (MINIMAL)
[A compressed 2–3 sentence version of the detailed prompt above. Drumless. Capture the essential vibe in the fewest words. Ready to paste into Suno or Udio.]

## UDIO PROMPT
[A Udio-optimized prompt. Udio responds best to comma-separated style/mood/genre tags followed by one sentence of directional context. Drumless only. Format: tags on line 1, one sentence on line 2.]
""".strip()


def extract_section(text, header):
    pattern = rf"##\s*{re.escape(header)}\s*\n(.*?)(?=\n##\s|\Z)"
    match = re.search(pattern, text, re.DOTALL | re.IGNORECASE)
    return match.group(1).strip() if match else ""


# ── HEADER ─────────────────────────────────────────────────────────────────────
st.markdown(
    '<div class="logo-container">'
    '<div class="logo-130">130</div>'
    '<div class="logo-mode">Mode</div>'
    '</div>'
    '<div style="text-align:center; margin-bottom:20px;">'
    '<h1 style="color:#8e8e8e; font-size:24px; font-weight:900; margin:0; letter-spacing:2px;">BOOMAN SYSTEMS</h1>'
    '<p style="color:#444; font-size:9px; font-weight:bold; letter-spacing:4px; margin:4px 0 0 0;">SP-1200 PROMPT GENERATOR</p>'
    '</div>',
    unsafe_allow_html=True
)

st.markdown('<div class="chassis">', unsafe_allow_html=True)

lcd = st.empty()
lcd.markdown(
    '<div class="lcd-screen"><div class="lcd-text">READY // BANK A</div></div>',
    unsafe_allow_html=True
)

st.markdown(
    '<p style="color:#555; font-size:9px; font-weight:bold; text-transform:uppercase; margin-bottom:4px;">'
    'Load Sample — MP3 or WAV</p>',
    unsafe_allow_html=True
)
uploaded_file = st.file_uploader("", type=["mp3", "wav"])

if uploaded_file:
    if st.button("⬡  RUN 12-BIT ANALYSIS"):
        with st.spinner("QUANTIZING — ANALYZING SAMPLE..."):
            try:
                genai.configure(api_key=st.secrets["GEMINI_KEY"])
                model = genai.GenerativeModel("gemini-2.5-flash")

                ext      = uploaded_file.name.rsplit(".", 1)[-1].lower()
                mime     = "audio/wav" if ext == "wav" else "audio/mpeg"
                b64      = base64.b64encode(uploaded_file.getvalue()).decode("utf-8")
                audio_part = {"inline_data": {"mime_type": mime, "data": b64}}

                response = model.generate_content([MASTER_PROMPT, audio_part])
                result   = response.text

                analysis     = extract_section(result, "ANALYSIS")
                suno_detail  = extract_section(result, "SUNO PROMPT (DETAILED)")
                suno_minimal = extract_section(result, "SUNO PROMPT (MINIMAL)")
                udio_prompt  = extract_section(result, "UDIO PROMPT")

                # Fallback if parsing fails
                if not analysis:
                    analysis = result

                lcd.markdown(
                    '<div class="lcd-screen"><div class="lcd-text">✓ SAMPLE DECODED</div></div>',
                    unsafe_allow_html=True
                )

                # ── ANALYSIS ──────────────────────────────────────────────
                st.markdown('<div class="section-label">▸ Sample Analysis</div>', unsafe_allow_html=True)
                st.markdown(f'<div class="analysis-block">{analysis}</div>', unsafe_allow_html=True)

                st.markdown('<hr class="neon-divider">', unsafe_allow_html=True)

                # ── SUNO DETAILED ─────────────────────────────────────────
                if suno_detail:
                    st.markdown(
                        '<div class="section-label">▸ Suno Prompt — Detailed &nbsp;· tap box → Select All → Copy</div>',
                        unsafe_allow_html=True
                    )
                    st.text_area(
                        label="suno_detail",
                        value=suno_detail,
                        height=220,
                        key="suno_d",
                        label_visibility="collapsed"
                    )

                # ── SUNO MINIMAL ──────────────────────────────────────────
                if suno_minimal:
                    st.markdown(
                        '<div class="section-label">▸ Suno Prompt — Minimal &nbsp;· tap box → Select All → Copy</div>',
                        unsafe_allow_html=True
                    )
                    st.text_area(
                        label="suno_minimal",
                        value=suno_minimal,
                        height=120,
                        key="suno_m",
                        label_visibility="collapsed"
                    )

                # ── UDIO ──────────────────────────────────────────────────
                if udio_prompt:
                    st.markdown(
                        '<div class="section-label">▸ Udio Prompt &nbsp;· tap box → Select All → Copy</div>',
                        unsafe_allow_html=True
                    )
                    st.text_area(
                        label="udio_prompt",
                        value=udio_prompt,
                        height=120,
                        key="udio_p",
                        label_visibility="collapsed"
                    )

            except Exception as e:
                lcd.markdown(
                    '<div class="lcd-screen"><div class="lcd-text" style="color:#ff4444;">HARDWARE ERROR</div></div>',
                    unsafe_allow_html=True
                )
                st.error(f"Hardware Error: {str(e)}")

st.markdown('</div>', unsafe_allow_html=True)
st.markdown(
    '<p style="text-align:center; color:#222; font-size:8px; margin-top:24px; letter-spacing:3px;">'
    '12-BIT LINEAR // 130 MODE © 2026</p>',
    unsafe_allow_html=True
)
