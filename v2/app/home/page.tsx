const TOOLS = [
  {
    title: "Sound Studio",
    href: "/studio.html",
    tone: "studio",
    eyebrow: "Generate Audio",
    copy: "Pick a proven sound card, choose a model length, and generate a source-style audio idea.",
  },
  {
    title: "Prompt Library",
    href: "/prompts",
    tone: "library",
    eyebrow: "Copy Prompts",
    copy: "Browse the full prompt archive and copy ready-to-paste prompt DNA for AI music tools.",
  },
  {
    title: "Sample Analysis",
    href: "/analyze",
    tone: "analysis",
    eyebrow: "Analyze Samples",
    copy: "Upload a reference and turn its sonic fingerprint into a structured prompt.",
  },
  {
    title: "Create Your Own",
    href: "/create.html",
    tone: "create",
    eyebrow: "Custom Generation",
    copy: "Choose a genre lane, describe the vibe, and generate a custom Booman Lab sound.",
  },
];

export default function HomePage() {
  return (
    <main className="home-page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@500;600;700;800&family=DM+Sans:wght@300;400;500;600;700&display=swap');

        .home-page {
          --bg: #080a0f;
          --panel: #101117;
          --panel-2: #15161f;
          --line: #282a36;
          --text: #f1f2f6;
          --muted: #9ca0b4;
          --dim: #666b82;
          --red: #ff4d6d;
          --orange: #ff9a3c;
          --gold: #d7b56d;
          --cyan: #54d4e8;
          min-height: 100vh;
          color: var(--text);
          background:
            linear-gradient(180deg, rgba(255,77,109,0.04), transparent 280px),
            var(--bg);
          font-family: 'DM Sans', sans-serif;
        }

        .home-page * {
          box-sizing: border-box;
        }

        .topbar {
          position: sticky;
          top: 0;
          z-index: 20;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 14px 24px;
          border-bottom: 1px solid var(--line);
          background: rgba(8,10,15,0.88);
          backdrop-filter: blur(16px);
        }

        .brand,
        .nav-pill,
        .hub-kicker,
        .tool-eyebrow,
        .tool-button {
          font-family: 'Syne', sans-serif;
          letter-spacing: 0;
          text-transform: uppercase;
        }

        .brand {
          color: var(--text);
          font-size: 18px;
          font-weight: 800;
          line-height: 1;
          text-decoration: none;
        }

        .brand span {
          color: var(--red);
        }

        .top-links {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .nav-pill {
          color: var(--muted);
          border: 1px solid var(--line);
          border-radius: 999px;
          padding: 8px 14px;
          font-size: 11px;
          font-weight: 700;
          text-decoration: none;
          transition: border-color 150ms ease, color 150ms ease, background 150ms ease;
        }

        .nav-pill:hover {
          color: var(--text);
          border-color: rgba(255,77,109,0.55);
          background: rgba(255,77,109,0.08);
        }

        .hero {
          position: relative;
          overflow: hidden;
          border-bottom: 1px solid var(--line);
          background:
            linear-gradient(90deg, rgba(255,77,109,0.16), rgba(255,154,60,0.05), transparent 70%),
            repeating-linear-gradient(0deg, rgba(255,255,255,0.028) 0, rgba(255,255,255,0.028) 1px, transparent 1px, transparent 7px),
            #0b0c12;
        }

        .hero::before {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: linear-gradient(110deg, transparent 0 28%, rgba(255,255,255,0.05) 44%, transparent 62% 100%);
          transform: translateX(-35%);
          animation: heroSweep 12s ease-in-out infinite;
        }

        .hero-inner {
          position: relative;
          z-index: 1;
          max-width: 1180px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(300px, 0.48fr);
          gap: 36px;
          align-items: center;
          padding: 52px 24px 40px;
        }

        .hub-kicker {
          color: var(--gold);
          font-size: 12px;
          font-weight: 800;
          margin-bottom: 12px;
        }

        .hero-title {
          max-width: 760px;
          margin: 0;
          color: var(--text);
          font-family: 'Syne', sans-serif;
          font-size: 68px;
          font-weight: 800;
          line-height: 0.9;
          text-transform: uppercase;
        }

        .hero-title span {
          color: var(--red);
        }

        .hero-copy {
          max-width: 620px;
          margin: 18px 0 0;
          color: var(--muted);
          font-size: 17px;
          line-height: 1.6;
        }

        .record-wrap {
          min-height: 330px;
          display: grid;
          place-items: center;
        }

        .record-cover {
          position: relative;
          width: min(330px, 76vw);
          aspect-ratio: 1 / 1;
          overflow: hidden;
          border-radius: 8px;
          background:
            linear-gradient(145deg, rgba(255,77,109,0.22), transparent 42%),
            linear-gradient(315deg, rgba(215,181,109,0.2), transparent 46%),
            #101117;
          border: 1px solid rgba(255,255,255,0.12);
          box-shadow: 0 24px 80px rgba(0,0,0,0.45), 0 0 70px rgba(255,77,109,0.12);
          animation: coverGlow 7s ease-in-out infinite;
          transition: transform 220ms ease, border-color 220ms ease, box-shadow 220ms ease;
        }

        .record-cover:hover {
          transform: translateY(-4px) rotate(-0.4deg);
          border-color: rgba(215,181,109,0.32);
          box-shadow: 0 30px 90px rgba(0,0,0,0.5), 0 0 92px rgba(255,77,109,0.18);
        }

        .record-cover::before {
          content: "";
          position: absolute;
          width: 68%;
          aspect-ratio: 1 / 1;
          left: 16%;
          top: 10%;
          border-radius: 999px;
          background:
            radial-gradient(circle at center, #d7b56d 0 8%, #0b0c12 8.5% 17%, transparent 17.5%),
            repeating-radial-gradient(circle at center, #0d0e14 0 7px, #191b24 8px 10px, #0b0c12 11px 13px);
          border: 1px solid rgba(255,255,255,0.1);
          opacity: 0.96;
          animation: recordSpin 26s linear infinite;
        }

        .record-cover::after {
          content: "BOOMAN LAB\\A SAMPLE PROMPT 1200";
          white-space: pre-wrap;
          position: absolute;
          left: 24px;
          right: 24px;
          bottom: 24px;
          padding: 16px;
          border-radius: 6px;
          color: var(--text);
          background: rgba(8,10,15,0.78);
          border: 1px solid rgba(255,255,255,0.12);
          font-family: 'Syne', sans-serif;
          font-size: 20px;
          font-weight: 800;
          line-height: 1.05;
          text-align: left;
        }

        .tools {
          max-width: 1180px;
          margin: 0 auto;
          padding: 24px 24px 72px;
        }

        .tool-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 14px;
        }

        .tool-card {
          display: flex;
          flex-direction: column;
          min-height: 260px;
          border: 1px solid var(--line);
          border-radius: 8px;
          padding: 18px;
          background: rgba(16,17,23,0.88);
          animation: cardRise 420ms ease backwards;
          transition: transform 180ms ease, border-color 180ms ease, box-shadow 180ms ease, background 180ms ease;
        }

        .tool-card:hover {
          transform: translateY(-4px);
          border-color: rgba(255,255,255,0.18);
          background: rgba(19,20,29,0.94);
          box-shadow: 0 20px 52px rgba(0,0,0,0.34);
        }

        .tool-eyebrow {
          font-size: 10px;
          font-weight: 800;
          margin-bottom: 12px;
        }

        .tool-card.studio .tool-eyebrow { color: var(--red); }
        .tool-card.library .tool-eyebrow { color: var(--gold); }
        .tool-card.analysis .tool-eyebrow { color: var(--cyan); }
        .tool-card.create .tool-eyebrow { color: var(--orange); }

        .tool-title {
          margin: 0;
          color: var(--text);
          font-family: 'Syne', sans-serif;
          font-size: 25px;
          font-weight: 800;
          line-height: 1;
          text-transform: uppercase;
        }

        .tool-copy {
          flex: 1;
          margin: 14px 0 18px;
          color: var(--muted);
          font-size: 14px;
          line-height: 1.55;
        }

        .tool-button {
          min-height: 42px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 7px;
          font-size: 12px;
          font-weight: 800;
          text-decoration: none;
          transition: transform 160ms ease, filter 160ms ease;
        }

        .tool-button:hover {
          filter: saturate(1.12) brightness(1.04);
          transform: translateY(-1px);
        }

        .tool-card.studio .tool-button {
          color: #0a0a0f;
          background: linear-gradient(135deg, var(--red), var(--orange));
        }

        .tool-card.library .tool-button {
          color: #0a0a0f;
          background: linear-gradient(135deg, var(--gold), var(--red));
        }

        .tool-card.analysis .tool-button {
          color: #071116;
          background: linear-gradient(135deg, var(--cyan), var(--gold));
        }

        .tool-card.create .tool-button {
          color: #0a0a0f;
          background: linear-gradient(135deg, var(--orange), var(--gold));
        }

        @keyframes heroSweep {
          0%, 45% { transform: translateX(-42%); opacity: 0; }
          55% { opacity: 1; }
          100% { transform: translateX(42%); opacity: 0; }
        }

        @keyframes coverGlow {
          0%, 100% { box-shadow: 0 24px 80px rgba(0,0,0,0.45), 0 0 70px rgba(255,77,109,0.12); }
          50% { box-shadow: 0 28px 88px rgba(0,0,0,0.48), 0 0 90px rgba(215,181,109,0.16); }
        }

        @keyframes recordSpin {
          to { transform: rotate(360deg); }
        }

        @keyframes cardRise {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (prefers-reduced-motion: reduce) {
          .hero::before,
          .record-cover,
          .record-cover::before,
          .tool-card {
            animation: none;
          }

          .record-cover,
          .record-cover:hover,
          .tool-card,
          .tool-card:hover,
          .tool-button,
          .tool-button:hover {
            transform: none;
          }
        }

        @media (max-width: 980px) {
          .hero-inner {
            grid-template-columns: 1fr;
          }

          .record-wrap {
            min-height: 250px;
            justify-content: start;
          }

          .tool-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 620px) {
          .topbar {
            align-items: flex-start;
            flex-direction: column;
            padding: 14px 16px;
          }

          .hero-inner,
          .tools {
            padding-left: 16px;
            padding-right: 16px;
          }

          .hero-title {
            font-size: 44px;
          }

          .tool-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <header className="topbar">
        <a href="/home" className="brand">
          BOOMAN <span>LAB</span>
        </a>
        <div className="top-links">
          <a href="/admin/invite" className="nav-pill">Invite</a>
          <a href="/account" className="nav-pill">Account</a>
        </div>
      </header>

      <section className="hero">
        <div className="hero-inner">
          <div>
            <div className="hub-kicker">Sample Prompt 1200</div>
            <h1 className="hero-title">BOOMAN LAB</h1>
            <p className="hero-copy">
              Four focused tools for sample-based music: generate a sound, copy a prompt,
              analyze a sample, or build a custom idea from scratch.
            </p>
          </div>
          <div className="record-wrap" aria-label="Vintage record cover graphic">
            <div className="record-cover" />
          </div>
        </div>
      </section>

      <section className="tools" aria-label="Booman Lab tools">
        <div className="tool-grid">
          {TOOLS.map((tool, index) => (
            <article
              className={`tool-card ${tool.tone}`}
              key={tool.href}
              style={{ animationDelay: `${index * 70}ms` }}
            >
              <div className="tool-eyebrow">{tool.eyebrow}</div>
              <h2 className="tool-title">{tool.title}</h2>
              <p className="tool-copy">{tool.copy}</p>
              <a className="tool-button" href={tool.href}>
                Open
              </a>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
