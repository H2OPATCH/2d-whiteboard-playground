import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Add global CSS variables for the theme
document.documentElement.style.setProperty('--primary', '#2B2D42');
document.documentElement.style.setProperty('--secondary', '#8D99AE');
document.documentElement.style.setProperty('--background', '#FFFFFF');
document.documentElement.style.setProperty('--accent', '#EF233C');
document.documentElement.style.setProperty('--text', '#2B2D42');
document.documentElement.style.setProperty('--canvas', '#F8F9FA');

createRoot(document.getElementById("root")!).render(<App />);
