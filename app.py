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
# STYLES — Commercial Grade
# ══════════════════════════════════════════════════════════════════════════════
st.markdown("""
<style>
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300&display=swap');

:root {
    --bg:          #0d0f11;
    --s1:          #141820;
    --s2:          #1a1f28;
    --s3:          #222a34;
    --bd:          #1e2530;
    --bd2:         #28333f;
    --bd3:         #364452;
    --gold:        #c9a84c;
    --gold-lt:     #e8c97a;
    --gold-dim:    #7a6230;
    --gold-glow:   rgba(201,168,76,0.10);
    --gold-tint:   rgba(201,168,76,0.06);
    --green:       #34c97a;
    --green-dim:   rgba(52,201,122,0.15);
    --text:        #d8e2ec;
    --text2:       #7e8fa0;
    --text3:       #3d4d5c;
    --red:         #e05656;
    --red-tint:    rgba(224,86,86,0.08);
    --orange:      #e8944a;
    --radius:      10px;
    --radius-sm:   6px;
    --radius-lg:   14px;
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

html, body, .stApp {
    background: var(--bg) !important;
    font-family: 'DM Mono', monospace;
    color: var(--text);
    -webkit-font-smoothing: antialiased;
}

header, footer, #MainMenu, .stDeployButton,
[data-testid="stToolbar"], [data-testid="stDecoration"] {
    visibility: hidden !important; display: none !important;
}

.block-container {
    padding: 0 !important;
    max-width: 760px !important;
    margin: 0 auto !important;
}

.page { padding: 40px 28px 100px; }

/* ── HEADER ───────────────────────────────────────────────────────────────── */
.hdr {
    margin-bottom: 36px;
    padding-bottom: 28px;
    border-bottom: 1px solid var(--bd);
}
.hdr-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
}
.hdr-eyebrow {
    font-size: 9px; font-weight: 500;
    color: var(--gold);
    letter-spacing: 3.5px; text-transform: uppercase;
    margin-bottom: 8px;
    font-family: 'DM Mono', monospace;
}
.hdr-title {
    font-family: 'Syne', sans-serif;
    font-size: 32px; font-weight: 800;
    color: var(--text);
    letter-spacing: -0.8px; line-height: 1;
    margin-bottom: 10px;
}
.hdr-title span { color: var(--gold); }
.hdr-tagline {
    font-size: 11px;
    color: var(--text2);
    letter-spacing: 0.3px;
    line-height: 1.5;
}
.hdr-badge {
    flex-shrink: 0;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    width: 58px; height: 58px;
    border-radius: 50%;
    border: 1.5px solid var(--gold-dim);
    background: linear-gradient(145deg, var(--s2), var(--s1));
    box-shadow: 0 0 0 4px var(--gold-tint);
}
.hdr-badge-num {
    font-family: 'Syne', sans-serif;
    font-size: 18px; font-weight: 800;
    color: var(--gold); line-height: 1;
}
.hdr-badge-txt {
    font-size: 7px; font-weight: 500;
    color: var(--gold-dim); letter-spacing: 1.5px;
    text-transform: uppercase; margin-top: 2px;
}
.platform-row {
    display: flex; align-items: center; gap: 6px;
    margin-top: 16px;
}
.platform-label {
    font-size: 9px; color: var(--text3);
    letter-spacing: 1.5px; text-transform: uppercase;
    margin-right: 4px;
}
.platform-pill {
    display: inline-flex; align-items: center;
    background: var(--s2);
    border: 1px solid var(--bd2);
    border-radius: 20px;
    padding: 3px 10px;
    font-size: 9px; font-weight: 500;
    color: var(--text2);
    letter-spacing: 0.5px;
    text-transform: uppercase;
}

/* ── STATUS BAR ──────────────────────────────────────────────────────────── */
.statusbar {
    display: flex; align-items: center; gap: 10px;
    background: var(--s1);
    border: 1px solid var(--bd);
    border-radius: var(--radius);
    padding: 11px 16px; margin-bottom: 20px;
    font-size: 10.5px; color: var(--text2); letter-spacing: 0.4px;
}
.sdot {
    width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0;
}
.sdot.idle   { background: var(--text3); }
.sdot.active { background: var(--green); animation: pulse 1.4s ease-in-out infinite; }
.sdot.done   { background: var(--green); }
.sdot.error  { background: var(--red); }
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.25} }

/* ── UPLOAD ──────────────────────────────────────────────────────────────── */
.upload-label {
    font-family: 'Syne', sans-serif;
    font-size: 9.5px; font-weight: 700;
    color: var(--text2);
    letter-spacing: 2.5px; text-transform: uppercase;
    margin-bottom: 10px; display: block;
}
.stFileUploader {
    background: var(--s1) !important;
    border: 1px dashed var(--bd2) !important;
    border-radius: var(--radius-lg) !important;
    transition: border-color 0.2s !important;
}
.stFileUploader:hover { border-color: var(--gold-dim) !important; }
[data-testid="stFileUploaderDropzone"] {
    background: transparent !important; padding: 24px !important;
}
[data-testid="stFileUploaderDropzoneInstructions"] {
    color: var(--text2) !important; font-size: 12px !important;
}
.file-chip {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 8px 14px;
    background: var(--s2);
    border: 1px solid var(--bd2);
    border-radius: 100px;
    margin-top: 10px;
    font-size: 11px; color: var(--text2);
}
.file-chip-dot { color: var(--gold); font-size: 7px; }
.file-chip-name { color: var(--text); font-weight: 500; max-width: 240px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.file-chip-size { color: var(--text3); }

/* ── BUTTONS ──────────────────────────────────────────────────────────────── */
.stButton > button {
    background: var(--gold) !important;
    color: #0a0c0e !important;
    border: none !important;
    border-radius: var(--radius) !important;
    font-family: 'Syne', sans-serif !important;
    font-weight: 700 !important; font-size: 12px !important;
    letter-spacing: 2px !important; text-transform: uppercase !important;
    height: 50px !important; width: 100% !important;
    transition: all 0.18s ease !important;
    margin-top: 16px !important; margin-bottom: 6px !important;
    box-shadow: 0 1px 3px rgba(0,0,0,0.4) !important;
}
.stButton > button:hover {
    background: #d4b05a !important;
    box-shadow: 0 6px 28px rgba(201,168,76,0.22) !important;
    transform: translateY(-1px) !important;
}
.stButton > button:active {
    transform: translateY(0) !important;
    box-shadow: 0 1px 4px rgba(0,0,0,0.4) !important;
}
.stButton > button:disabled {
    opacity: 0.3 !important; cursor: not-allowed !important; transform: none !important;
}

/* ── SECTION LABEL ──────────────────────────────────────────────────────── */
.sec-label {
    font-family: 'Syne', sans-serif;
    font-size: 9px; font-weight: 700;
    color: var(--text2);
    letter-spacing: 3px; text-transform: uppercase;
    margin: 0 0 14px 0;
    display: flex; align-items: center; gap: 8px;
}
.sec-rule { flex: 1; height: 1px; background: var(--bd); }
.cbadge {
    font-family: 'DM Mono', monospace;
    font-size: 9px; color: var(--text3); letter-spacing: 0;
    font-weight: 400; text-transform: none;
}
.cbadge.ok   { color: var(--green); }
.cbadge.warn { color: var(--orange); }
.cbadge.over { color: var(--red); }

/* ── ALERT ───────────────────────────────────────────────────────────────── */
.alert {
    background: var(--red-tint);
    border: 1px solid var(--red);
    border-radius: var(--radius);
    padding: 14px 18px;
    font-size: 11px; color: var(--red);
    margin-bottom: 20px; line-height: 1.65;
}

/* ── ANALYSIS CARD ──────────────────────────────────────────────────────── */
.analysis-card {
    background: var(--s1);
    border: 1px solid var(--bd);
    border-left: 3px solid var(--gold);
    border-radius: var(--radius);
    overflow: hidden;
    margin-bottom: 6px;
}
.ar {
    display: flex; gap: 0;
    border-bottom: 1px solid var(--bd);
}
.ar:last-child { border-bottom: none; }
.ar-k {
    font-family: 'Syne', sans-serif;
    font-size: 8px; font-weight: 700;
    color: var(--gold);
    letter-spacing: 1.5px; text-transform: uppercase;
    width: 124px; min-width: 124px;
    padding: 10px 14px;
    border-right: 1px solid var(--bd);
    background: rgba(201,168,76,0.03);
    display: flex; align-items: flex-start;
    padding-top: 12px;
}
.ar-v {
    font-family: 'DM Mono', monospace;
    font-size: 11px; color: var(--text2);
    padding: 11px 16px;
    flex: 1; word-break: break-word; line-height: 1.6;
}

/* ── PRODUCER DNA — special treatment ──────────────────────────────────── */
.dna-card {
    background: linear-gradient(135deg, var(--gold-tint), transparent);
    border: 1px solid var(--gold-dim);
    border-left: 3px solid var(--gold);
    border-radius: var(--radius);
    padding: 14px 16px; margin-bottom: 6px;
}
.dna-label {
    font-family: 'Syne', sans-serif;
    font-size: 8px; font-weight: 700;
    color: var(--gold);
    letter-spacing: 2px; text-transform: uppercase;
    margin-bottom: 7px;
}
.dna-text {
    font-family: 'DM Mono', monospace;
    font-size: 11.5px; color: var(--text);
    line-height: 1.65;
}

/* ── FLIP CARD ──────────────────────────────────────────────────────────── */
.flip-card {
    background: var(--s1);
    border: 1px solid var(--bd);
    border-left: 3px solid var(--bd3);
    border-radius: var(--radius);
    padding: 14px 16px; margin-top: 4px; margin-bottom: 6px;
}
.flip-hdr {
    font-family: 'Syne', sans-serif;
    font-size: 8px; font-weight: 700;
    color: var(--text3);
    letter-spacing: 2px; text-transform: uppercase;
    margin-bottom: 10px;
}
.flip-item {
    font-size: 11px; color: var(--text2);
    padding: 3px 0; line-height: 1.6;
}
.flip-ltr {
    color: var(--gold-lt); margin-right: 8px; font-weight: 500;
}

/* ── PROMPT CARD ─────────────────────────────────────────────────────────── */
.prompt-card {
    background: var(--s1);
    border: 1px solid var(--bd);
    border-radius: var(--radius-lg);
    padding: 16px 18px;
    margin-bottom: 16px;
}
.prompt-card-title {
    font-family: 'Syne', sans-serif;
    font-size: 9px; font-weight: 700;
    color: var(--text2);
    letter-spacing: 2.5px; text-transform: uppercase;
    display: flex; align-items: center; gap: 8px;
    margin-bottom: 4px;
}
.prompt-card-sub {
    font-size: 9.5px; color: var(--text3);
    letter-spacing: 0.5px;
    margin-bottom: 12px;
    line-height: 1.5;
}
.platform-tags {
    display: flex; gap: 5px; flex-wrap: wrap;
    margin-bottom: 12px;
}
.ptag {
    font-size: 8.5px; font-weight: 500;
    color: var(--text3);
    background: var(--s2);
    border: 1px solid var(--bd2);
    border-radius: 4px;
    padding: 2px 7px;
    letter-spacing: 0.5px;
}
.ptag.ok { color: var(--green); border-color: rgba(52,201,122,0.3); background: var(--green-dim); }

/* ── QUICK PROMPT CARD — highlighted treatment ─────────────────────────── */
.quick-card {
    background: linear-gradient(135deg, rgba(201,168,76,0.07), var(--s1));
    border: 1px solid var(--gold-dim);
    border-radius: var(--radius-lg);
    padding: 16px 18px;
    margin-bottom: 16px;
}
.quick-card-title {
    font-family: 'Syne', sans-serif;
    font-size: 9px; font-weight: 700;
    color: var(--gold);
    letter-spacing: 2.5px; text-transform: uppercase;
    display: flex; align-items: center; gap: 8px;
    margin-bottom: 4px;
}
.quick-card-sub {
    font-size: 9.5px; color: var(--gold-dim);
    letter-spacing: 0.5px;
    margin-bottom: 12px;
}

/* ── TEXTAREA ───────────────────────────────────────────────────────────── */
.stTextArea textarea {
    background: var(--s2) !important;
    color: var(--text) !important;
    border: 1px solid var(--bd2) !important;
    border-radius: var(--radius-sm) !important;
    font-family: 'DM Mono', monospace !important;
    font-size: 12px !important; line-height: 1.75 !important;
    padding: 12px 14px !important; resize: none !important;
    caret-color: var(--gold) !important;
}
.stTextArea textarea:focus {
    border-color: var(--gold-dim) !important;
    box-shadow: 0 0 0 2px var(--gold-tint) !important;
    outline: none !important;
}
.stTextArea label { display: none !important; }

/* ── COPY BUTTON ─────────────────────────────────────────────────────────── */
.cp-btn {
    display: inline-flex; align-items: center; gap: 7px;
    background: var(--s3);
    border: 1px solid var(--bd2);
    border-radius: var(--radius-sm);
    padding: 8px 18px;
    font-family: 'DM Mono', monospace; font-size: 10.5px;
    color: var(--text2);
    cursor: pointer; transition: all 0.15s;
    margin-top: 10px; letter-spacing: 0.3px;
}
.cp-btn:hover { border-color: var(--gold-dim); color: var(--gold-lt); background: var(--gold-tint); }
.cp-btn.copied { border-color: var(--green) !important; color: var(--green) !important; background: var(--green-dim) !important; }
.cp-btn-quick {
    display: inline-flex; align-items: center; gap: 7px;
    background: var(--gold);
    border: none;
    border-radius: var(--radius-sm);
    padding: 9px 20px;
    font-family: 'DM Mono', monospace; font-size: 10.5px; font-weight: 500;
    color: #0a0c0e;
    cursor: pointer; transition: all 0.15s;
    margin-top: 10px; letter-spacing: 0.5px;
}
.cp-btn-quick:hover { background: var(--gold-lt); box-shadow: 0 4px 16px rgba(201,168,76,0.25); }
.cp-btn-quick.copied { background: var(--green) !important; }

/* ── CHAR LIMIT BAR ─────────────────────────────────────────────────────── */
.char-bar {
    display: flex; gap: 10px; align-items: center;
    margin-top: 8px; flex-wrap: wrap;
}
.char-chip {
    font-size: 9px; color: var(--text3);
    background: var(--s2); border: 1px solid var(--bd);
    border-radius: 4px; padding: 2px 8px;
    letter-spacing: 0.3px;
}
.char-chip.ok   { color: var(--green);  border-color: rgba(52,201,122,0.3); background: var(--green-dim); }
.char-chip.warn { color: var(--orange); }
.char-chip.over { color: var(--red);    }

/* ── DIVIDER ─────────────────────────────────────────────────────────────── */
.divider { height: 1px; background: var(--bd); margin: 28px 0; }

/* ── FOOTER ──────────────────────────────────────────────────────────────── */
.app-footer {
    margin-top: 48px; padding-top: 24px;
    border-top: 1px solid var(--bd);
    display: flex; align-items: center; justify-content: space-between;
    font-size: 9.5px; color: var(--text3); letter-spacing: 0.8px;
}
.footer-brand { font-family: 'Syne', sans-serif; font-weight: 700; }

/* ── SPINNER ─────────────────────────────────────────────────────────────── */
.stSpinner > div { border-top-color: var(--gold) !important; }

/* ── COLUMN GAP ─────────────────────────────────────────────────────────── */
[data-testid="stHorizontalBlock"] { gap: 16px !important; }
</style>
""", unsafe_allow_html=True)


