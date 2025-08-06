import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "../src/assets/styles/index.css";
import "../src/assets/styles/fonts.scss"
import "../src/assets/styles/customs.css";
import { AppProvider } from "./providers/AppProvider";


ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </React.StrictMode>
);