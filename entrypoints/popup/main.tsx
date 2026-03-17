import React from "react";

import ReactDOM from "react-dom/client";

import App from "./App.tsx";
import "./style.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Popup root element not found.");
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
