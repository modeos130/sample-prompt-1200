import streamlit as st
import google.generativeai as genai

# --- 130 MODE SP-1200 FINAL STABLE BUILD ---
st.set_page_config(page_title="Sample Prompt 1200", layout="centered")

st.markdown("""
    <style>
    @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap');
    .stApp { background-color: #121212; font-family: 'JetBrains Mono', monospace; color: #e0e0e0; }
    
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
        width: 100px; height: 100px; margin: 0 auto 20px auto;
        border-radius: 50%; border: 3px solid #39FF14; background: black;
        display: flex; flex-direction: column; justify-content: center; align-items: center;
        box-shadow: 0 0 25px rgba(57,255,20,0.6);
    }
    .logo-130 { color: #39FF14; font-size: 32px; font-weight: 900; line-height: 0.8; }
    .logo-mode { color: #39FF14; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; }

    /* NEON LCD SCREEN */
    .lcd-screen {
        background-color: #000; border: 4px solid #1a1a1a; border-radius: 4px;
        padding: 25px; min-height: 140px; display: flex; flex-direction: column;
        justify-content: center; align-items: center; border-style: inset;
        box-shadow: inset 0 0 20px rgba(57,255,20,0.2); margin: 20px 0;
    }
    .lcd-text {
        color: #39FF14; font-weight: 700; text-transform: uppercase; letter-spacing: 3px;
        text-shadow: 0 0 12px rgba(57,255,20,0.9); font-size: 18px; text-align: center;
    }

    /* UPLOADER / DISK SLOT */
    .stFileUploader { background-color: #
