import streamlit as st
import google.generativeai as genai

# --- SP-1200 STYLING ---
st.set_page_config(page_title="Sample Prompt 1200", layout="centered")

st.markdown("""
    <style>
    .stApp { background-color: #8c8c8c; color: #1a1a1a; font-family: 'Courier New', Courier, monospace; }
    .lcd-screen {
        background-color: #3e0a0a; color: #ff3232; padding: 20px;
        border: 10px solid #222; border-radius: 5px; text-transform: uppercase;
        box-shadow: inset 0px 0px 15px #000; margin-bottom: 20px;
    }
    .stButton>button {
        background-color: #e0e0e0; color: #1a1a1a; border: 4px solid #444;
        border-bottom: 8px solid #222; font-weight: bold; height: 80px; width: 100%;
    }
    </style>
    """, unsafe_allow_html=True)

# --- UI ---
st.markdown('<div class="lcd-screen"><h1>SP-1200</h1><p>Status: Ready to Sample</p></div>', unsafe_allow_html=True)

# Access the API key securely from Streamlit Cloud settings
api_key = st.secrets["GEMINI_KEY"]
genai.configure(api_key=api_key)

uploaded_file = st.file_uploader("DROP TRACK", type=["mp3", "wav", "m4a"])

if uploaded_file and st.button("RUN ANALYSIS"):
    with st.spinner("QUANTIZING..."):
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        # Hardcoded conversion prompt
        prompt = """
        Analyze this uploaded audio strictly for musical and production elements.
        Assume I am using it for: Drumless sample chopping and Boom bap flipping.
        Do NOT include drums in any recreation prompts.
        Provide:
        - BPM (tight range estimate)
        - Groove type (straight, swung, triplet feel)
        - Key + chord movement tendencies
        - Vocal tone classification
        - Arrangement arc
        - Emotional intensity curve
        
        Then generate:
        - One highly detailed Suno prompt (drumless style string, no percussion)
        - One minimal Suno prompt (compressed tags)
        - A 16-bar flip blueprint for DAW execution.
        """
        
        response = model.generate_content([prompt, {"mime_type": "audio/mp3", "data": uploaded_file.getvalue()}])
        
        st.markdown('<div class="lcd-screen">PROMPT GENERATED // DISK READY</div>', unsafe_allow_html=True)
        st.code(response.text, language="markdown")
        st.info("Files are processed in RAM. Refreshing the browser purges all data.")
