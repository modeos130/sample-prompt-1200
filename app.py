import streamlit as st
import google.generativeai as genai
import os

# --- 130 MODE SP-1200 MASTER UI ---
st.set_page_config(page_title="Sample Prompt 1200", layout="centered", initial_sidebar_state="collapsed")

# Injecting the AI Studio CSS and Font
st.markdown("""
    <style>
    @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap');
    
    .stApp {
        background-color: #121212;
        font-family: 'JetBrains Mono', monospace;
        color: #e0e0e0;
    }
    
    /* The Sampler Chassis */
    .chassis {
        background-color: #2d2d2d;
        border: 4px solid #1a1a1a;
        border-radius: 20px;
        padding: 30px;
        box-shadow: 0 20px 50px rgba(0,0,0,0.5);
        margin-top: 20px;
        position: relative;
    }

    /* The Neon LCD */
    .lcd-screen {
        background-color: #000;
        border: 2px solid #1a1a1a;
        border-radius: 8px;
        padding: 20px;
        min-height: 120px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        text-align: center;
        box-shadow: inset 0 0 15px rgba(57,255,20,0.2);
    }

    .lcd-text {
        color: #39FF14;
        font-weight: bold;
        text-transform: uppercase;
        letter-spacing: 2px;
        text-shadow: 0 0 8px rgba(57,255,20,0.8);
    }

    /* 130 Mode Logo Circle */
    .logo-circle {
        width: 60px;
        height: 60px;
        border: 2px solid #39FF14;
        border-radius: 50%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        background: #000;
        box-shadow: 0 0 15px rgba(57,255,20,0.4);
    }

    /* Buttons / Pads */
    .stButton>button {
        background-color: #1a1a1a !important;
        color: #39FF14 !important;
        border: 2px solid #39FF14 !important;
        border-radius: 12px !important;
        text-transform: uppercase !important;
        font-weight: bold !important;
        height: 60px !important;
        transition: 0.3s !important;
    }

    .stButton>button:hover {
        box-shadow: 0 0 15px rgba(57,255,20,0.4) !important;
        background-color: #39FF14 !important;
        color: #000 !important;
    }

    /* Hide Streamlit Header/Footer for cleaner hardware look */
    header, footer {visibility: hidden;}
    </style>
    """, unsafe_allow_html=True)

# --- HARDWARE HEADER ---
col1, col2 = st.columns([1, 4])
with col1:
    st.markdown("""
        <div class="logo-circle">
            <span style="color:#39FF14; font-size:18px; font-weight:900; line-height:1;">130</span>
            <span style="color:#39FF14; font-size:8px; font-weight:700; text-transform:uppercase;">Mode</span>
        </div>
    """, unsafe_allow_html=True)
with col2:
    st.markdown("""
        <h1 style="margin:0; color:#8e8e8e; font-size:24px; letter-spacing:-1px;">BOOMAN SYSTEMS</h1>
        <p style="margin:0; color:#555; font-size:10px; font-weight:bold; letter-spacing:2px;">SP-1200 SAMPLE PROMPT GENERATOR</p>
    """, unsafe_allow_html=True)

# --- THE CHASSIS ---
with st.container():
    st.markdown('<div class="chassis">', unsafe_allow_html=True)
    
    # 1. Loading Section
    uploaded_file = st.file_uploader("LOAD SAMPLE DISK (MP3/WAV)", type=["mp3", "wav"])
    
    # 2. LCD Display
    lcd_placeholder = st.empty()
    lcd_placeholder.markdown("""
        <div class="lcd-screen">
            <div class="lcd-text" style="font-size:20px;">READY: BANK A</div>
        </div>
    """, unsafe_allow_html=True)

    # 3. Trigger
    if uploaded_file:
        if st.button("RUN 12-BIT ANALYSIS"):
            with st.spinner("QUANTIZING..."):
                # Initialize Gemini
                api_key = st.secrets["GEMINI_KEY"]
                genai.configure(api_key=api_key)
                model = genai.GenerativeModel('gemini-1.5-flash')
                
                # Master Prompt for Suno/Udio
                analysis_prompt = """
                Analyze this audio for:
                1. BPM (Tight range)
                2. Key/Chord Mood
                3. Vocal Tone
                4. One Detailed Suno Style String (Drumless Only, No Percussion)
                5. One Minimal Suno Style String (Tags Only)
                6. 16-Bar Flip Blueprint
                STRICT: Do not mention drums in style strings.
                """
                
                response = model.generate_content([
                    analysis_prompt, 
                    {"mime_type": "audio/mp3", "data": uploaded_file.getvalue()}
                ])
                
                # Update LCD with Result
                lcd_placeholder.markdown(f"""
                    <div class="lcd-screen" style="text-align:left; overflow-y:auto; height:250px;">
                        <div class="lcd-text" style="font-size:14px; text-transform:none; line-height:1.4
