# Sample Prompt 1200 — Claude Project Context

## Project Overview
This repo contains two apps:
- **V1** (root): Streamlit Python app (`app.py`) — legacy, do not modify unless asked
- **V2** (`v2/`): Next.js 14 + TypeScript + Tailwind — the active project

## V2 Stack
- Framework: Next.js 14 (App Router)
- Language: TypeScript
- Styling: Tailwind CSS + DM Mono + Syne fonts (Google Fonts)
- AI: Gemini 2.5 Flash via `@google/generative-ai`
- Deployment: Vercel (root directory = `v2/`)

## V2 Architecture
```
v2/
├── app/
│   ├── page.tsx              # Main app — genre selector + uploader + results
│   ├── layout.tsx            # Root layout
│   ├── globals.css           # Global styles + custom animations
│   └── api/analyze/route.ts  # Two-pass Gemini API route (POST)
├── components/
│   ├── GenreSelector.tsx     # 3-card genre picker (first screen)
│   ├── AudioUploader.tsx     # Drag/drop file upload + analyze button
│   ├── AnalysisOutput.tsx    # Structured analysis table
│   └── PromptOutput.tsx      # Generated prompt + copy button + char counter
└── lib/genres/
    ├── boom-bap.ts           # Analysis prompt + buildBoomBapPrompt()
    ├── house.ts              # Analysis prompt + buildHousePrompt()
    └── trap.ts               # Analysis prompt + buildTrapPrompt()
```

## Genre Logic
Each genre has two exports:
1. `[GENRE]_ANALYSIS_PROMPT` — sent to Gemini with audio for Pass 1 (analysis)
2. `build[Genre]Prompt(analysisText)` — builds Pass 2 prompt (text only, returns generated AI music prompt)

### Genre Era Locks (non-negotiable in prompts)
- **Boom Bap**: late 1960s–1970s, 78–90 BPM, minor/modal, live band, 2-inch tape
- **House**: late 1970s–1980s, 118–128 BPM, soulful/gospel, analog warmth
- **Trap**: 1970s–1990s dark cinematic/orchestral, 65–75 BPM, gothic atmosphere

### Prompt Rules (all genres)
- Max 1000 characters
- NEVER mention real artist, producer, or band names
- NEVER mention drums, kick, snare, hi-hat, 808, or any rhythmic element
- Always minor/modal tonality — no major key
- Designed to feel loopable

## Environment Variables
- `GEMINI_KEY` — Google Gemini API key (required)
- Get one free at: https://aistudio.google.com/app/apikey

## Git Workflow
- **Active dev branch**: `claude/audit-streamlit-genai-app-n38yj`
- **Production branch**: `main` (push-restricted in this sandbox — only `claude/` branches can be pushed from here)
- All changes: commit + push to `claude/audit-streamlit-genai-app-n38yj`
- Merging to main: done manually via GitHub PR

## Vercel Setup
- Project: `sample-prompt-1200`
- Root Directory: `v2`
- Production Branch: `claude/audit-streamlit-genai-app-n38yj` (or `main` after merge)
- Function timeout: 60s (set in `v2/vercel.json`)

## Design System
- Background: `#0d0f11`
- Gold accent: `#c9a84c`
- Gold dim: `#7a6230`
- Text primary: `#d8e2ec`
- Text secondary: `#7e8fa0`
- Text muted: `#3d4d5c`
- Green (success): `#34c97a`
- Red (error): `#e05656`
- Card bg: `#141820`
- Border: `#1e2530`
- Fonts: Syne (headings, bold labels), DM Mono (all body/mono text)

## Do Autonomously (no need to ask)
- Edit any file in `v2/`
- Commit and push to `claude/audit-streamlit-genai-app-n38yj`
- Add new genre modules in `v2/lib/genres/`
- Update prompts in existing genre files
- Fix build errors and TypeScript issues
- Update dependencies in `v2/package.json`

## Always Ask Before
- Modifying `app.py` or V1 files
- Changing the Vercel production branch
- Deleting any files
- Adding paid services or external APIs beyond Gemini
