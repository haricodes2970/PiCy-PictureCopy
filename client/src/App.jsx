import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import SlugPage from "./pages/SlugPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/:slug" element={<SlugPage />} />
    </Routes>
  );
}