# ══════════════════════════════════════════════════════════════════════════════
# PASS 1 — Deep audio analysis
# ══════════════════════════════════════════════════════════════════════════════
ANALYSIS_PROMPT = """
You are an expert musicologist and audio analyst. Listen to this recording and describe exactly what you hear.
Your job is ONLY analysis — no AI music prompts yet. Be precise. Never fill in defaults.

Output using these exact headers:

## ANALYSIS
ERA: [Most likely decade and period — e.g. "Late 1950s", "Early 1970s", "Mid 1980s". Base on instrumentation, recording quality, sonic character. Be specific — not just "vintage".]
RECORDING AESTHETIC: [Evocative description — e.g. "Blue Note hard bop session", "Motown studio production", "Major label 70s soul", "Quiet storm 80s R&B", "Classic 80s new wave".]
PRODUCTION TEXTURE: [Sonic patina — analog tape warmth, vinyl surface noise, digital clarity, cassette saturation, room bleed, mic character. What does it physically feel like?]
BPM: [Tight 2-number range — e.g. "72–78". If no clear pulse, describe rhythmic feel instead.]
GROOVE: [Straight / swung / triplet / rubato / free — with nuance about how it sits and breathes.]
KEY + MODE: [e.g. "Bb minor", "D Dorian", "G Mixolydian". Include scale character and emotional color.]
CHORD MOVEMENT: [Harmonic progression in plain language — what moves, what cycles, what the harmony implies emotionally.]
INSTRUMENTATION: [Every instrument identified, named specifically — "upright bass" not "bass", "Rhodes electric piano" not "keys", "muted trumpet" not "horn". NO drums, kick, snare, hi-hats ever mentioned.]
VOCAL TONE: [If vocals: register, texture, delivery style, emotional quality. If none: "Instrumental — no vocals."]
EMOTIONAL CHARACTER: [3–5 specific mood descriptors. What does it feel like emotionally, not just genre-wise.]
SAMPLE POTENTIAL: [What would a boom bap or soul producer gravitate toward. Specific melodic or harmonic moments that beg to be chopped, pitched, and looped.]
PRODUCER DNA: [Which generation and aesthetic of sample-based hip-hop producers would recognize and reach for this. Be specific — e.g. "East Coast boom bap era: Pete Rock, Large Professor, early Premier", "Mid-2000s soul-flip generation: early Kanye, Just Blaze, No I.D.", "Lo-fi spiritual school: Madlib, J Dilla, Knxwledge", "Dark cinematic: RZA, Alchemist, Mobb Deep-era production".]
FLIP DIRECTIONS:
A. [Specific chop/pitch/tempo direction grounded in what you heard]
B. [Second distinct direction]
C. [Third direction]
""".strip()


