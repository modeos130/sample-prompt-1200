import streamlit as st
import google.generativeai as genai

# --- 130 MODE x SP-1200 AESTHETIC ---
st.set_page_config(page_title="Sample Prompt 1200", layout="centered")

st.markdown("""
    <style>
    /* The SP-1200 Metal Chassis */
    .stApp {
        background-color: #222222;
        background-image: linear-gradient(45deg, #1a1a1a 25%, transparent 25%), 
                          linear-gradient(-45deg, #1a1a1a 25%, transparent 25%);
        background-size: 4px 4px;
        color: #FFFFFF;
        font-family: 'Courier New', Courier, monospace;
    }

    /* 130 Mode Neon LCD */
    .lcd-screen {
        background-color: #001a00;
        color: #39FF14; /* 130 Mode Neon Green */
        padding: 30px;
        border: 6px solid #444;
        border-radius: 2px;
        text-transform: uppercase;
        box-shadow: 0px 0px 20px #39FF14;
        margin-bottom: 30px;
        text-align: center;
        border-style: inset;
    }

    /* The 'Pads' and Industrial Buttons */
    .stButton>button {
        background-color: #333;
        color: #39FF14;
        border: 3px solid #39FF14;
        border-bottom: 6px solid #1a5a0d;
        font-weight: bold;
        text-transform: uppercase;
        height: 100px;
        width: 100%;
        font-size: 20px;
        transition: 0.1s;
    }
    .stButton>button:active {
        border-bottom: 2px solid #39FF14;
        transform: translateY(4px);
    }

    /* File Uploader Customization */
    .stFileUploader {
        background-color: #111;
        border: 2px dashed #39FF14;
        padding: 20px;
        color: #39FF14;
    }
    
    .logo-container {
        text-align: center;
        margin-bottom: 10px;
    }
    </style>
    """, unsafe_allow_html=True)

# --- BRANDING & LCD ---
# Replace the URL below with your raw GitHub logo link once uploaded
st.markdown('<div class="logo-container"><img src="https://github.com/modeos130/sample-prompt-1200/blob/main/130%20Mode%20Logo%203000%20x%203000.png?raw=true" width="200"></div>', unsafe_allow_html=True)
st.markdown('<div class="lcd-screen"><h1>SP-1200</h1><p>STATUS: READY TO SAMPLE</p></div>', unsafe_allow_html=True)

# --- API LOGIC ---
api_key = st.secrets["GEMINI_KEY"]
genai.configure(api_key=api_key)

uploaded_file = st.file_uploader("LOAD SAMPLE DISK", type=["mp3", "wav", "m4a"])

if uploaded_file and st.button("RUN 12-BIT ANALYSIS"):
    with st.spinner("QUANTIZING FOR 130 MODE..."):
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        prompt = """
        Analyze this audio strictly for musical and production elements.
        Focus: Drumless sample beds for Boom Bap production.
        STRICT RULE: Do NOT include drums in any recreation prompts.
        
        Output:
        1. BPM & Groove (Swung/Straight)
        2. Key & Chord Mood
        3. Vocal Texture
        4. Suno/Udio Style String (12-15 comma-separated tags, drumless only)
        5. The 16-Bar Flip Blueprint
        """
        
        response = model.generate_content([prompt, {"mime_type": "audio/mp3", "data": uploaded_file.getvalue()}])
        
        st.markdown('<div class="lcd-screen">DISK ANALYSIS COMPLETE // READY</div>', unsafe_allow_html=True)
        st.code(response.text, language="markdown")
