import Link from "next/link";

type LegalSection = {
  title: string;
  body: string[];
};

type LegalPageProps = {
  title: string;
  description: string;
  updated: string;
  sections: LegalSection[];
};

const legalLinks = [
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
  { href: "/acceptable-use", label: "Acceptable Use" },
  { href: "/copyright", label: "Copyright" },
];

export function LegalPage({ title, description, updated, sections }: LegalPageProps) {
  return (
    <main className="legal-shell">
      <style>{`
        .legal-shell {
          min-height: 100vh;
          background:
            radial-gradient(circle at 18% 12%, rgba(255, 77, 109, 0.18), transparent 32%),
            radial-gradient(circle at 82% 18%, rgba(242, 176, 67, 0.14), transparent 28%),
            linear-gradient(135deg, #09090e 0%, #101017 48%, #07070b 100%);
          color: #f6f0e7;
          font-family: "DM Sans", Arial, sans-serif;
          padding: 28px;
        }

        .legal-frame {
          width: min(980px, 100%);
          margin: 0 auto;
        }

        .legal-topbar,
        .legal-nav,
        .legal-meta,
        .legal-footer {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
        }

        .legal-topbar {
          justify-content: space-between;
          margin-bottom: 52px;
        }

        .legal-brand {
          color: #fff8ed;
          font-family: "Space Grotesk", Arial, sans-serif;
          font-size: 15px;
          font-weight: 800;
          letter-spacing: 2px;
          text-decoration: none;
        }

        .legal-brand span {
          color: #ffb85c;
        }

        .legal-nav a,
        .legal-footer a {
          color: #c9c2b8;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.9px;
          text-decoration: none;
          text-transform: uppercase;
        }

        .legal-nav a:hover,
        .legal-footer a:hover,
        .legal-nav a:focus-visible,
        .legal-footer a:focus-visible,
        .legal-brand:focus-visible {
          color: #fff8ed;
          outline: 2px solid rgba(255, 184, 92, 0.55);
          outline-offset: 5px;
        }

        .legal-card {
          background: rgba(15, 15, 22, 0.82);
          border: 1px solid rgba(255, 248, 237, 0.12);
          border-radius: 8px;
          box-shadow: 0 28px 90px rgba(0, 0, 0, 0.38);
          overflow: hidden;
        }

        .legal-hero {
          border-bottom: 1px solid rgba(255, 248, 237, 0.1);
          padding: clamp(28px, 6vw, 58px);
        }

        .legal-kicker {
          color: #ffb85c;
          font-family: "Space Grotesk", Arial, sans-serif;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 2.4px;
          margin-bottom: 18px;
          text-transform: uppercase;
        }

        .legal-hero h1 {
          color: #fff8ed;
          font-family: "Space Grotesk", Arial, sans-serif;
          font-size: clamp(38px, 7vw, 78px);
          letter-spacing: 0;
          line-height: 0.94;
          margin: 0 0 18px;
          text-transform: uppercase;
        }

        .legal-description {
          color: #d8cec0;
          font-size: 17px;
          line-height: 1.65;
          margin: 0;
          max-width: 760px;
        }

        .legal-meta {
          color: #a9a095;
          font-size: 13px;
          margin-top: 24px;
        }

        .legal-draft {
          background: rgba(255, 184, 92, 0.1);
          border: 1px solid rgba(255, 184, 92, 0.22);
          color: #ffe0a7;
          font-size: 13px;
          line-height: 1.6;
          padding: 14px 16px;
        }

        .legal-section {
          border-top: 1px solid rgba(255, 248, 237, 0.08);
          padding: clamp(24px, 5vw, 42px) clamp(24px, 6vw, 58px);
        }

        .legal-section:first-child {
          border-top: 0;
        }

        .legal-section h2 {
          color: #fff8ed;
          font-family: "Space Grotesk", Arial, sans-serif;
          font-size: 20px;
          letter-spacing: 1.2px;
          margin: 0 0 14px;
          text-transform: uppercase;
        }

        .legal-section p {
          color: #d4cabe;
          font-size: 15px;
          line-height: 1.75;
          margin: 12px 0 0;
        }

        .legal-footer {
          justify-content: space-between;
          color: #8f887f;
          font-size: 12px;
          margin-top: 22px;
          padding: 0 2px 10px;
        }

        @media (max-width: 720px) {
          .legal-shell {
            padding: 18px;
          }

          .legal-topbar {
            align-items: flex-start;
            flex-direction: column;
            margin-bottom: 28px;
          }

          .legal-nav {
            gap: 10px 14px;
          }

          .legal-footer {
            align-items: flex-start;
            flex-direction: column;
          }
        }
      `}</style>

      <div className="legal-frame">
        <nav className="legal-topbar" aria-label="Legal navigation">
          <Link className="legal-brand" href="/">
            BOOMAN <span>LAB</span>
          </Link>
          <div className="legal-nav">
            <Link href="/login">Sign In</Link>
            {legalLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                {link.label}
              </Link>
            ))}
          </div>
        </nav>

        <article className="legal-card">
          <header className="legal-hero">
            <div className="legal-kicker">Booman Lab Policy</div>
            <h1>{title}</h1>
            <p className="legal-description">{description}</p>
            <div className="legal-meta">
              <span>Last updated: {updated}</span>
              <span>Private invite-only beta</span>
            </div>
          </header>

          <div className="legal-draft">
            Draft owner review required. This page is a practical policy draft for Booman Lab and is not legal advice.
            It should be reviewed by qualified counsel before public commercial launch.
          </div>

          <div className="legal-content">
            {sections.map((section) => (
              <section className="legal-section" key={section.title}>
                <h2>{section.title}</h2>
                {section.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </section>
            ))}
          </div>
        </article>

        <footer className="legal-footer">
          <span>Contact: admin@modeos.app</span>
          <div className="legal-nav">
            {legalLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                {link.label}
              </Link>
            ))}
          </div>
        </footer>
      </div>
    </main>
  );
}
