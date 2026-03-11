import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useTheme } from "../context/ThemeContext";

const API = "https://picy.onrender.com/api";

function timeLeft(expiresAt) {
  const diff = new Date(expiresAt) - new Date();
  if (diff <= 0) return "Expired";
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  return `${h}h ${m}m left`;
}

export default function SlugPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { dark, toggle } = useTheme();
  const [imageUrl, setImageUrl] = useState(null);
  const [expiresAt, setExpiresAt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [empty, setEmpty] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [copied, setCopied] = useState(false);
  const [timer, setTimer] = useState("");
  const fileRef = useRef();

  useEffect(() => {
    axios.get(`${API}/${slug}`)
      .then(res => {
        setImageUrl(res.data.imageUrl);
        setExpiresAt(res.data.expiresAt);
      })
      .catch(() => setEmpty(true))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (!expiresAt) return;
    setTimer(timeLeft(expiresAt));
    const id = setInterval(() => setTimer(timeLeft(expiresAt)), 30000);
    return () => clearInterval(id);
  }, [expiresAt]);

  const uploadFile = async (file) => {
    if (!file?.type.startsWith("image/")) return alert("Please upload an image!");
    const formData = new FormData();
    formData.append("image", file);
    setUploading(true);
    try {
      const res = await axios.post(`${API}/${slug}`, formData);
      setImageUrl(res.data.imageUrl);
      setExpiresAt(res.data.expiresAt);
      setEmpty(false);
    } catch (err) {
      alert(err.response?.data?.error || "Upload failed!");
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault(); setDragging(false);
    uploadFile(e.dataTransfer.files[0]);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Mono:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root[data-theme="dark"] {
          --bg: #0c0c0c; --bg2: #161616;
          --border: rgba(255,255,255,0.08);
          --text: #f0ece4; --text-muted: rgba(240,236,228,0.38);
          --text-dim: rgba(240,236,228,0.16);
          --accent: #ff5a1f; --accent-hover: #ff7a45; --accent-text: #0c0c0c;
          --card: rgba(255,255,255,0.03);
          --grid: rgba(255,255,255,0.028);
          --glow: rgba(255,90,31,0.10);
          --success: #4ade80;
        }

        :root[data-theme="light"] {
          --bg: #f5f0e8; --bg2: #ede8df;
          --border: rgba(0,0,0,0.09);
          --text: #1a1a1a; --text-muted: rgba(26,26,26,0.48);
          --text-dim: rgba(26,26,26,0.22);
          --accent: #ff5a1f; --accent-hover: #e04a10; --accent-text: #fff;
          --card: rgba(0,0,0,0.03);
          --grid: rgba(0,0,0,0.05);
          --glow: rgba(255,90,31,0.07);
          --success: #16a34a;
        }

        html, body {
          background: var(--bg); color: var(--text);
          font-family: 'DM Mono', monospace;
          min-height: 100vh;
          transition: background 0.35s, color 0.35s;
        }

        .page {
          min-height: 100vh;
          display: flex; flex-direction: column;
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

        .topbar {
          position: relative; z-index: 10;
          display: flex; align-items: center;
          justify-content: space-between;
          padding: 1.2rem 2rem;
          border-bottom: 1px solid var(--border);
          background: var(--bg);
          transition: background 0.35s;
        }

        .logo-sm {
          font-family: 'Syne', sans-serif;
          font-weight: 800; font-size: 1.4rem;
          letter-spacing: -0.03em;
          cursor: pointer; color: var(--text);
          text-decoration: none;
          display: flex; align-items: center; gap: 0.5rem;
        }

        .logo-sm span { color: var(--accent); }

        .logo-sm img {
          width: 28px; height: 28px;
          object-fit: contain;
        }

        .topbar-right {
          display: flex; align-items: center; gap: 0.75rem;
        }

        .slug-pill {
          padding: 0.38rem 1rem;
          border: 1px solid var(--border);
          border-radius: 999px;
          font-size: 0.72rem;
          color: var(--text-muted);
          letter-spacing: 0.04em;
          background: var(--card);
        }

        .slug-pill b { color: var(--text); font-weight: 500; }

        .theme-btn {
          width: 36px; height: 36px; border-radius: 50%;
          border: 1px solid var(--border);
          background: var(--bg2);
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          font-size: 1rem; transition: all 0.25s;
        }

        .theme-btn:hover { border-color: var(--accent); transform: rotate(20deg); }

        .main {
          flex: 1; display: flex;
          align-items: center; justify-content: center;
          padding: 3rem 2rem;
          position: relative; z-index: 1;
          animation: fadeUp 0.5s ease both;
        }

        @keyframes fadeUp {
          from { opacity:0; transform:translateY(20px); }
          to   { opacity:1; transform:translateY(0); }
        }

        /* LOADING */
        .loading {
          display: flex; flex-direction: column;
          align-items: center; gap: 1rem;
        }

        .spinner {
          width: 32px; height: 32px;
          border: 2px solid var(--border);
          border-top-color: var(--accent);
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        .loading-text {
          font-size: 0.7rem; color: var(--text-dim);
          letter-spacing: 0.18em; text-transform: uppercase;
        }

        /* UPLOAD */
        .upload-zone {
          width: min(520px, 100%);
          display: flex; flex-direction: column;
          align-items: center; gap: 2.2rem;
        }

        .upload-title { text-align: center; }

        .upload-title h2 {
          font-family: 'Syne', sans-serif;
          font-size: clamp(1.8rem, 5vw, 2.6rem);
          font-weight: 800; letter-spacing: -0.03em;
          line-height: 1.1; color: var(--text);
        }

        .upload-title p {
          margin-top: 0.5rem; font-size: 0.75rem;
          color: var(--text-muted); letter-spacing: 0.04em;
        }

        .drop-zone {
          width: 100%;
          border: 1.5px dashed var(--border);
          border-radius: 10px;
          padding: 3.5rem 2rem;
          display: flex; flex-direction: column;
          align-items: center; gap: 1.2rem;
          cursor: pointer;
          transition: border-color 0.2s, background 0.2s;
          background: var(--card);
        }

        .drop-zone:hover, .drop-zone.drag {
          border-color: var(--accent);
          background: rgba(255,90,31,0.04);
        }

        .drop-icon { font-size: 2.8rem; opacity: 0.5; }

        .drop-label {
          font-size: 0.78rem;
          color: var(--text-muted);
          letter-spacing: 0.04em;
          text-align: center; line-height: 1.9;
        }

        .drop-label b { color: var(--accent); font-weight: 400; }

        .upload-btn {
          padding: 0.7rem 2rem;
          background: var(--accent); border: none; border-radius: 4px;
          cursor: pointer;
          font-family: 'Syne', sans-serif;
          font-size: 0.78rem; font-weight: 700;
          letter-spacing: 0.1em; text-transform: uppercase;
          color: var(--accent-text);
          transition: background 0.2s, transform 0.1s;
        }

        .upload-btn:hover { background: var(--accent-hover); }
        .upload-btn:active { transform: scale(0.97); }
        .upload-btn:disabled { opacity: 0.4; cursor: not-allowed; }

        .uploading-row {
          display: flex; align-items: center; gap: 0.6rem;
          font-size: 0.72rem; color: var(--text-muted);
          letter-spacing: 0.1em; text-transform: uppercase;
        }

        /* IMAGE VIEW */
        .image-view {
          width: min(780px, 100%);
          display: flex; flex-direction: column;
          align-items: center; gap: 1.4rem;
        }

        .img-frame {
          width: 100%;
          border-radius: 10px; overflow: hidden;
          border: 1px solid var(--border);
          background: var(--bg2);
          box-shadow: 0 32px 64px var(--glow), 0 8px 24px rgba(0,0,0,0.15);
        }

        .img-frame img {
          width: 100%; display: block;
          object-fit: contain; max-height: 68vh;
        }

        .meta-row {
          display: flex; align-items: center; gap: 1rem;
          flex-wrap: wrap; justify-content: center;
        }

        .timer-badge {
          padding: 0.3rem 0.8rem;
          border: 1px solid var(--border);
          border-radius: 999px;
          font-size: 0.65rem;
          color: var(--text-muted);
          letter-spacing: 0.06em;
          background: var(--card);
        }

        .timer-badge span { color: var(--accent); }

        .actions {
          display: flex; gap: 0.65rem;
          flex-wrap: wrap; justify-content: center;
        }

        .btn {
          padding: 0.65rem 1.4rem;
          border-radius: 5px;
          font-family: 'DM Mono', monospace;
          font-size: 0.72rem;
          letter-spacing: 0.08em;
          cursor: pointer;
          transition: all 0.2s;
          text-transform: uppercase;
          text-decoration: none;
          display: inline-flex; align-items: center;
        }

        .btn-primary {
          background: var(--accent);
          border: 1px solid var(--accent);
          color: var(--accent-text);
        }

        .btn-primary:hover { background: var(--accent-hover); border-color: var(--accent-hover); }

        .btn-success {
          background: transparent;
          border: 1px solid var(--success);
          color: var(--success);
        }

        .btn-ghost {
          background: transparent;
          border: 1px solid var(--border);
          color: var(--text-muted);
        }

        .btn-ghost:hover { border-color: var(--border-hover, rgba(255,255,255,0.2)); color: var(--text); }
      `}</style>

      <div className="page">
        <div className="bg-grid" />

        <div className="topbar">
          <div className="logo-sm" onClick={() => navigate("/")}>
            <img src="/logo.png" alt="" onError={e => e.target.style.display="none"} />
            Pi<span>cy</span>
          </div>
          <div className="topbar-right">
            <div className="slug-pill">picy.com/ <b>{slug}</b></div>
            <button className="theme-btn" onClick={toggle}>{dark ? "☀️" : "🌙"}</button>
          </div>
        </div>

        <div className="main">
          {loading && (
            <div className="loading">
              <div className="spinner" />
              <div className="loading-text">Fetching...</div>
            </div>
          )}

          {!loading && empty && (
            <div className="upload-zone">
              <div className="upload-title">
                <h2>Drop your image.</h2>
                <p>This spot is unclaimed — make it yours.</p>
              </div>
              <div
                className={`drop-zone ${dragging ? "drag" : ""}`}
                onClick={() => fileRef.current.click()}
                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
              >
                <div className="drop-icon">🖼️</div>
                <div className="drop-label">
                  <b>Click to browse</b> or drag & drop<br />
                  PNG · JPG · GIF · WEBP supported
                </div>
                {uploading ? (
                  <div className="uploading-row">
                    <div className="spinner" style={{width:18,height:18}} />
                    Uploading...
                  </div>
                ) : (
                  <button className="upload-btn"
                    onClick={e => { e.stopPropagation(); fileRef.current.click(); }}>
                    Choose File
                  </button>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*"
                style={{display:"none"}}
                onChange={e => uploadFile(e.target.files[0])} />
            </div>
          )}

          {!loading && imageUrl && (
            <div className="image-view">
              <div className="img-frame">
                <img src={imageUrl} alt={slug} />
              </div>
              <div className="meta-row">
                {timer && <div className="timer-badge">⏱ <span>{timer}</span></div>}
              </div>
              <div className="actions">
                <button className={`btn ${copied ? "btn-success" : "btn-primary"}`} onClick={copyLink}>
                  {copied ? "✓ Copied!" : "Copy Link"}
                </button>
                <a href={imageUrl} download target="_blank" rel="noreferrer"
                  className="btn btn-ghost">Download</a>
                <button className="btn btn-ghost" onClick={() => navigate("/")}>← New Slug</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
