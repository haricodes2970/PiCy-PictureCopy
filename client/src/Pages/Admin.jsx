import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import axios from "axios";

const API = "https://picy.onrender.com";

export default function Admin() {
  const navigate = useNavigate();
  const { dark, toggle } = useTheme();
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async (pass) => {
    try {
      const res = await axios.get(`${API}/admin/stats`, {
        headers: { "x-admin-password": pass }
      });
      setStats(res.data);
      setError("");
    } catch {
      setError("Wrong password!");
      setAuthed(false);
    }
  };

  const handleLogin = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/admin/stats`, {
        headers: { "x-admin-password": password }
      });
      setStats(res.data);
      setAuthed(true);
      setError("");
      localStorage.setItem("picy-admin", password);
    } catch {
      setError("Wrong password! Access denied.");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchStats(localStorage.getItem("picy-admin"));
    setRefreshing(false);
  };

  useEffect(() => {
    const saved = localStorage.getItem("picy-admin");
    if (saved) {
      setPassword(saved);
      fetchStats(saved).then(() => setAuthed(true)).catch(() => {});
    }
  }, []);

  const Card = ({ label, value, icon, color }) => (
    <div className="stat-card">
      <div className="stat-icon" style={{ color }}>{icon}</div>
      <div className="stat-value" style={{ color }}>{value?.toLocaleString() ?? 0}</div>
      <div className="stat-label">{label}</div>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Mono:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root[data-theme="dark"] {
          --bg: #0c0c0c; --bg2: #141414; --bg3: #1a1a1a;
          --border: rgba(255,255,255,0.08);
          --text: #f0ece4; --text-muted: rgba(240,236,228,0.38);
          --text-dim: rgba(240,236,228,0.16);
          --accent: #ff5a1f; --accent-hover: #ff7a45; --accent-text: #0c0c0c;
          --card: rgba(255,255,255,0.03);
          --grid: rgba(255,255,255,0.025);
          --green: #4ade80; --blue: #60a5fa; --yellow: #fbbf24; --red: #f87171;
        }
        :root[data-theme="light"] {
          --bg: #f5f0e8; --bg2: #ede8df; --bg3: #e6e0d6;
          --border: rgba(0,0,0,0.09);
          --text: #1a1a1a; --text-muted: rgba(26,26,26,0.48);
          --text-dim: rgba(26,26,26,0.2);
          --accent: #ff5a1f; --accent-hover: #e04a10; --accent-text: #fff;
          --card: rgba(0,0,0,0.03);
          --grid: rgba(0,0,0,0.05);
          --green: #16a34a; --blue: #2563eb; --yellow: #d97706; --red: #dc2626;
        }

        html, body {
          background: var(--bg); color: var(--text);
          font-family: 'DM Mono', monospace;
          min-height: 100vh;
          transition: background 0.35s, color 0.35s;
        }

        .page { min-height: 100vh; display: flex; flex-direction: column; }

        .bg-grid {
          position: fixed; inset: 0;
          background-image:
            linear-gradient(var(--grid) 1px, transparent 1px),
            linear-gradient(90deg, var(--grid) 1px, transparent 1px);
          background-size: 56px 56px;
          pointer-events: none; z-index: 0;
        }

        /* TOPBAR */
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
          display: flex; align-items: center; gap: 0.4rem;
        }
        .logo-sm span { color: var(--accent); }

        .admin-badge {
          padding: 0.25rem 0.7rem;
          background: rgba(255,90,31,0.15);
          border: 1px solid rgba(255,90,31,0.3);
          border-radius: 999px;
          font-size: 0.6rem;
          color: var(--accent);
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .topbar-right {
          display: flex; align-items: center; gap: 0.75rem;
        }

        .theme-btn {
          width: 36px; height: 36px; border-radius: 50%;
          border: 1px solid var(--border);
          background: var(--bg2); cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          font-size: 1rem; transition: all 0.25s;
        }
        .theme-btn:hover { border-color: var(--accent); transform: rotate(20deg); }

        /* LOGIN */
        .login-wrap {
          flex: 1; display: flex;
          align-items: center; justify-content: center;
          padding: 2rem; position: relative; z-index: 1;
        }

        .login-box {
          width: min(420px, 100%);
          display: flex; flex-direction: column;
          align-items: center; gap: 2rem;
          animation: fadeUp 0.6s ease both;
        }

        @keyframes fadeUp {
          from { opacity:0; transform:translateY(24px); }
          to   { opacity:1; transform:translateY(0); }
        }

        .lock-icon { font-size: 3rem; }

        .login-title {
          font-family: 'Syne', sans-serif;
          font-size: 2rem; font-weight: 800;
          letter-spacing: -0.03em; text-align: center;
        }

        .login-title span { color: var(--accent); }

        .pass-row {
          width: 100%; display: flex;
          border: 1.5px solid var(--border);
          border-radius: 6px; overflow: hidden;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .pass-row:focus-within {
          border-color: var(--accent);
          box-shadow: 0 0 0 3px rgba(255,90,31,0.12);
        }

        .pass-input {
          flex: 1; padding: 0.95rem 1.1rem;
          background: var(--card); border: none; outline: none;
          font-family: 'DM Mono', monospace;
          font-size: 0.9rem; color: var(--text);
          caret-color: var(--accent);
        }

        .pass-input::placeholder { color: var(--text-dim); }

        .login-btn {
          padding: 0.95rem 1.8rem;
          background: var(--accent); border: none; cursor: pointer;
          font-family: 'Syne', sans-serif;
          font-size: 0.8rem; font-weight: 700;
          letter-spacing: 0.1em; text-transform: uppercase;
          color: var(--accent-text);
          transition: background 0.2s;
          white-space: nowrap;
        }
        .login-btn:hover { background: var(--accent-hover); }
        .login-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .error-msg {
          font-size: 0.72rem; color: var(--red);
          letter-spacing: 0.06em; text-align: center;
        }

        /* DASHBOARD */
        .dashboard {
          flex: 1; position: relative; z-index: 1;
          padding: 2.5rem 2rem;
          max-width: 1100px; width: 100%;
          margin: 0 auto;
          animation: fadeUp 0.5s ease both;
        }

        .dash-header {
          display: flex; align-items: center;
          justify-content: space-between;
          margin-bottom: 2.5rem; flex-wrap: wrap; gap: 1rem;
        }

        .dash-title {
          font-family: 'Syne', sans-serif;
          font-size: 1.8rem; font-weight: 800;
          letter-spacing: -0.03em;
        }

        .dash-title span { color: var(--accent); }

        .refresh-btn {
          padding: 0.6rem 1.4rem;
          border: 1px solid var(--border);
          border-radius: 5px;
          background: var(--card); cursor: pointer;
          font-family: 'DM Mono', monospace;
          font-size: 0.72rem; color: var(--text-muted);
          letter-spacing: 0.06em; text-transform: uppercase;
          transition: all 0.2s;
        }
        .refresh-btn:hover { border-color: var(--accent); color: var(--accent); }

        /* STAT CARDS */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 1rem; margin-bottom: 2.5rem;
        }

        .stat-card {
          padding: 1.5rem;
          border: 1px solid var(--border);
          border-radius: 10px;
          background: var(--card);
          display: flex; flex-direction: column;
          gap: 0.5rem;
          transition: border-color 0.2s, transform 0.2s;
        }

        .stat-card:hover { border-color: var(--accent); transform: translateY(-2px); }

        .stat-icon { font-size: 1.6rem; }

        .stat-value {
          font-family: 'Syne', sans-serif;
          font-size: 2.2rem; font-weight: 800;
          letter-spacing: -0.03em; line-height: 1;
        }

        .stat-label {
          font-size: 0.65rem; color: var(--text-muted);
          letter-spacing: 0.12em; text-transform: uppercase;
        }

        /* SECTIONS */
        .section {
          margin-bottom: 2.5rem;
        }

        .section-title {
          font-family: 'Syne', sans-serif;
          font-size: 1rem; font-weight: 700;
          letter-spacing: -0.01em;
          margin-bottom: 1rem;
          display: flex; align-items: center; gap: 0.5rem;
        }

        /* CHART */
        .chart-wrap {
          border: 1px solid var(--border);
          border-radius: 10px;
          background: var(--card);
          padding: 1.5rem;
          overflow-x: auto;
        }

        .chart {
          display: flex;
          align-items: flex-end;
          gap: 0.5rem;
          height: 120px;
          min-width: 100%;
        }

        .bar-group {
          display: flex; flex-direction: column;
          align-items: center; gap: 0.3rem;
          flex: 1; min-width: 32px;
        }

        .bars { display: flex; gap: 3px; align-items: flex-end; height: 100px; }

        .bar {
          width: 12px; border-radius: 3px 3px 0 0;
          transition: opacity 0.2s;
          min-height: 2px;
        }

        .bar:hover { opacity: 0.75; }

        .bar-date {
          font-size: 0.55rem; color: var(--text-dim);
          letter-spacing: 0.04em; white-space: nowrap;
          transform: rotate(-35deg); transform-origin: top center;
          margin-top: 4px;
        }

        .chart-legend {
          display: flex; gap: 1rem;
          margin-bottom: 0.8rem; flex-wrap: wrap;
        }

        .legend-item {
          display: flex; align-items: center; gap: 0.4rem;
          font-size: 0.65rem; color: var(--text-muted);
          letter-spacing: 0.06em; text-transform: uppercase;
        }

        .legend-dot {
          width: 10px; height: 10px; border-radius: 2px;
        }

        /* RECENT TABLE */
        .recent-table {
          border: 1px solid var(--border);
          border-radius: 10px;
          overflow: hidden;
          background: var(--card);
        }

        .table-row {
          display: flex; align-items: center;
          justify-content: space-between;
          padding: 0.9rem 1.2rem;
          border-bottom: 1px solid var(--border);
          font-size: 0.75rem;
          transition: background 0.15s;
        }

        .table-row:last-child { border-bottom: none; }
        .table-row:hover { background: rgba(255,90,31,0.04); }

        .table-header {
          font-size: 0.6rem;
          color: var(--text-dim);
          letter-spacing: 0.12em;
          text-transform: uppercase;
          background: var(--bg2);
          cursor: default;
        }
        .table-header:hover { background: var(--bg2); }

        .row-slug {
          color: var(--accent);
          font-weight: 500;
        }

        .row-date { color: var(--text-muted); font-size: 0.68rem; }

        .logout-btn {
          margin-top: 1rem;
          padding: 0.6rem 1.4rem;
          border: 1px solid var(--border);
          border-radius: 5px;
          background: transparent; cursor: pointer;
          font-family: 'DM Mono', monospace;
          font-size: 0.7rem; color: var(--text-muted);
          letter-spacing: 0.06em; text-transform: uppercase;
          transition: all 0.2s;
        }
        .logout-btn:hover { border-color: var(--red); color: var(--red); }

        @media (max-width: 600px) {
          .dashboard { padding: 1.5rem 1rem; }
          .stat-value { font-size: 1.8rem; }
        }
      `}</style>

      <div className="page">
        <div className="bg-grid" />

        <div className="topbar">
          <div style={{display:"flex", alignItems:"center", gap:"0.75rem"}}>
            <div className="logo-sm" onClick={() => navigate("/")}>Pi<span>cy</span></div>
            <div className="admin-badge">Admin</div>
          </div>
          <div className="topbar-right">
            <button className="theme-btn" onClick={toggle}>{dark ? "☀️" : "🌙"}</button>
          </div>
        </div>

        {!authed ? (
          <div className="login-wrap">
            <div className="login-box">
              <div className="lock-icon">🔐</div>
              <div className="login-title">Admin <span>Access</span></div>
              <div className="pass-row">
                <input
                  className="pass-input"
                  type="password"
                  placeholder="Enter admin password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleLogin()}
                  autoFocus
                />
                <button className="login-btn" onClick={handleLogin} disabled={loading || !password}>
                  {loading ? "..." : "Enter →"}
                </button>
              </div>
              {error && <div className="error-msg">{error}</div>}
            </div>
          </div>
        ) : (
          <div className="dashboard">
            <div className="dash-header">
              <div className="dash-title">Your <span>Dashboard</span></div>
              <button className="refresh-btn" onClick={handleRefresh}>
                {refreshing ? "Refreshing..." : "↻ Refresh"}
              </button>
            </div>

            {stats && (
              <>
                {/* Stat Cards */}
                <div className="stats-grid">
                  <Card label="Total Uploads" value={stats.totalUploads} icon="📤" color="var(--accent)" />
                  <Card label="Active Images" value={stats.activeImages} icon="🖼️" color="var(--green)" />
                  <Card label="Expired Images" value={stats.totalExpired} icon="⏱️" color="var(--yellow)" />
                  <Card label="Total Visits" value={stats.totalVisits} icon="👁️" color="var(--blue)" />
                </div>

                {/* Chart */}
                {stats.dailyStats?.length > 0 && (
                  <div className="section">
                    <div className="section-title">📊 Last 30 Days</div>
                    <div className="chart-wrap">
                      <div className="chart-legend">
                        <div className="legend-item">
                          <div className="legend-dot" style={{background:"var(--accent)"}} />
                          Uploads
                        </div>
                        <div className="legend-item">
                          <div className="legend-dot" style={{background:"var(--blue)"}} />
                          Visits
                        </div>
                      </div>
                      <div className="chart">
                        {(() => {
                          const maxVal = Math.max(...stats.dailyStats.map(d => Math.max(d.uploads, d.visits)), 1);
                          return stats.dailyStats.slice(-14).map((day, i) => (
                            <div className="bar-group" key={i}>
                              <div className="bars">
                                <div className="bar"
                                  style={{ height: `${(day.uploads / maxVal) * 100}px`, background: "var(--accent)" }}
                                  title={`${day.uploads} uploads`} />
                                <div className="bar"
                                  style={{ height: `${(day.visits / maxVal) * 100}px`, background: "var(--blue)" }}
                                  title={`${day.visits} visits`} />
                              </div>
                              <div className="bar-date">{day.date.slice(5)}</div>
                            </div>
                          ));
                        })()}
                      </div>
                    </div>
                  </div>
                )}

                {/* Recent Images */}
                {stats.recentImages?.length > 0 && (
                  <div className="section">
                    <div className="section-title">🕐 Recent Uploads</div>
                    <div className="recent-table">
                      <div className="table-row table-header">
                        <span>Slug</span>
                        <span>Uploaded</span>
                      </div>
                      {stats.recentImages.map((img, i) => (
                        <div className="table-row" key={i}>
                          <span className="row-slug">/{img.slug}</span>
                          <span className="row-date">
                            {new Date(img.createdAt).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button className="logout-btn" onClick={() => {
                  localStorage.removeItem("picy-admin");
                  setAuthed(false);
                  setPassword("");
                }}>
                  🚪 Logout
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
}