# ══════════════════════════════════════════════════════════════════════════════
# PASS 2 — Three-output prompt generation
#
# Research findings applied:
#   SUNO QUICK: 120 chars is the OPTIMAL length for Suno quality output.
#               Overloaded prompts (400+) create chaotic, generic results.
#               Structure: [Mood]+[Era/Genre]+[2 instruments]+[vocal/none]
#
#   CLONE + SAMPLER: 400–600 chars works best across Udio and Sampla.ai
#               where richer description helps. Also usable in Suno custom mode.
#               4–7 strong descriptors outperform exhaustive paragraphs.
#
#   ERA FIRST: The era/genre anchor is Suno and Udio's strongest structural
#               signal — always leads the prompt.
#
#   INSTRUMENT SPECIFICITY: Single most powerful quality lever across all
#               three platforms. Named instruments > vague descriptors.
#
#   NO DRUM NEGATION: Saying "no drums" increases drum generation by focusing
#               the model on the concept. Genre-locking (jazz trio, solo piano,
#               string section) is the effective alternative.
# ══════════════════════════════════════════════════════════════════════════════
def build_prompt_generation(analysis_text: str) -> str:
    return f"""
You are a specialist writing AI music generation prompts for sample-based hip-hop producers.
The goal: generate audio that the greatest sample-based producers in history — Pete Rock,
J Dilla, Madlib, DJ Premier, RZA, Large Professor, Kanye (soul-flip era), Just Blaze,
Alchemist, Knxwledge — would want to chop and flip.

Write THREE prompts from this analysis. Base EVERYTHING on what the analysis found.
Do NOT use generic era language — use the EXACT era, aesthetic, and instruments detected.

RULES FOR ALL PROMPTS:
- Never mention drums, percussion, kick, snare, hi-hat, or beats of any kind
- Genre-lock to instrumental styles that naturally exclude drums (jazz trio, solo piano,
  string ensemble, chamber group) — this is MORE effective than writing "no drums"
- Lead with ERA + RECORDING AESTHETIC — strongest signal for Suno and Udio
- Specific instrument names are the single most powerful quality lever
- Production texture language (tape warmth, vinyl crackle, room bleed) = emotional depth
- End Sampler Prompt with: "the kind of record the greatest hip-hop producers would sample"

ANALYSIS:
{analysis_text}

---

## CLONE PROMPT
Single flowing paragraph. TARGET 420–560 characters, HARD MAX 700 chars.
Faithful sonic recreation of the original recording.
Structure: [ERA] [RECORDING AESTHETIC] — [specific named instruments from analysis] —
[key/harmony translated into vibe language, not theory] — [vocal tone or "purely instrumental"] —
[production texture: tape/vinyl/room] — [2–3 emotional character words] — "designed to feel loopable."
Goal: paste into Suno custom mode or Udio and get something that sounds like the analyzed recording.

## SAMPLER PROMPT
Single flowing paragraph. TARGET 420–560 characters, HARD MAX 700 chars.
Same analysis reframed for maximum hip-hop flip potential.
Structure: [ERA] [RECORDING AESTHETIC] — [specific instruments] — [tempo feel from BPM in
vibe language, not raw numbers] — [vocal or "purely instrumental"] —
[sonic imperfections from production texture: vinyl surface noise, tape saturation, room bleed,
human timing imperfection] — [emotional character] — "designed to feel loopable,
the kind of record the greatest hip-hop producers would sample."
Works identically in Suno custom mode, Udio, and Sampla.ai.

## SUNO QUICK
One dense sentence. ABSOLUTE MAXIMUM 130 characters — shorter is better.
This is the highest-quality prompt format for Suno. Fewer words = sharper output.
Structure: [Mood adjective] [era/decade] [genre/label aesthetic], [instrument 1], [instrument 2],
["purely instrumental" or vocal type]
Example length target: "Melancholy late-60s Blue Note jazz, Rhodes piano, upright bass, purely instrumental" = 83 chars
No "loopable", no texture description — just the sharpest possible sonic snapshot.
""".strip()


