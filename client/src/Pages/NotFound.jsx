import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

export default function NotFound() {
  const navigate = useNavigate();
  const { dark, toggle } = useTheme();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@800&family=DM+Mono:wght@300;400&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root[data-theme="dark"] {
          --bg: #0c0c0c; --text: #f0ece4;
          --text-muted: rgba(240,236,228,0.35);
          --accent: #ff5a1f; --accent-text: #0c0c0c;
          --border: rgba(255,255,255,0.08);
          --grid: rgba(255,255,255,0.028);
        }
        :root[data-theme="light"] {
          --bg: #f5f0e8; --text: #1a1a1a;
          --text-muted: rgba(26,26,26,0.45);
          --accent: #ff5a1f; --accent-text: #fff;
          --border: rgba(0,0,0,0.09);
          --grid: rgba(0,0,0,0.05);
        }

        html, body {
          background: var(--bg); color: var(--text);
          font-family: 'DM Mono', monospace;
          min-height: 100vh;
          transition: background 0.35s, color 0.35s;
        }

        .wrap {
          min-height: 100vh;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          gap: 2rem; padding: 2rem;
          position: relative;
        }

        .bg-grid {
          position: fixed; inset: 0;
          background-image:
            linear-gradient(var(--grid) 1px, transparent 1px),
            linear-gradient(90deg, var(--grid) 1px, transparent 1px);
          background-size: 56px 56px;
          pointer-events: none; z-index: 0;
        }

        .theme-btn {
          position: fixed; top: 1.5rem; right: 1.5rem; z-index: 100;
          width: 44px; height: 44px; border-radius: 50%;
          border: 1px solid var(--border);
          background: transparent; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.1rem; transition: all 0.25s;
        }
        .theme-btn:hover { border-color: var(--accent); transform: rotate(20deg); }

        .content {
          position: relative; z-index: 1;
          display: flex; flex-direction: column;
          align-items: center; gap: 1.5rem;
          text-align: center;
          animation: fadeUp 0.6s ease both;
        }

        @keyframes fadeUp {
          from { opacity:0; transform:translateY(24px); }
          to   { opacity:1; transform:translateY(0); }
        }

        .code {
          font-family: 'Syne', sans-serif;
          font-size: clamp(6rem, 20vw, 10rem);
          font-weight: 800;
          letter-spacing: -0.05em;
          line-height: 1;
          color: var(--text);
        }

        .code span { color: var(--accent); }

        .msg {
          font-size: 0.8rem;
          color: var(--text-muted);
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .home-btn {
          margin-top: 0.5rem;
          padding: 0.8rem 2rem;
          background: var(--accent); border: none;
          border-radius: 5px; cursor: pointer;
          font-family: 'Syne', sans-serif;
          font-size: 0.8rem; font-weight: 700;
          letter-spacing: 0.1em; text-transform: uppercase;
          color: var(--accent-text);
          transition: opacity 0.2s, transform 0.1s;
        }

        .home-btn:hover { opacity: 0.88; }
        .home-btn:active { transform: scale(0.97); }
      `}</style>

      <div className="wrap">
        <div className="bg-grid" />
        <button className="theme-btn" onClick={toggle}>{dark ? "☀️" : "🌙"}</button>
        <div className="content">
          <div className="code">4<span>0</span>4</div>
          <div className="msg">Nothing here. This slug is empty.</div>
          <button className="home-btn" onClick={() => navigate("/")}>← Back to Picy</button>
        </div>
      </div>
    </>
  );
}