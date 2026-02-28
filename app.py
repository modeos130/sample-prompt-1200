import streamlit as st
import google.generativeai as genai

# --- 130 MODE SP-1200 MASTER UI ---
st.set_page_config(page_title="Sample Prompt 1200", layout="centered")

st.markdown("""
    <style>
    @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap');
    .stApp { background-color: #121212; font-family: 'JetBrains Mono', monospace; color: #e0e0e0; }
    .chassis { background-color: #2d2d2d; border: 4px solid #1a1a1a; border-radius: 20px; padding: 30px; box-shadow: 0 20px 50px rgba(0,0,0,0.5); margin-top: 20px; }
    .lcd-screen { background-color: #000; border: 2px solid #1a1a1a; border-radius: 8px; padding: 20px; min-height: 120px; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; }
    .lcd-text { color: #39FF14; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; text-shadow: 0 0 8px rgba(57,255,20,0.8); }
    .logo-circle { width: 60px; height: 60px; border: 2px solid #39FF14; border-radius: 50%; display: flex; flex-direction: column; justify-content: center; align-items: center; background: #000; box-shadow: 0 0 15px rgba(57,255,20,0.4); }
    .stButton>button { background-color: #1a1a1a !important; color: #39FF14 !important; border: 2px solid #39FF14 !important; border-radius: 12px !important; text-transform: uppercase !important; font-weight: bold !important; height: 60px !important; width: 100%; }
    header, footer {visibility: hidden;}
    </style>
    """, unsafe_allow_html=True)

# --- HEADER ---
col1, col2 = st.columns([1, 4])
with col1:
    st.markdown('<div class="logo-circle"><span style="color:#39FF14; font-size:18px; font-weight:900;">130</span><span style="color:#39FF14; font-size:8px; font-weight:700;">Mode</span></div>', unsafe_allow_html=True)
with col2:
    st.markdown('<h1 style="margin:0; color:#8e8e8e; font-size:24px;">BOOMAN SYSTEMS</h1><p style="margin:0; color:#555; font-size:10px; font-weight:bold;">SP-1200 SAMPLE PROMPT GENERATOR</p>', unsafe_allow_html=True)

# --- THE CHASSIS ---
st.markdown('<div class="chassis">', unsafe_allow_html=True)
uploaded_file = st.file_uploader("LOAD SAMPLE DISK (MP3/WAV)", type=["mp3", "wav"])
lcd_placeholder = st.empty()
lcd_placeholder.markdown('<div class="lcd-screen"><div class="lcd-text">READY: BANK A</div></div>', unsafe_allow_html=True)

if uploaded_file:
    if st.button("RUN 12-BIT ANALYSIS"):
        with st.spinner("QUANTIZING..."):
            api_key = st.secrets["GEMINI_KEY"]
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel('gemini-1.5-flash')
            
            # The Master Logic
            analysis_prompt = "Analyze this audio for BPM, Key, Vocal Tone, and provide one Detailed Suno Style String (Drumless Only). No drums mentioned."
            
            response = model.generate_content([analysis_prompt, {"mime_type": "audio/mp3", "data": uploaded_file.getvalue()}])
            
            # Clean display of results
            lcd_placeholder.markdown(f'<div class="lcd-screen" style="height:200px; overflow-y:auto;"><div class="lcd-text" style="font-size:12px; text-transform:none;">{response.text}</div></div>', unsafe_allow_html=True)
            st.code(response.text, language="markdown")
st.markdown('</div>', unsafe_allow_html=True)