# ══════════════════════════════════════════════════════════════════════════════
# HELPERS
# ══════════════════════════════════════════════════════════════════════════════
def extract_section(text: str, header: str) -> str:
    pattern = rf"##\s*{re.escape(header)}\s*\n(.*?)(?=\n##\s|\Z)"
    m = re.search(pattern, text, re.DOTALL | re.IGNORECASE)
    return m.group(1).strip() if m else ""


def cap_prompt(text: str, limit: int) -> str:
    if len(text) <= limit:
        return text
    cut = text[:limit - 3]
    return cut.rsplit(" ", 1)[0] + "..."


def char_status(n: int, soft: int, hard: int) -> str:
    if n > hard:  return "over"
    if n > soft:  return "warn"
    return "ok"


def friendly_error(exc: Exception) -> str:
    msg = str(exc)
    if "429" in msg or "quota" in msg.lower():
        return "API quota exceeded. Enable billing at aistudio.google.com or retry after the rate-limit window."
    if "404" in msg:
        return "Gemini model not found. The model identifier may need updating."
    if "403" in msg or "api_key" in msg.lower() or "unauthorized" in msg.lower():
        return "Invalid API key. Verify GEMINI_KEY in Streamlit → Settings → Secrets."
    if "timeout" in msg.lower():
        return "Request timed out. Try a shorter audio clip (under 5 minutes works best)."
    if "too large" in msg.lower() or "payload" in msg.lower():
        return f"Audio file too large. Keep clips under {MAX_FILE_MB} MB."
    return f"Analysis failed — {msg[:140]}"


