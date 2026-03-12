import { Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import Home from "./Pages/Home";
import SlugPage from "./Pages/SlugPage";
import SlugChooser from "./Pages/SlugChooser";
import NotFound from "./Pages/NotFound";
import Admin from "./Pages/Admin";

export default function App() {
  return (
    <ThemeProvider>
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
