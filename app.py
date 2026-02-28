import streamlit as st
import google.generativeai as genai

# --- SP-1200 / 130 MODE HARDWARE SKIN ---
st.set_page_config(page_title="Sample Prompt 1200", layout="centered")

st.markdown("""
    <style>
    @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap');
    
    /* Background & Chassis */
    .stApp {
        background-color: #121212;
        font-family: 'JetBrains Mono', monospace;
        color: #e0e0e0;
    }
    
    .main .block-container {
        padding-top: 2rem;
        max-width: 600px;
    }

    /* THE CHASSIS - Carbon Fiber Texture */
    .stMarkdown div[data-testid="stVerticalBlock"] > div:has(.chassis-marker) {
        background-color: #2d2d2d;
        background-image: url('https://www.transparenttextures.com/patterns/carbon-fibre.png');
        border: 4px solid #1a1a1a;
        border-radius: 24px;
        padding: 40px !important;
        box-shadow: 0 30px 60px rgba(0,0,0,0.8);
        border-bottom: 12px solid #111;
    }

    /* 130 MODE INTEGRATED LOGO */
    .logo-container {
        width: 100px;
        height: 100px;
        margin: 0 auto 20px auto;
        border-radius: 50%;
        border: 3px solid #39FF14;
        background: black;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        box-shadow: 0 0 25px rgba(57,255,20,0.6);
    }
    .logo-130 { color: #39FF14; font-size: 32px; font-weight: 900; line-height: 0.8; }
    .logo-mode { color: #39FF14; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; }

    /* NEON LCD SCREEN */
    .lcd-screen {
        background-color: #000;
        border: 4px solid #1a1a1a;
        border-radius: 4px;
        padding: 25px;
        min-height: 140px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        box-shadow: inset 0 0 20px rgba(57,255,20,0.2);
        margin: 20px 0;
        border-style: inset;
    }
    .lcd-text {
        color: #39FF14;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 3px;
        text-shadow: 0 0 12px rgba(57,255,20,0.9);
        font-size: 20px;
        text-align: center;
    }

    /* PADS / BUTTONS */
    .stButton>button {
        background-color: #3d3d3d !important;
        color: #39FF14 !important;
        border: 2px solid #1a1a1a !important;
        border-bottom: 6px solid #111 !important;
        border-radius: 8px !important;
        font-weight: bold !important;
        height: 80px !important;
        width: 100%;
        font-size: 18px !important;
        letter-spacing: 2px !important;
        transition: 0.1s !important;
    }
    .stButton>button:active {
        border-bottom: 2px solid #111 !important;
        transform: translateY(4px) !important;
    }

    /* Hide Streamlit UI */
    header, footer {visibility: hidden;}
    </style>
    """, unsafe_allow_html=True)

# --- THE SAMPLER INTERFACE ---
st.markdown('<div class="chassis-marker"></div>', unsafe_allow_html=True)

# Branding Header
st.markdown("""
<div class="logo-container">
    <div class="logo-130">130</div>
    <div class="logo-mode">Mode</div>
</div>
<div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #8e8e8e; font-size: 28px; font-weight: 900; margin:0; letter-spacing:-1px;">BOOMAN SYSTEMS</h1>
    <p style="color: #444; font-size: 10px; font-weight: bold; letter-spacing: 4px; margin:0;">SP-1200 PROMPT GENERATOR</p>
</div>
""", unsafe_allow_html=True)

# LCD Display
lcd_placeholder = st.empty()
lcd_placeholder.markdown('<div class="lcd-screen"><div class="lcd-text">READY: BANK A</div></div>', unsafe_allow_html=True)

# File Input (Disguised as a Disk Slot)
st.markdown('<p style="color:#555; font-size:9px; font-weight:bold; margin-bottom:5px; text-transform:uppercase;">Load Sample Disk</p>', unsafe_allow_html=True)
uploaded_file = st.file_uploader("", type=["mp3", "wav"])

# Action Pad
if uploaded_file:
    if st.button("RUN 12-BIT ANALYSIS"):
        with st.spinner("QUANTIZING..."):
            try:
                api_key = st.secrets["GEMINI_KEY"]
                genai.configure(api_key=api_key)
                model = genai.GenerativeModel('gemini-1.5-flash')
                
                # Conversion logic from Step 3
                prompt = "Analyze audio for BPM, Key, Vocal Tone, and a drumless Suno prompt."
                response = model.generate_content([prompt, {"mime_type": "audio/mp3", "data": uploaded_file.getvalue()}])
                
                # Result rendered in Neon LCD
                lcd_placeholder.markdown(f"""
                    <div class="lcd-screen" style="height:320px; overflow-y:auto; align-items:flex-start; text-align:left;">
                        <div class="lcd-text" style="font-size:13px; text-transform:none; text-shadow:none;">
                            {response.text.replace(chr(10), '<br>')}
                        </div>
                    </div>
                """, unsafe_allow_html=True)
                
                st.code(response.text, language="markdown")
            except Exception as e:
                st.error("Check Secrets/API Key.")

# Bottom Utility Info
st.markdown('<p style="text-align:center; color:#222; font-size:8px; margin-top:40px; letter-spacing:3px;">12-BIT LINEAR // BOOMAN SYSTEMS &copy; 2026</p>', unsafe_allow_html=True)