def file_size_str(n: int) -> str:
    return f"{n/1_048_576:.1f} MB" if n >= 1_048_576 else f"{n/1024:.0f} KB"


MAX_FILE_MB = 15


def parse_analysis(raw: str):
    """Return (fields, producer_dna, flip_block)."""
    key_pat  = re.compile(r'^([A-Z][A-Z\s+]*?):\s*(.*)')
    flip_re  = re.compile(r'^FLIP\s+DIRECTIONS\s*:', re.IGNORECASE)
    dna_re   = re.compile(r'^PRODUCER\s+DNA\s*:', re.IGNORECASE)

    fields     = []
    flip_lines = []
    producer_dna = ""
    in_flip    = False
    in_dna     = False
    cur_key    = None
    cur_val    = []
    dna_parts  = []

    for raw_line in raw.split('\n'):
        line = raw_line.strip()
        if not line:
            continue

        if flip_re.match(line):
            if cur_key and cur_val:
                fields.append((cur_key, ' '.join(cur_val)))
            cur_key, cur_val = None, []
            in_flip, in_dna = True, False
            after = flip_re.sub('', line).strip()
            if after:
                flip_lines.append(after)
            continue

        if dna_re.match(line):
            if cur_key and cur_val:
                fields.append((cur_key, ' '.join(cur_val)))
            cur_key, cur_val = None, []
            in_dna, in_flip = True, False
            after = dna_re.sub('', line).strip()
            if after:
                dna_parts.append(after)
            continue

        if in_flip:
            flip_lines.append(line)
            continue

        if in_dna:
            # Check if this is a new field (ends the DNA block)
            m = key_pat.match(line)
            if m and len(m.group(1).strip()) >= 2 and re.match(r'^[A-Z][A-Z\s+]*$', m.group(1).strip()):
                producer_dna = ' '.join(dna_parts)
                in_dna = False
                dna_parts = []
                cur_key  = m.group(1).strip()
                val_start = m.group(2).strip()
                cur_val  = [val_start] if val_start else []
            else:
                dna_parts.append(line)
            continue

        m = key_pat.match(line)
        if m:
            candidate = m.group(1).strip()
            if len(candidate) >= 2 and re.match(r'^[A-Z][A-Z\s+]*$', candidate):
                if cur_key and cur_val:
                    fields.append((cur_key, ' '.join(cur_val)))
                cur_key   = candidate
                val_start = m.group(2).strip()
                cur_val   = [val_start] if val_start else []
                continue

        if cur_key:
            cur_val.append(line)

    if cur_key and cur_val:
        fields.append((cur_key, ' '.join(cur_val)))
    if dna_parts:
        producer_dna = ' '.join(dna_parts)

    return fields, producer_dna.strip(), '\n'.join(flip_lines)


