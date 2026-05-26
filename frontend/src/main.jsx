import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";


const savedOpacity = localStorage.getItem("glass-opacity");
if (savedOpacity) {
  document.documentElement.style.setProperty("--glass-opacity", savedOpacity);
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);


