import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const [slug, setSlug] = useState("");
  const navigate = useNavigate();

  const handleGo = () => {
    if (slug.trim()) navigate(`/${slug.trim().toLowerCase()}`);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Mono:wght@300;400&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          background: #0a0a0a;
          color: #f0ece4;
          font-family: 'DM Mono', monospace;
          min-height: 100vh;
          overflow-x: hidden;
        }

        .home-wrap {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          position: relative;
        }

        .bg-grid {
          position: fixed;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
          background-size: 60px 60px;
          pointer-events: none;
          z-index: 0;
        }

        .glow-blob {
          position: fixed;
          width: 600px;
          height: 600px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255, 90, 31, 0.12) 0%, transparent 70%);
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          pointer-events: none;
          z-index: 0;
          animation: pulse 6s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.6; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
        }

        .content {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2.5rem;
          max-width: 640px;
          width: 100%;
          animation: fadeUp 0.8s ease both;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .logo-area {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }

        .logo {
          font-family: 'Syne', sans-serif;
          font-size: clamp(5rem, 15vw, 9rem);
          font-weight: 800;
          letter-spacing: -0.04em;
          line-height: 1;
          color: #f0ece4;
          position: relative;
        }

        .logo span {
          color: #ff5a1f;
        }

        .tagline {
          font-size: 0.75rem;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: rgba(240, 236, 228, 0.4);
          font-weight: 300;
        }

        .input-row {
          display: flex;
          width: 100%;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 4px;
          overflow: hidden;
          transition: border-color 0.2s;
          background: rgba(255,255,255,0.03);
        }

        .input-row:focus-within {
          border-color: #ff5a1f;
        }

        .prefix {
          padding: 1rem 1.2rem;
          font-family: 'DM Mono', monospace;
          font-size: 0.85rem;
          color: rgba(240,236,228,0.3);
          border-right: 1px solid rgba(255,255,255,0.1);
          white-space: nowrap;
          display: flex;
          align-items: center;
        }

        .slug-input {
          flex: 1;
          padding: 1rem 1.2rem;
          background: transparent;
          border: none;
          outline: none;
          font-family: 'DM Mono', monospace;
          font-size: 0.95rem;
          color: #f0ece4;
          caret-color: #ff5a1f;
        }

        .slug-input::placeholder {
          color: rgba(240,236,228,0.2);
        }

        .go-btn {
          padding: 1rem 1.8rem;
          background: #ff5a1f;
          border: none;
          cursor: pointer;
          font-family: 'Syne', sans-serif;
          font-size: 0.85rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #0a0a0a;
          transition: background 0.2s, transform 0.1s;
        }

        .go-btn:hover { background: #ff7a45; }
        .go-btn:active { transform: scale(0.97); }
        .go-btn:disabled { opacity: 0.4; cursor: not-allowed; }

        .hint {
          font-size: 0.72rem;
          color: rgba(240,236,228,0.25);
          letter-spacing: 0.05em;
          text-align: center;
          line-height: 1.8;
        }

        .hint b {
          color: rgba(240,236,228,0.5);
          font-weight: 400;
        }

        .bottom-label {
          position: fixed;
          bottom: 2rem;
          left: 50%;
          transform: translateX(-50%);
          font-size: 0.65rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: rgba(240,236,228,0.15);
          z-index: 1;
        }
      `}</style>

      <div className="home-wrap">
        <div className="bg-grid" />
        <div className="glow-blob" />

        <div className="content">
          <div className="logo-area">
            <div className="logo">Pi<span>cy</span></div>
            <div className="tagline">instant image sharing — no login, no fuss</div>
          </div>

          <div className="input-row">
            <div className="prefix">picy.com/</div>
            <input
              className="slug-input"
              placeholder="your-slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleGo()}
              autoFocus
            />
            <button className="go-btn" onClick={handleGo} disabled={!slug.trim()}>
              Go →
            </button>
          </div>

          <div className="hint">
            Type any word and hit Go.<br />
            <b>No account needed.</b> Just share the link.
          </div>
        </div>

        <div className="bottom-label">Picy — free forever for sharing</div>
      </div>
    </>
  );
}