def render_analysis(raw: str) -> None:
    fields, producer_dna, flip_block = parse_analysis(raw)

    if not fields:
        escaped = html_module.escape(raw)
        st.markdown(
            f'<div class="analysis-card" style="padding:16px">'
            f'<pre style="font-family:\'DM Mono\',monospace;font-size:11px;'
            f'color:var(--text2);white-space:pre-wrap;margin:0">{escaped}</pre></div>',
            unsafe_allow_html=True,
        )
        return

    rows = "".join(
        f'<div class="ar">'
        f'<div class="ar-k">{html_module.escape(k)}</div>'
        f'<div class="ar-v">{html_module.escape(v)}</div>'
        f'</div>'
        for k, v in fields
    )
    st.markdown(f'<div class="analysis-card">{rows}</div>', unsafe_allow_html=True)

    # Producer DNA — special highlighted card
    if producer_dna:
        st.markdown(
            f'<div class="dna-card">'
            f'<div class="dna-label">Producer DNA</div>'
            f'<div class="dna-text">{html_module.escape(producer_dna)}</div>'
            f'</div>',
            unsafe_allow_html=True,
        )

    # Flip directions
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


def copy_button(text: str, btn_id: str, style: str = "default") -> None:
    """Embeds text in onclick — double quotes HTML-escaped so the attribute stays valid."""
    # json.dumps wraps in double quotes; those must become &quot; inside onclick="..."
    safe       = json.dumps(text).replace('"', '&quot;')
    cls        = "cp-btn-quick" if style == "quick" else "cp-btn"
    label      = "Copy to Suno" if style == "quick" else "&#9632;&nbsp;Copy Prompt"
    reset_str  = "Copy to Suno" if style == "quick" else "&#9632;&nbsp;Copy Prompt"
    safe_reset = json.dumps(reset_str).replace('"', '&quot;')
    st.markdown(
        f'<button class="{cls}" id="{btn_id}" '
        f'onclick="(function(b){{'
        f'navigator.clipboard.writeText({safe}).then(function(){{'
        f'b.classList.add(\'copied\');b.innerHTML=\'&#10003;&nbsp;Copied!\';'
        f'setTimeout(function(){{b.classList.remove(\'copied\');'
        f'b.innerHTML={safe_reset};}},2000);}});'
        f'}})(document.getElementById(\'{btn_id}\'))">'
        f'{label}</button>',
        unsafe_allow_html=True,
    )


def char_chips(n: int, suno_custom: int = 700, suno_quick_max: int = 130) -> str:
    """Return HTML for per-platform character limit chips."""
    sc = char_status(n, int(suno_custom * 0.85), suno_custom)
    uc = "ok"  # Udio has no hard limit
    return (
        f'<div class="char-bar">'
        f'<span class="char-chip {sc}">Suno Custom&nbsp;{n}/{suno_custom}</span>'
        f'<span class="char-chip {uc}">Udio&nbsp;✓</span>'
        f'<span class="char-chip {uc}">Sampla.ai&nbsp;✓</span>'
        f'</div>'
    )


def quick_char_chips(n: int) -> str:
    sc = char_status(n, 100, 130)
    return (
        f'<div class="char-bar">'
        f'<span class="char-chip {sc}">Suno&nbsp;{n}/130 chars</span>'
        f'<span class="char-chip ok">Optimal&nbsp;quality&nbsp;range</span>'
        f'</div>'
    )


