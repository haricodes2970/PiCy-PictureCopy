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

function TextEditor({ slug, initialText, isBoth }) {
  const [text, setText] = useState(initialText || "");
  const [saved, setSaved] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const saveTimer = useRef(null);

  const handleChange = (e) => {
    setText(e.target.value);
    setSaved(false);
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => autoSave(e.target.value), 1500);
  };

  const autoSave = async (value) => {
    setSaving(true);
    try {
      await axios.put(`${API}/${slug}/text`, { text: value });
      setSaved(true);
    } catch (err) {
      console.error("Save failed", err);
    } finally {
      setSaving(false);
    }
  };

  const copyText = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="text-frame" style={isBoth ? {} : { maxWidth: "780px", width: "100%", minHeight: "400px" }}>
      <div className="text-frame-header">
        <span className="text-frame-label">
          📝 picy.com/{slug}{isBoth ? "" : "/text"}
        </span>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <span style={{ fontSize: "0.6rem", color: saving ? "var(--accent)" : saved ? "var(--success)" : "var(--text-dim)", letterSpacing: "0.08em" }}>
            {saving ? "⟳ saving..." : saved ? "✓ saved" : "● unsaved"}
          </span>
          <button
            className={`btn ${copied ? "btn-success" : "btn-ghost"}`}
            style={{ padding: "0.3rem 0.8rem", fontSize: "0.65rem" }}
            onClick={copyText}>
            {copied ? "✓ Copied!" : "Copy"}
          </button>
        </div>
      </div>
      <textarea
        className="text-editor"
        style={{ minHeight: isBoth ? "50vh" : "360px", borderRadius: "0 0 10px 10px", border: "none", borderTop: "1px solid var(--border)" }}
        value={text}
        onChange={handleChange}
        placeholder="Start typing... changes save automatically"
      />
      <div style={{ padding: "0.4rem 1rem", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontSize: "0.6rem", color: "var(--text-dim)" }}>{text.length} / 50,000</span>
        <span style={{ fontSize: "0.6rem", color: "var(--text-dim)" }}>Auto-saves as you type</span>
      </div>
    </div>
  );
}

