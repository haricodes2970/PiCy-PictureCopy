import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

export default function Home() {
  const [slug, setSlug] = useState("");
  const navigate = useNavigate();
  const { dark, toggle } = useTheme();

  const handleGo = () => {
    if (slug.trim()) navigate(`/${slug.trim().toLowerCase()}`);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Mono:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root[data-theme="dark"] {
          --bg: #0c0c0c;
          --bg2: #161616;
          --border: rgba(255,255,255,0.08);
          --text: #f0ece4;
          --text-muted: rgba(240,236,228,0.38);
          --text-dim: rgba(240,236,228,0.16);
          --accent: #ff5a1f;
          --accent-hover: #ff7a45;
          --accent-text: #0c0c0c;
          --card: rgba(255,255,255,0.03);
          --grid: rgba(255,255,255,0.028);
          --glow: rgba(255,90,31,0.10);
        }

        :root[data-theme="light"] {
          --bg: #f5f0e8;
          --bg2: #ede8df;
          --border: rgba(0,0,0,0.09);
          --text: #1a1a1a;
          --text-muted: rgba(26,26,26,0.48);
          --text-dim: rgba(26,26,26,0.22);
          --accent: #ff5a1f;
          --accent-hover: #e04a10;
          --accent-text: #fff;
          --card: rgba(0,0,0,0.03);
          --grid: rgba(0,0,0,0.05);
          --glow: rgba(255,90,31,0.08);
        }

        html, body {
          background: var(--bg);
          color: var(--text);
          font-family: 'DM Mono', monospace;
          min-height: 100vh;
          transition: background 0.35s, color 0.35s;
        }

        .page {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          position: relative;
          overflow: hidden;
        }

        .bg-grid {
          position: fixed; inset: 0;
          background-image:
            linear-gradient(var(--grid) 1px, transparent 1px),
            linear-gradient(90deg, var(--grid) 1px, transparent 1px);
          background-size: 56px 56px;
          pointer-events: none; z-index: 0;
        }

        .glow {
          position: fixed;
          width: 800px; height: 800px;
          border-radius: 50%;
          background: radial-gradient(circle, var(--glow) 0%, transparent 65%);
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          pointer-events: none; z-index: 0;
          animation: breathe 7s ease-in-out infinite;
        }

        @keyframes breathe {
          0%,100% { transform: translate(-50%,-50%) scale(1); }
          50% { transform: translate(-50%,-50%) scale(1.12); }
        }

        .theme-btn {
          position: fixed; top: 1.5rem; right: 1.5rem; z-index: 100;
          width: 44px; height: 44px; border-radius: 50%;
          border: 1px solid var(--border);
          background: var(--bg2);
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.15rem;
          transition: all 0.25s;
          box-shadow: 0 2px 12px var(--glow);
        }

        .theme-btn:hover { border-color: var(--accent); transform: rotate(25deg) scale(1.08); }

        .content {
          position: relative; z-index: 1;
          display: flex; flex-direction: column;
          align-items: center;
          gap: 2.6rem;
          max-width: 560px; width: 100%;
          animation: riseUp 0.75s cubic-bezier(0.16,1,0.3,1) both;
        }

        @keyframes riseUp {
          from { opacity:0; transform:translateY(36px); }
          to   { opacity:1; transform:translateY(0); }
        }

        .logo-block {
          display: flex; flex-direction: column;
          align-items: center; gap: 0.9rem;
        }

        .mascot {
          width: 100px; height: 100px;
          object-fit: contain;
          animation: float 4s ease-in-out infinite;
          filter: drop-shadow(0 8px 20px rgba(255,90,31,0.25));
        }

        @keyframes float {
          0%,100% { transform: translateY(0) rotate(-1deg); }
          50%      { transform: translateY(-9px) rotate(1deg); }
        }

        .logo-text {
          font-family: 'Syne', sans-serif;
          font-size: clamp(4.5rem, 15vw, 8rem);
          font-weight: 800;
          letter-spacing: -0.045em;
          line-height: 0.95;
          color: var(--text);
          text-align: center;
        }

        .logo-text span { color: var(--accent); }

        .tagline {
          font-size: 0.7rem;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--text-muted);
          font-weight: 300;
          text-align: center;
        }

        .input-row {
          width: 100%;
          display: flex;
          border: 1.5px solid var(--border);
          border-radius: 6px;
          overflow: hidden;
          transition: border-color 0.2s, box-shadow 0.2s;
          background: var(--card);
        }

        .input-row:focus-within {
          border-color: var(--accent);
          box-shadow: 0 0 0 3px rgba(255,90,31,0.12);
        }

        .prefix {
          padding: 0.95rem 1.1rem;
          font-size: 0.8rem;
          color: var(--text-muted);
          border-right: 1px solid var(--border);
          white-space: nowrap;
          display: flex; align-items: center;
          background: var(--bg2);
          transition: background 0.35s;
          user-select: none;
        }

        .slug-input {
          flex: 1; min-width: 0;
          padding: 0.95rem 1.1rem;
          background: transparent; border: none; outline: none;
          font-family: 'DM Mono', monospace;
          font-size: 0.95rem;
          color: var(--text);
          caret-color: var(--accent);
        }

        .slug-input::placeholder { color: var(--text-dim); }

        .go-btn {
          padding: 0.95rem 2rem;
          background: var(--accent); border: none;
          cursor: pointer;
          font-family: 'Syne', sans-serif;
          font-size: 0.8rem; font-weight: 700;
          letter-spacing: 0.12em; text-transform: uppercase;
          color: var(--accent-text);
          transition: background 0.2s, transform 0.1s;
          white-space: nowrap;
        }

        .go-btn:hover:not(:disabled) { background: var(--accent-hover); }
        .go-btn:active:not(:disabled) { transform: scale(0.96); }
        .go-btn:disabled { opacity: 0.3; cursor: not-allowed; }

        .quick-slugs {
          display: flex; gap: 0.5rem; flex-wrap: wrap; justify-content: center;
        }

        .qs {
          padding: 0.3rem 0.85rem;
          border: 1px solid var(--border);
          border-radius: 999px;
          font-size: 0.67rem;
          color: var(--text-muted);
          letter-spacing: 0.04em;
          cursor: pointer;
          transition: all 0.2s;
          background: var(--card);
        }

        .qs:hover { border-color: var(--accent); color: var(--accent); }

        .hint {
          font-size: 0.68rem;
          color: var(--text-dim);
          letter-spacing: 0.05em;
          text-align: center;
          line-height: 2;
        }

        .hint b { color: var(--text-muted); font-weight: 400; }

        .footer {
          position: fixed; bottom: 1.4rem; left: 50%;
          transform: translateX(-50%);
          font-size: 0.58rem; letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--text-dim); z-index: 1; white-space: nowrap;
        }
      `}</style>

      <div className="page">
        <div className="bg-grid" />
        <div className="glow" />

        <button className="theme-btn" onClick={toggle}>
          {dark ? "☀️" : "🌙"}
        </button>

        <div className="content">
          <div className="logo-block">
            <img className="mascot" src="/logo.png" alt="Picy"
              onError={e => e.target.style.display = "none"} />
            <div className="logo-text">Pi<span>cy</span></div>
            <div className="tagline">instant image sharing — no login, no fuss</div>
          </div>

          <div className="input-row">
            <div className="prefix">picy.com/</div>
            <input
              className="slug-input"
              placeholder="your-slug"
              value={slug}
              onChange={e => setSlug(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleGo()}
              autoFocus
            />
            <button className="go-btn" onClick={handleGo} disabled={!slug.trim()}>
              Go →
            </button>
          </div>

          <div className="quick-slugs">
            {["sunset", "meme", "design", "wallpaper", "art"].map(s => (
              <span key={s} className="qs" onClick={() => navigate(`/${s}`)}>/{s}</span>
            ))}
          </div>

          <div className="hint">
            Type any word and press Go.<br />
            <b>No account needed.</b> Images auto-delete after 24 hours.
          </div>
        </div>

        <div className="footer">Picy · PictureCopy · free forever</div>
      </div>
    </>
  );
}