# ══════════════════════════════════════════════════════════════════════════════
# SESSION STATE
# ══════════════════════════════════════════════════════════════════════════════
for _k, _v in [
    ("app_state",      "idle"),
    ("analysis",       ""),
    ("clone_prompt",   ""),
    ("sampler_prompt", ""),
    ("suno_quick",     ""),
    ("upload_key",     0),
]:
    if _k not in st.session_state:
        st.session_state[_k] = _v


# ══════════════════════════════════════════════════════════════════════════════
# API KEY
# ══════════════════════════════════════════════════════════════════════════════
_api_key   = None
_key_error = None
try:
    _api_key = st.secrets.get("GEMINI_KEY", "")
    if not _api_key:
        _key_error = (
            "GEMINI_KEY is not configured. "
            "Go to Streamlit Cloud → your app → Settings → Secrets and add: "
            'GEMINI_KEY = "your-key-here"'
        )
except Exception:
    _key_error = "Could not read app secrets. Add GEMINI_KEY in Streamlit Cloud → Settings → Secrets."


# ══════════════════════════════════════════════════════════════════════════════
# RENDER
# ══════════════════════════════════════════════════════════════════════════════
st.markdown('<div class="page">', unsafe_allow_html=True)

# ── HEADER ────────────────────────────────────────────────────────────────────
st.markdown("""
<div class="hdr">
  <div class="hdr-top">
    <div class="hdr-left">
      <div class="hdr-eyebrow">130 MODE · Booman Systems</div>
      <div class="hdr-title">Sample Prompt <span>1200</span></div>
      <div class="hdr-tagline">AI-powered sample analysis for hip-hop producers.<br>Drop any audio — get ready-to-paste prompts for Suno, Udio &amp; Sampla.</div>
    </div>
    <div class="hdr-badge">
      <div class="hdr-badge-num">130</div>
      <div class="hdr-badge-txt">MODE</div>
    </div>
  </div>
  <div class="platform-row">
    <span class="platform-label">Works with</span>
    <span class="platform-pill">Suno</span>
    <span class="platform-pill">Udio</span>
    <span class="platform-pill">Sampla.ai</span>
  </div>
</div>
""", unsafe_allow_html=True)

# ── API KEY ERROR ─────────────────────────────────────────────────────────────
if _key_error:
    st.markdown(
        f'<div class="alert">{html_module.escape(_key_error)}</div>',
        unsafe_allow_html=True,
    )