export default function SlugPage({ mode = "image" }) {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { dark, toggle } = useTheme();

  // Data state
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [empty, setEmpty] = useState(false);
  const [timer, setTimer] = useState("");

  // Mode selection (for empty slug)
  const [selectedMode, setSelectedMode] = useState(mode); // "image" | "text" | "both"

  // Upload state
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [textInput, setTextInput] = useState("");
  const [copied, setCopied] = useState(false);
  const [showOverwrite, setShowOverwrite] = useState(false);
  const [overwriting, setOverwriting] = useState(false);
  const [blanking, setBlanking] = useState(false);

  const fileRef = useRef();
  const overwriteRef = useRef();

  useEffect(() => {
    axios.get(`${API}/${slug}`)
      .then(res => setData(res.data))
      .catch(() => setEmpty(true))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (!data?.expiresAt) return;
    setTimer(timeLeft(data.expiresAt));
    const id = setInterval(() => setTimer(timeLeft(data.expiresAt)), 30000);
    return () => clearInterval(id);
  }, [data?.expiresAt]);

  const handleSubmit = async () => {
    if (!selectedMode) return;
    if (selectedMode === "text" && !textInput.trim()) return alert("Please enter some text!");
    if (selectedMode === "image" && !selectedFile) return alert("Please select an image!");
    if (selectedMode === "both" && (!selectedFile || !textInput.trim())) return alert("Please add both image and text!");

    const formData = new FormData();
    formData.append("type", selectedMode);
    if (selectedFile) formData.append("image", selectedFile);
    if (textInput.trim()) formData.append("text", textInput.trim());

    setUploading(true);
    try {
      const res = await axios.post(`${API}/${slug}`, formData);
      setData(res.data);
      setEmpty(false);
    } catch (err) {
      alert(err.response?.data?.error || "Upload failed!");
    } finally {
      setUploading(false);
    }
  };

  const overwriteFile = async (file) => {
    if (!file?.type.startsWith("image/")) return alert("Please upload an image!");
    const formData = new FormData();
    formData.append("image", file);
    setOverwriting(true);
    try {
      const res = await axios.put(`${API}/${slug}/overwrite`, formData);
      setData(prev => ({ ...prev, imageUrl: res.data.imageUrl }));
      setShowOverwrite(false);
    } catch (err) {
      alert(err.response?.data?.error || "Overwrite failed!");
    } finally {
      setOverwriting(false);
    }
  };

  const blankImage = async () => {
    if (!window.confirm("Replace image with a blank? This cannot be undone.")) return;
    setBlanking(true);
    try {
      const res = await axios.put(`${API}/${slug}/blank`);
      setData(prev => ({ ...prev, imageUrl: res.data.imageUrl }));
      setShowOverwrite(false);
    } catch (err) {
      alert(err.response?.data?.error || "Failed!");
    } finally {
      setBlanking(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

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
          --glow: rgba(255,90,31,0.10); --success: #4ade80; --red: #f87171;
        }
        :root[data-theme="light"] {
          --bg: #f5f0e8; --bg2: #ede8df; --bg3: #e6e0d6;
          --border: rgba(0,0,0,0.09);
          --text: #1a1a1a; --text-muted: rgba(26,26,26,0.48);
          --text-dim: rgba(26,26,26,0.22);
          --accent: #ff5a1f; --accent-hover: #e04a10; --accent-text: #fff;
          --card: rgba(0,0,0,0.03); --grid: rgba(0,0,0,0.05);
          --glow: rgba(255,90,31,0.07); --success: #16a34a; --red: #dc2626;
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
          background: var(--bg); transition: background 0.35s;
        }

        .logo-sm {
          font-family: 'Syne', sans-serif; font-weight: 800; font-size: 1.4rem;
          letter-spacing: -0.03em; cursor: pointer; color: var(--text);
          display: flex; align-items: center; gap: 0.5rem;
        }
        .logo-sm span { color: var(--accent); }
        .logo-sm img { width: 28px; height: 28px; object-fit: contain; }

        .topbar-right { display: flex; align-items: center; gap: 0.75rem; }

        .slug-pill {
          padding: 0.38rem 1rem; border: 1px solid var(--border);
          border-radius: 999px; font-size: 0.72rem;
          color: var(--text-muted); background: var(--card);
        }
        .slug-pill b { color: var(--text); font-weight: 500; }

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

        .spinner {
          width: 32px; height: 32px;
          border: 2px solid var(--border); border-top-color: var(--accent);
          border-radius: 50%; animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .loading { display: flex; flex-direction: column; align-items: center; gap: 1rem; }
        .loading-text { font-size: 0.7rem; color: var(--text-dim); letter-spacing: 0.18em; text-transform: uppercase; }

        /* MODE SELECTOR */
        .mode-wrap {
          width: min(600px, 100%); margin: 0 auto;
          display: flex; flex-direction: column; align-items: center; gap: 2.5rem;
        }

        .mode-title { text-align: center; }
        .mode-title h2 {
          font-family: 'Syne', sans-serif;
          font-size: clamp(1.8rem, 5vw, 2.6rem);
          font-weight: 800; letter-spacing: -0.03em;
        }
        .mode-title p { margin-top: 0.5rem; font-size: 0.75rem; color: var(--text-muted); }

        .mode-cards {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; width: 100%;
        }

        .mode-card {
          padding: 1.8rem 1rem; border: 1.5px solid var(--border);
          border-radius: 10px; background: var(--card); cursor: pointer;
          display: flex; flex-direction: column; align-items: center; gap: 0.75rem;
          transition: all 0.2s; text-align: center;
        }
        .mode-card:hover { border-color: var(--accent); background: rgba(255,90,31,0.04); transform: translateY(-2px); }
        .mode-card.active { border-color: var(--accent); background: rgba(255,90,31,0.08); }

        .mode-icon { font-size: 2rem; }
        .mode-label {
          font-family: 'Syne', sans-serif; font-size: 0.85rem; font-weight: 700;
          letter-spacing: 0.06em; text-transform: uppercase; color: var(--text);
        }
        .mode-desc { font-size: 0.62rem; color: var(--text-muted); line-height: 1.6; }

        /* UPLOAD FORM */
        .upload-form {
          width: 100%; display: flex; flex-direction: column; gap: 1.2rem;
        }

        .drop-zone {
          width: 100%; border: 1.5px dashed var(--border); border-radius: 10px;
          padding: 2.5rem 2rem; display: flex; flex-direction: column;
          align-items: center; gap: 1rem; cursor: pointer;
          transition: border-color 0.2s, background 0.2s; background: var(--card);
        }
        .drop-zone:hover, .drop-zone.drag { border-color: var(--accent); background: rgba(255,90,31,0.04); }
        .drop-zone.has-file { border-color: var(--success); background: rgba(74,222,128,0.04); border-style: solid; }
        .drop-icon { font-size: 2rem; opacity: 0.5; }
        .drop-label { font-size: 0.75rem; color: var(--text-muted); text-align: center; line-height: 1.9; }
        .drop-label b { color: var(--accent); font-weight: 400; }
        .file-name { font-size: 0.72rem; color: var(--success); letter-spacing: 0.04em; }

        .text-editor {
          width: 100%; min-height: 160px; padding: 1rem;
          background: var(--bg2); border: 1.5px solid var(--border);
          border-radius: 8px; outline: none; resize: vertical;
          font-family: 'DM Mono', monospace; font-size: 0.88rem;
          color: var(--text); caret-color: var(--accent);
          transition: border-color 0.2s;
          line-height: 1.7;
        }
        .text-editor:focus { border-color: var(--accent); }
        .text-editor::placeholder { color: var(--text-dim); }

        .submit-row {
          display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap;
        }

        /* BUTTONS */
        .btn {
          padding: 0.7rem 1.6rem; border-radius: 5px;
          font-family: 'DM Mono', monospace; font-size: 0.72rem;
          letter-spacing: 0.08em; cursor: pointer; transition: all 0.2s;
          text-transform: uppercase; text-decoration: none;
          display: inline-flex; align-items: center; gap: 0.4rem; border: none;
        }
        .btn-primary { background: var(--accent); color: var(--accent-text); border: 1px solid var(--accent); }
        .btn-primary:hover:not(:disabled) { background: var(--accent-hover); }
        .btn-primary:disabled { opacity: 0.35; cursor: not-allowed; }
        .btn-success { background: transparent; border: 1px solid var(--success); color: var(--success); }
        .btn-ghost { background: transparent; border: 1px solid var(--border); color: var(--text-muted); }
        .btn-ghost:hover { border-color: var(--accent); color: var(--text); }
        .btn-danger { background: transparent; border: 1px solid var(--red); color: var(--red); }
        .btn-danger:hover { background: rgba(248,113,113,0.08); }
        .btn-back { background: transparent; border: none; color: var(--text-muted); font-size: 0.68rem; cursor: pointer; padding: 0.4rem 0; }
        .btn-back:hover { color: var(--accent); }

        /* CONTENT VIEW */
        .content-view {
          width: min(900px, 100%); margin: 0 auto;
          display: flex; flex-direction: column; gap: 1.4rem; align-items: center;
        }

        /* BOTH MODE — side by side on desktop, stacked on mobile */
        .both-layout {
          width: 100%; display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.2rem;
        }

        @media (max-width: 700px) {
          .both-layout { grid-template-columns: 1fr; }
          .mode-cards { grid-template-columns: 1fr; }
          .slug-pill { display: none; }
        }

        .img-frame {
          width: 100%; border-radius: 10px; overflow: hidden;
          border: 1px solid var(--border); background: var(--bg2);
          box-shadow: 0 16px 40px var(--glow);
        }
        .img-frame img { width: 100%; display: block; object-fit: contain; max-height: 60vh; }

        .text-frame {
          width: 100%; border-radius: 10px;
          border: 1px solid var(--border); background: var(--bg2);
          display: flex; flex-direction: column;
          overflow: hidden;
          box-shadow: 0 16px 40px rgba(0,0,0,0.06);
        }

        .text-frame-header {
          padding: 0.75rem 1rem;
          border-bottom: 1px solid var(--border);
          display: flex; align-items: center; justify-content: space-between;
          background: var(--bg3);
        }

        .text-frame-label {
          font-size: 0.62rem; letter-spacing: 0.14em;
          text-transform: uppercase; color: var(--text-muted);
        }

        .text-frame-body {
          padding: 1.2rem; font-size: 0.88rem; line-height: 1.8;
          color: var(--text); white-space: pre-wrap; word-break: break-word;
          overflow-y: auto; max-height: 60vh; flex: 1;
        }

        .timer-badge {
          padding: 0.3rem 0.85rem; border: 1px solid var(--border);
          border-radius: 999px; font-size: 0.65rem; color: var(--text-muted); background: var(--card);
        }
        .timer-badge span { color: var(--accent); }

        .actions { display: flex; gap: 0.65rem; flex-wrap: wrap; justify-content: center; }

        /* OVERWRITE PANEL */
        .overwrite-panel {
          width: 100%; border: 1.5px dashed var(--border);
          border-radius: 10px; padding: 1.8rem; background: var(--card);
          animation: fadeUp 0.3s ease both;
        }
        .overwrite-title {
          font-family: 'Syne', sans-serif; font-size: 1rem; font-weight: 700;
          margin-bottom: 1.2rem; text-align: center;
        }
        .overwrite-options { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
        .overwrite-option {
          padding: 1.2rem 1rem; border: 1px solid var(--border); border-radius: 8px;
          background: var(--bg2); cursor: pointer;
          display: flex; flex-direction: column; align-items: center; gap: 0.6rem;
          transition: all 0.2s; text-align: center;
        }
        .overwrite-option:hover { border-color: var(--accent); background: rgba(255,90,31,0.05); }
        .overwrite-option:disabled { opacity: 0.4; cursor: not-allowed; }
        .option-icon { font-size: 1.8rem; }
        .option-label {
          font-family: 'Syne', sans-serif; font-size: 0.78rem; font-weight: 700;
          letter-spacing: 0.06em; text-transform: uppercase;
        }
        .option-desc { font-size: 0.62rem; color: var(--text-muted); line-height: 1.6; }
        .option-danger:hover { border-color: var(--red); background: rgba(248,113,113,0.05); }
        .overwrite-cancel {
          margin-top: 0.75rem; width: 100%; padding: 0.6rem;
          background: transparent; border: none; cursor: pointer;
          font-family: 'DM Mono', monospace; font-size: 0.68rem;
          color: var(--text-dim); letter-spacing: 0.08em; text-transform: uppercase;
        }
        .overwrite-cancel:hover { color: var(--text-muted); }

        .uploading-row {
          display: flex; align-items: center; gap: 0.6rem;
          font-size: 0.72rem; color: var(--text-muted); letter-spacing: 0.1em; text-transform: uppercase;
        }

        .char-count {
          font-size: 0.62rem; color: var(--text-dim);
          text-align: right; letter-spacing: 0.04em;
        }
      `}</style>

      <div className="page">
        <div className="bg-grid" />

        <div className="topbar">
          <div className="logo-sm" onClick={() => navigate("/")}>
            <img src="/logo.png" alt="" onError={e => e.target.style.display = "none"} />
            Pi<span>cy</span>
          </div>
          <div className="topbar-right">
            <div className="slug-pill">picy.com/ <b>{slug}</b></div>
            <button className="theme-btn" onClick={toggle}>{dark ? "☀️" : "🌙"}</button>
          </div>
        </div>

        <div className="main">

          {/* LOADING */}
          {loading && (
            <div className="loading">
              <div className="spinner" />
              <div className="loading-text">Fetching...</div>
            </div>
          )}

          {/* EMPTY — MODE SELECTOR */}
          {!loading && empty && (
            <div className="mode-wrap">
              {!selectedMode ? (
                <>
                  <div className="mode-title">
                    <h2>What are you sharing?</h2>
                    <p>Pick a mode to get started at picy.com/{slug}</p>
                  </div>
                  <div className="mode-cards">
                    <div className="mode-card" onClick={() => setSelectedMode("image")}>
                      <div className="mode-icon">🖼️</div>
                      <div className="mode-label">Image</div>
                      <div className="mode-desc">Upload any image file up to 5MB</div>
                    </div>
                    <div className="mode-card" onClick={() => setSelectedMode("text")}>
                      <div className="mode-icon">📝</div>
                      <div className="mode-label">Text</div>
                      <div className="mode-desc">Share text, code, or notes</div>
                    </div>
                    <div className="mode-card" onClick={() => setSelectedMode("both")}>
                      <div className="mode-icon">✨</div>
                      <div className="mode-label">Both</div>
                      <div className="mode-desc">Image with text together</div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="mode-title">
                    <h2>{selectedMode === "image" ? "🖼️ Upload Image" : selectedMode === "text" ? "📝 Share Text" : "✨ Image + Text"}</h2>
                    <p>This will be saved at picy.com/{slug}</p>
                  </div>

                  <div className="upload-form">
                    {/* Image upload */}
                    {(selectedMode === "image" || selectedMode === "both") && (
                      <div
                        className={`drop-zone ${dragging ? "drag" : ""} ${selectedFile ? "has-file" : ""}`}
                        onClick={() => fileRef.current.click()}
                        onDragOver={e => { e.preventDefault(); setDragging(true); }}
                        onDragLeave={() => setDragging(false)}
                        onDrop={e => { e.preventDefault(); setDragging(false); setSelectedFile(e.dataTransfer.files[0]); }}
                      >
                        <div className="drop-icon">{selectedFile ? "✅" : "🖼️"}</div>
                        {selectedFile ? (
                          <div className="file-name">✓ {selectedFile.name}</div>
                        ) : (
                          <div className="drop-label">
                            <b>Click to browse</b> or drag & drop<br />
                            PNG · JPG · GIF · WEBP · Max 5MB
                          </div>
                        )}
                        <input ref={fileRef} type="file" accept="image/*"
                          style={{display:"none"}}
                          onChange={e => setSelectedFile(e.target.files[0])} />
                      </div>
                    )}

                    {/* Text input */}
                    {(selectedMode === "text" || selectedMode === "both") && (
                      <>
                        <textarea
                          className="text-editor"
                          placeholder="Type or paste your text here..."
                          value={textInput}
                          onChange={e => setTextInput(e.target.value)}
                          maxLength={50000}
                        />
                        <div className="char-count">{textInput.length} / 50,000</div>
                      </>
                    )}

                    <div className="submit-row">
                      {uploading ? (
                        <div className="uploading-row">
                          <div className="spinner" style={{width:18,height:18}} /> Saving...
                        </div>
                      ) : (
                        <>
                          <button className="btn btn-primary" onClick={handleSubmit}>
                            Save to picy.com/{slug} →
                          </button>
                          <button className="btn-back" onClick={() => { setSelectedMode(null); setSelectedFile(null); setTextInput(""); }}>
                            ← Change mode
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* CONTENT VIEW */}
          {!loading && data && (
            <div className="content-view">

              {/* IMAGE ONLY */}
              {data.type === "image" && (
                <div className="img-frame" style={{maxWidth:"780px", width:"100%"}}>
                  <img src={data.imageUrl} alt={slug} />
                </div>
              )}

              {/* TEXT ONLY */}
              {data.type === "text" && (
                <TextEditor slug={slug} initialText={data.text} />
              )}

              {/* BOTH */}
              {data.type === "both" && (
                <div className="both-layout">
                  <div className="img-frame">
                    <img src={data.imageUrl} alt={slug} />
                  </div>
                  <TextEditor slug={slug} initialText={data.text} isBoth />
                </div>
              )}

              {/* Timer */}
              {timer && <div className="timer-badge">⏱ <span>{timer}</span></div>}

              {/* Actions */}
              {!showOverwrite ? (
                <div className="actions">
                  <button className={`btn ${copied ? "btn-success" : "btn-primary"}`} onClick={copyLink}>
                    {copied ? "✓ Copied!" : "Copy Link"}
                  </button>
                  {data.imageUrl && (
                    <button
                      className="btn btn-ghost"
                      onClick={async () => {
                        const res = await fetch(data.imageUrl);
                        const blob = await res.blob();
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = `picy-${slug}.${blob.type.split("/")[1] || "jpg"}`;
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                    >
                      Download
                    </button>
                  )}
                  {data.imageUrl && (
                    <button className="btn btn-ghost" onClick={() => setShowOverwrite(true)}>🔁 Overwrite</button>
                  )}
                  <button className="btn btn-ghost" onClick={() => navigate("/")}>← New Slug</button>
                </div>
              ) : (
                <div className="overwrite-panel">
                  <div className="overwrite-title">🔒 Replace this image</div>
                  <div className="overwrite-options">
                    <button className="overwrite-option" disabled={overwriting || blanking}
                      onClick={() => overwriteRef.current.click()}>
                      <div className="option-icon">🖼️</div>
                      <div className="option-label">New Image</div>
                      <div className="option-desc">Replace with a different image</div>
                      {overwriting && <div className="uploading-row" style={{fontSize:"0.65rem"}}>
                        <div className="spinner" style={{width:14,height:14}} /> Replacing...
                      </div>}
                    </button>
                    <button className="overwrite-option option-danger" disabled={overwriting || blanking}
                      onClick={blankImage}>
                      <div className="option-icon">🗑️</div>
                      <div className="option-label">Clear Image</div>
                      <div className="option-desc">Replace with a tiny blank pixel</div>
                      {blanking && <div className="uploading-row" style={{fontSize:"0.65rem"}}>
                        <div className="spinner" style={{width:14,height:14}} /> Clearing...
                      </div>}
                    </button>
                  </div>
                  <button className="overwrite-cancel" onClick={() => setShowOverwrite(false)}>✕ Cancel</button>
                </div>
              )}

              <input ref={overwriteRef} type="file" accept="image/*"
                style={{display:"none"}} onChange={e => overwriteFile(e.target.files[0])} />
            </div>
          )}

        </div>
      </div>
    </>
  );
}
