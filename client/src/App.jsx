import { Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import Home from "./Pages/Home";
import SlugPage from "./Pages/SlugPage";

export default function App() {
  return (
    <ThemeProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/:slug" element={<SlugPage />} />
      </Routes>
    </ThemeProvider>
  );
}
