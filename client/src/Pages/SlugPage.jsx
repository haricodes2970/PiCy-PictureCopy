import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const API = "http://localhost:5000/api";

export default function SlugPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [empty, setEmpty] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileRef = useRef();

  useEffect(() => {
    axios.get(`${API}/${slug}`)
      .then((res) => setImageUrl(res.data.imageUrl))
      .catch(() => setEmpty(true))
      .finally(() => setLoading(false));
  }, [slug]);

  const uploadFile = async (file) => {
    if (!file || !file.type.startsWith("image/")) return alert("Please upload an image file!");
    const formData = new FormData();
    formData.append("image", file);
    setUploading(true);
    try {
      const res = await axios.post(`${API}/${slug}`, formData);
      setImageUrl(res.data.imageUrl);
      setEmpty(false);
    } catch (err) {
      alert(err.response?.data?.error || "Upload failed!");
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    uploadFile(file);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/${slug}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
        }

        .page {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          position: relative;
        }

        .bg-grid {
          position: fixed;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
          background-size: 60px 60px;
          pointer-events: none;
          z-index: 0;
        }

        .topbar {
          position: relative;
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.5rem 2.5rem;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }

        .logo-sm {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: 1.5rem;
          letter-spacing: -0.03em;
          cursor: pointer;
          color: #f0ece4;
          text-decoration: none;
        }

        .logo-sm span { color: #ff5a1f; }

        .slug-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.4rem 1rem;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 999px;
          font-size: 0.75rem;
          color: rgba(240,236,228,0.5);
          letter-spacing: 0.05em;
        }

        .slug-badge b {
          color: #f0ece4;
          font-weight: 400;
        }

        .main {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 3rem 2rem;
          position: relative;
          z-index: 1;
          animation: fadeUp 0.5s ease both;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* LOADING */
        .loading-wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }

        .spinner {
          width: 36px; height: 36px;
          border: 2px solid rgba(255,255,255,0.1);
          border-top-color: #ff5a1f;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        .loading-text {
          font-size: 0.75rem;
          color: rgba(240,236,228,0.3);
          letter-spacing: 0.15em;
          text-transform: uppercase;
        }

        /* UPLOAD ZONE */
        .upload-zone {
          width: min(560px, 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2.5rem;
        }

        .upload-title {
          text-align: center;
        }

        .upload-title h2 {
          font-family: 'Syne', sans-serif;
          font-size: clamp(1.8rem, 5vw, 2.8rem);
          font-weight: 800;
          letter-spacing: -0.03em;
          line-height: 1.1;
        }

        .upload-title p {
          margin-top: 0.6rem;
          font-size: 0.78rem;
          color: rgba(240,236,228,0.35);
          letter-spacing: 0.05em;
        }

        .drop-area {
          width: 100%;
          border: 1.5px dashed rgba(255,255,255,0.15);
          border-radius: 8px;
          padding: 4rem 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.2rem;
          cursor: pointer;
          transition: border-color 0.2s, background 0.2s;
          background: rgba(255,255,255,0.02);
          position: relative;
        }

        .drop-area:hover, .drop-area.dragging {
          border-color: #ff5a1f;
          background: rgba(255, 90, 31, 0.05);
        }

        .drop-icon {
          font-size: 2.5rem;
          opacity: 0.6;
        }

        .drop-label {
          font-size: 0.82rem;
          color: rgba(240,236,228,0.4);
          letter-spacing: 0.05em;
          text-align: center;
          line-height: 1.8;
        }

        .drop-label b {
          color: #ff5a1f;
          font-weight: 400;
        }

        .upload-btn {
          padding: 0.75rem 2rem;
          background: #ff5a1f;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-family: 'Syne', sans-serif;
          font-size: 0.82rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #0a0a0a;
          transition: background 0.2s, transform 0.1s;
        }

        .upload-btn:hover { background: #ff7a45; }
        .upload-btn:active { transform: scale(0.97); }
        .upload-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .uploading-bar {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.75rem;
          color: rgba(240,236,228,0.4);
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        /* IMAGE VIEW */
        .image-view {
          width: min(800px, 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
        }

        .img-frame {
          width: 100%;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.08);
          background: #111;
          box-shadow: 0 40px 80px rgba(0,0,0,0.6);
        }

        .img-frame img {
          width: 100%;
          display: block;
          object-fit: contain;
          max-height: 70vh;
        }

        .actions {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
          justify-content: center;
        }

        .action-btn {
          padding: 0.65rem 1.4rem;
          border-radius: 4px;
          font-family: 'DM Mono', monospace;
          font-size: 0.75rem;
          letter-spacing: 0.08em;
          cursor: pointer;
          transition: all 0.2s;
          text-transform: uppercase;
        }

        .action-btn.primary {
          background: #ff5a1f;
          border: 1px solid #ff5a1f;
          color: #0a0a0a;
          font-weight: 600;
        }

        .action-btn.primary:hover { background: #ff7a45; border-color: #ff7a45; }

        .action-btn.secondary {
          background: transparent;
          border: 1px solid rgba(255,255,255,0.15);
          color: rgba(240,236,228,0.6);
        }

        .action-btn.secondary:hover {
          border-color: rgba(255,255,255,0.35);
          color: #f0ece4;
        }

        .action-btn.success {
          background: transparent;
          border: 1px solid #4ade80;
          color: #4ade80;
        }
      `}</style>

      <div className="page">
        <div className="bg-grid" />

        <div className="topbar">
          <div className="logo-sm" onClick={() => navigate("/")}>Pi<span>cy</span></div>
          <div className="slug-badge">picy.com/<b>{slug}</b></div>
        </div>

        <div className="main">
          {loading && (
            <div className="loading-wrap">
              <div className="spinner" />
              <div className="loading-text">Fetching...</div>
            </div>
          )}

          {!loading && empty && (
            <div className="upload-zone">
              <div className="upload-title">
                <h2>Drop your image here.</h2>
                <p>This spot is empty — be the first to claim it.</p>
              </div>

              <div
                className={`drop-area ${dragging ? "dragging" : ""}`}
                onClick={() => fileRef.current.click()}
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
              >
                <div className="drop-icon">🖼️</div>
                <div className="drop-label">
                  <b>Click to browse</b> or drag & drop<br />
                  PNG, JPG, GIF, WEBP supported
                </div>
                {uploading ? (
                  <div className="uploading-bar">
                    <div className="spinner" style={{width:18, height:18}} />
                    Uploading...
                  </div>
                ) : (
                  <button className="upload-btn" disabled={uploading}
                    onClick={(e) => { e.stopPropagation(); fileRef.current.click(); }}>
                    Choose File
                  </button>
                )}
              </div>

              <input ref={fileRef} type="file" accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => uploadFile(e.target.files[0])} />
            </div>
          )}

          {!loading && imageUrl && (
            <div className="image-view">
              <div className="img-frame">
                <img src={imageUrl} alt={slug} />
              </div>
              <div className="actions">
                <button className={`action-btn ${copied ? "success" : "primary"}`} onClick={copyLink}>
                  {copied ? "✓ Copied!" : "Copy Link"}
                </button>
                <a href={imageUrl} download className="action-btn secondary" target="_blank" rel="noreferrer">
                  Download
                </a>
                <button className="action-btn secondary" onClick={() => navigate("/")}>
                  ← New Slug
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
