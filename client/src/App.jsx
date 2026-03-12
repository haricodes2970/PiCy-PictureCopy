import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import { useRegisterSW } from "virtual:pwa-register/react";
import { ThemeProvider } from "./context/ThemeContext";
import Home from "./Pages/Home";
import SlugPage from "./Pages/SlugPage";
import SlugChooser from "./Pages/SlugChooser";
import NotFound from "./Pages/NotFound";
import Admin from "./Pages/Admin";

export default function App() {
  const { needRefresh: [needRefresh], updateServiceWorker } = useRegisterSW();
  const [showUpdate, setShowUpdate] = useState(false);

  useEffect(() => {
    setShowUpdate(needRefresh);
  }, [needRefresh]);

  return (
    <ThemeProvider>
      {showUpdate && (
        <div style={{
          position: "fixed", bottom: "1.5rem", left: "50%",
          transform: "translateX(-50%)", zIndex: 9999,
          background: "#ff5a1f", color: "#fff",
          padding: "0.75rem 1.5rem", borderRadius: "999px",
          fontFamily: "DM Mono, monospace", fontSize: "0.75rem",
          display: "flex", gap: "1rem", alignItems: "center",
          boxShadow: "0 8px 24px rgba(255,90,31,0.4)"
        }}>
          🚀 New update available!
          <button onClick={() => updateServiceWorker(true)} style={{
            background: "#fff", color: "#ff5a1f", border: "none",
            borderRadius: "999px", padding: "0.3rem 0.9rem",
            cursor: "pointer", fontFamily: "DM Mono, monospace",
            fontSize: "0.72rem", fontWeight: "600"
          }}>
            Update now
          </button>
        </div>
      )}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/xk92-admin-picy" element={<Admin />} />
        <Route path="/:slug" element={<SlugChooser />} />
        <Route path="/:slug/image" element={<SlugPage mode="image" />} />
        <Route path="/:slug/text" element={<SlugPage mode="text" />} />
        <Route path="/:slug/both" element={<SlugPage mode="both" />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </ThemeProvider>
  );
}
