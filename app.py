import streamlit as st
import google.generativeai as genai

# --- 130 MODE SP-1200 FINAL BUILD ---
st.set_page_config(page_title="Sample Prompt 1200", layout="centered")

# Custom CSS for the Industrial Hardware Look
st.markdown("""
    <style>
    @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap');
    
    .stApp {
        background-color: #121212;
        font-family: 'JetBrains Mono', monospace;
        color: #e0e0e0;
    }

    /* THE CHASSIS */
    .chassis {
        background-color: #2d2d2d;
        background-image: url('https://www.transparenttextures.com/patterns/carbon-fibre.png');
        border: 4px solid #1a1a1a;
        border-radius: 24px;
        padding: 40px;
        box-shadow: 0 30px 60px rgba(0,0,0,0.8);
        border-bottom: 12px solid #111;
        margin-top: 20px;
    }

    /* 130 MODE NEON LOGO */
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
        font-size: 18px;
        text-align: center;
    }

    /* DRAG & DROP ZONE STYLING */
    .stFileUploader {
        background-color: #1a1a1a;
        border: 2px dashed #39FF14;
        border-radius: 10px;
        padding: 10px;
    }

    /* HARDWARE PADS */
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
        transition: 0.1s !important;
    }
    .stButton>button:active {
        border-bottom: 2px solid #111 !important;
        transform: translateY(4px) !important;
    }

    header, footer {visibility: hidden;}
    </style>
    """, unsafe_allow_html=True)

# --- BRANDING ---
st.markdown("""
<div class="logo-container">
    <div class="logo-130">130</div>
    <div class="logo-mode">Mode</div>
</div>
<div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #8e8e8e; font-size: 28px; font-weight: 900; margin:0;">BOOMAN SYSTEMS</h1>
    <p style="color: #444; font-size: 10px; font-weight: bold; letter-spacing: 4px; margin:0;">SP-1200 PROMPT GENERATOR</p>
</div>
""", unsafe_allow_html=True)

# --- SAMPLER ENGINE ---
st.markdown('<div class="chassis">', unsafe_allow_html=True)

lcd_placeholder = st.empty()
lcd_placeholder.markdown('<div class="lcd-screen"><div class="lcd-text">READY: BANK A</div></div>', unsafe_allow_html=True)

st.markdown('<p style="color:#555; font-size:9px; font-weight:bold; text-transform:uppercase; margin-bottom:5px;">Load Sample Disk / Drag Track Below</p>', unsafe_allow_html=True)
uploaded_file = st.file_uploader("", type=["mp3", "wav"])

if uploaded_file:
    if st.button("RUN 12-BIT ANALYSIS"):
        with st.spinner("QUANTIZING..."):
            try:
                # Access the secret key from Streamlit Settings
                api_key = st.secrets["GEMINI_KEY"]
                genai.configure(api_key=api_key)
                model = genai.GenerativeModel('gemini-1.5-flash')
                
                # Your specific hardcoded prompt
                prompt = """
                Analyze this uploaded audio strictly for musical and production elements.
                Assume I am using it for: Drumless sample chopping and Boom bap flipping.
                Do NOT include drums in any recreation prompts.
                Provide:
                BPM (tight range estimate), Groove type, Key + chord movement tendencies, 
                Vocal tone classification, Arrangement arc, Emotional intensity curve.
                
                Then generate:
                - One highly detailed Suno prompt (drumless only)
                - One minimal Suno prompt (compressed version)
                - A 16-bar flip blueprint for DAW execution.
                """
                
                response = model.generate_content([prompt, {"mime_type": "audio/mp3", "data": uploaded_file.getvalue()}])
                
                # Update LCD with response
                lcd_placeholder.markdown(f"""
                    <div class="lcd-screen" style="height:350px; overflow-y:auto; align-items:flex-start; text-align:left;">
                        <div class="lcd-text" style="font-size:13px; text-transform:none; text-shadow:none; line-height:1.5;">
                            {response.text.replace(chr(10), '<br>')}
                        </div>
                    </div>
                """, unsafe_allow_html=True)
                
                # Copyable code block
                st.code(response.text, language="markdown")
                
            except Exception as e:
                st.error(f"Hardware Error: {str(e)}")

st.markdown('</div>', unsafe_allow_html=True)
st.markdown('<p style="text-align:center; color:#222; font-size:8px; margin-top:30px; letter-spacing:3px;">12-BIT LINEAR // 130 MODE &copy; 2026</p>', unsafe_allow_html=True)
