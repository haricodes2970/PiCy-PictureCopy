import { useParams, useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

export default function SlugChooser() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { dark, toggle } = useTheme();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Mono:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root[data-theme="dark"] {
          --bg: #0c0c0c; --bg2: #161616; --bg3: #1e1e1e;
          --border: rgba(255,255,255,0.08);
          --text: #f0ece4; --text-muted: rgba(240,236,228,0.38);
          --text-dim: rgba(240,236,228,0.16);
          --accent: #ff5a1f; --accent-hover: #ff7a45; --accent-text: #0c0c0c;
          --card: rgba(255,255,255,0.03); --grid: rgba(255,255,255,0.028);
          --glow: rgba(255,90,31,0.10);
        }
        :root[data-theme="light"] {
          --bg: #f5f0e8; --bg2: #ede8df; --bg3: #e6e0d6;
          --border: rgba(0,0,0,0.09);
          --text: #1a1a1a; --text-muted: rgba(26,26,26,0.48);
          --text-dim: rgba(26,26,26,0.22);
          --accent: #ff5a1f; --accent-hover: #e04a10; --accent-text: #fff;
          --card: rgba(0,0,0,0.03); --grid: rgba(0,0,0,0.05);
        }
        html, body, #root {
          width: 100%; min-height: 100vh;
          background: var(--bg); color: var(--text);
          font-family: 'DM Mono', monospace;
          transition: background 0.35s, color 0.35s;
        }
        .page { width: 100%; min-height: 100vh; display: flex; flex-direction: column; }
        .bg-grid {
          position: fixed; inset: 0;
          background-image:
            linear-gradient(var(--grid) 1px, transparent 1px),
            linear-gradient(90deg, var(--grid) 1px, transparent 1px);
          background-size: 56px 56px;
          pointer-events: none; z-index: 0;
        }
        .topbar {
          position: relative; z-index: 10;
          display: flex; align-items: center; justify-content: space-between;
          padding: 1.2rem 2rem;
          border-bottom: 1px solid var(--border);
          background: var(--bg);
        }
        .logo-sm {
          font-family: 'Syne', sans-serif; font-weight: 800; font-size: 1.4rem;
          letter-spacing: -0.03em; cursor: pointer; color: var(--text);
          display: flex; align-items: center; gap: 0.5rem;
        }
        .logo-sm span { color: var(--accent); }
        .logo-sm img { width: 28px; height: 28px; object-fit: contain; }
        .theme-btn {
          width: 36px; height: 36px; border-radius: 50%;
          border: 1px solid var(--border); background: var(--bg2); cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          font-size: 1rem; transition: all 0.25s;
        }
        .theme-btn:hover { border-color: var(--accent); transform: rotate(20deg); }
        .main {
          flex: 1; display: flex; align-items: center; justify-content: center;
          padding: 3rem 2rem; position: relative; z-index: 1;
          animation: fadeUp 0.5s ease both;
        }
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(20px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .chooser-wrap {
          width: min(600px, 100%);
          display: flex; flex-direction: column; align-items: center; gap: 2.5rem;
        }
        .chooser-title { text-align: center; }
        .chooser-title h2 {
          font-family: 'Syne', sans-serif;
          font-size: clamp(1.8rem, 5vw, 2.6rem);
          font-weight: 800; letter-spacing: -0.03em;
        }
        .chooser-title p { margin-top: 0.5rem; font-size: 0.75rem; color: var(--text-muted); }
        .chooser-title .slug-highlight { color: var(--accent); }
        .mode-cards {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; width: 100%;
        }
        .mode-card {
          padding: 1.8rem 1rem; border: 1.5px solid var(--border);
          border-radius: 10px; background: var(--card); cursor: pointer;
          display: flex; flex-direction: column; align-items: center; gap: 0.75rem;
          transition: all 0.2s; text-align: center;
        }
        .mode-card:hover {
          border-color: var(--accent); background: rgba(255,90,31,0.04);
          transform: translateY(-2px);
        }
        .mode-icon { font-size: 2rem; }
        .mode-label {
          font-family: 'Syne', sans-serif; font-size: 0.85rem; font-weight: 700;
          letter-spacing: 0.06em; text-transform: uppercase; color: var(--text);
        }
        .mode-desc { font-size: 0.62rem; color: var(--text-muted); line-height: 1.6; }
        .url-preview {
          font-size: 0.68rem; color: var(--text-dim);
          letter-spacing: 0.06em;
        }
        .back-btn {
          background: transparent; border: none; cursor: pointer;
          font-family: 'DM Mono', monospace; font-size: 0.68rem;
          color: var(--text-muted); letter-spacing: 0.08em;
        }
        .back-btn:hover { color: var(--accent); }
        @media (max-width: 700px) {
          .mode-cards { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="page">
        <div className="bg-grid" />
        <div className="topbar">
          <div className="logo-sm" onClick={() => navigate("/")}>
            <img src="/logo.png" alt="" onError={e => e.target.style.display="none"} />
            Pi<span>cy</span>
          </div>
          <button className="theme-btn" onClick={toggle}>{dark ? "☀️" : "🌙"}</button>
        </div>

        <div className="main">
          <div className="chooser-wrap">
            <div className="chooser-title">
              <h2>What are you sharing?</h2>
              <p>Pick a mode for <span className="slug-highlight">picy.com/{slug}</span></p>
            </div>

            <div className="mode-cards">
              <div className="mode-card" onClick={() => navigate(`/${slug}/image`)}>
                <div className="mode-icon">🖼️</div>
                <div className="mode-label">Image</div>
                <div className="mode-desc">Upload any image up to 5MB</div>
                <div className="url-preview">/{slug}/image</div>
              </div>
              <div className="mode-card" onClick={() => navigate(`/${slug}/text`)}>
                <div className="mode-icon">📝</div>
                <div className="mode-label">Text</div>
                <div className="mode-desc">Share text, code or notes</div>
                <div className="url-preview">/{slug}/text</div>
              </div>
              <div className="mode-card" onClick={() => navigate(`/${slug}/both`)}>
                <div className="mode-icon">✨</div>
                <div className="mode-label">Both</div>
                <div className="mode-desc">Image with text together</div>
                <div className="url-preview">/{slug}/both</div>
              </div>
            </div>

            <button className="back-btn" onClick={() => navigate("/")}>← Back to home</button>
          </div>
        </div>
      </div>
    </>
  );
}