# ── STATUS BAR ────────────────────────────────────────────────────────────────
_status_map = {
    "idle":  ("idle",   "Ready — drop a sample to begin"),
    "pass1": ("active", "Pass 1 of 2 — Reading and analyzing audio..."),
    "pass2": ("active", "Pass 2 of 2 — Building prompts from analysis..."),
    "done":  ("done",   "Analysis complete — prompts ready to copy"),
    "error": ("error",  "Error — see details below"),
}
_dot, _stxt = _status_map.get(st.session_state.app_state, ("idle", "Ready"))
status_slot = st.empty()
status_slot.markdown(
    f'<div class="statusbar">'
    f'<div class="sdot {_dot}"></div>'
    f'<span>{html_module.escape(_stxt)}</span>'
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
    st.markdown(
        f'<div class="file-chip">'
        f'<span class="file-chip-dot">●</span>'
        f'<span class="file-chip-name">{html_module.escape(uploaded_file.name)}</span>'
        f'<span class="file-chip-size">{file_size_str(len(raw_bytes))}</span>'
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

    if len(raw_bytes) / 1_048_576 > MAX_FILE_MB:
        st.session_state.app_state = "error"
        status_slot.markdown(
            f'<div class="statusbar"><div class="sdot error"></div>'
            f'<span>File too large ({len(raw_bytes)/1_048_576:.1f} MB) — max is {MAX_FILE_MB} MB</span></div>',
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
                '<div class="statusbar"><div class="sdot active"></div>'
                '<span>Pass 1 of 2 — Reading and analyzing audio...</span></div>',
                unsafe_allow_html=True,
            )
            with st.spinner(""):
                r1 = model.generate_content([ANALYSIS_PROMPT, audio_part])
                st.session_state.analysis = (
                    extract_section(r1.text, "ANALYSIS") or r1.text
                )

            # PASS 2 — text-only prompt generation
            st.session_state.app_state = "pass2"
            status_slot.markdown(
                '<div class="statusbar"><div class="sdot active"></div>'
                '<span>Pass 2 of 2 — Crafting prompts from analysis...</span></div>',
                unsafe_allow_html=True,
            )
            with st.spinner(""):
                r2   = model.generate_content(
                    build_prompt_generation(st.session_state.analysis)
                )
                raw2 = r2.text
                st.session_state.clone_prompt   = cap_prompt(
                    extract_section(raw2, "CLONE PROMPT"), 700
                )
                st.session_state.sampler_prompt = cap_prompt(
                    extract_section(raw2, "SAMPLER PROMPT"), 700
                )
                st.session_state.suno_quick = cap_prompt(
                    extract_section(raw2, "SUNO QUICK"), 130
                )

            st.session_state.app_state = "done"
            status_slot.markdown(
                '<div class="statusbar"><div class="sdot done"></div>'
                '<span>Analysis complete — prompts ready to copy</span></div>',
                unsafe_allow_html=True,
            )

        except Exception as e:
            st.session_state.app_state = "error"
            err_msg = friendly_error(e)
            status_slot.markdown(
                f'<div class="statusbar"><div class="sdot error"></div>'
                f'<span>{html_module.escape(err_msg[:90])}</span></div>',
                unsafe_allow_html=True,
            )
            st.markdown(
                f'<div class="alert">{html_module.escape(err_msg)}</div>',
                unsafe_allow_html=True,
            )


# ── RESULTS ───────────────────────────────────────────────────────────────────
if st.session_state.analysis:
    st.markdown('<div class="divider"></div>', unsafe_allow_html=True)

    # ── ANALYSIS ──
    st.markdown(
        '<div class="sec-label">Sample Analysis<div class="sec-rule"></div></div>',
        unsafe_allow_html=True,
    )
    render_analysis(st.session_state.analysis)

    st.markdown('<div style="height:20px"></div>', unsafe_allow_html=True)

    # ── CLONE + SAMPLER — side by side ──
    st.markdown(
        '<div class="sec-label">Generated Prompts<div class="sec-rule"></div></div>',
        unsafe_allow_html=True,
    )

    col_l, col_r = st.columns(2, gap="medium")

    # CLONE
    with col_l:
        if st.session_state.clone_prompt:
            n = len(st.session_state.clone_prompt)
            # Each st.markdown call must be self-contained (balanced tags).
            # Splitting an opening <div> across calls breaks the DOM and causes
            # subsequent elements to render as raw HTML text.
            st.markdown(
                '<div class="prompt-card-title">Clone Prompt</div>'
                '<div class="prompt-card-sub">Faithful sonic recreation</div>',
                unsafe_allow_html=True,
            )
            st.text_area(
                "clone", value=st.session_state.clone_prompt,
                height=160, key="ta_clone", label_visibility="collapsed",
            )
            st.markdown(char_chips(n), unsafe_allow_html=True)
            copy_button(st.session_state.clone_prompt, "cb_clone")
        elif st.session_state.app_state == "done":
            st.markdown(
                '<div class="alert">Clone prompt not generated — try again.</div>',
                unsafe_allow_html=True,
            )

    # SAMPLER
    with col_r:
        if st.session_state.sampler_prompt:
            n = len(st.session_state.sampler_prompt)
            st.markdown(
                '<div class="prompt-card-title">Sampler Prompt</div>'
                '<div class="prompt-card-sub">Hip-hop flip optimized</div>',
                unsafe_allow_html=True,
            )
            st.text_area(
                "sampler", value=st.session_state.sampler_prompt,
                height=160, key="ta_sampler", label_visibility="collapsed",
            )
            st.markdown(char_chips(n), unsafe_allow_html=True)
            copy_button(st.session_state.sampler_prompt, "cb_sampler")
        elif st.session_state.app_state == "done":
            st.markdown(
                '<div class="alert">Sampler prompt not generated — try again.</div>',
                unsafe_allow_html=True,
            )

    # SUNO QUICK — full width, gold treatment
    if st.session_state.suno_quick:
        n = len(st.session_state.suno_quick)
        st.markdown(
            '<div class="quick-card-title">&#9632; Suno Quick Prompt</div>'
            '<div class="quick-card-sub">'
            '~120-char optimized format · Suno generates highest quality output at this length'
            '</div>',
            unsafe_allow_html=True,
        )
        st.text_area(
            "quick", value=st.session_state.suno_quick,
            height=80, key="ta_quick", label_visibility="collapsed",
        )
        st.markdown(quick_char_chips(n), unsafe_allow_html=True)
        copy_button(st.session_state.suno_quick, "cb_quick", style="quick")
    elif st.session_state.app_state == "done":
        st.markdown(
            '<div class="alert">Suno Quick prompt not generated — try again.</div>',
            unsafe_allow_html=True,
        )

    # ── RESET ──
    st.markdown('<div class="divider"></div>', unsafe_allow_html=True)
    if st.button("↺  New Analysis", key="reset_btn"):
        st.session_state.app_state      = "idle"
        st.session_state.analysis       = ""
        st.session_state.clone_prompt   = ""
        st.session_state.sampler_prompt = ""
        st.session_state.suno_quick     = ""
        st.session_state.upload_key    += 1
        st.rerun()


# ── FOOTER ────────────────────────────────────────────────────────────────────
st.markdown("""
<div class="app-footer">
  <span class="footer-brand">Sample Prompt 1200</span>
  <span>130 MODE · Booman Systems · 2026</span>
</div>
""", unsafe_allow_html=True)

st.markdown('</div>', unsafe_allow_html=True)
