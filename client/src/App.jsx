import { Routes, Route } from "react-router-dom";
import Home from "./Pages/Home";
import SlugPage from "./Pages/SlugPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/:slug" element={<SlugPage />} />
    </Routes>
  );
}