import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { CopilotKit } from "@copilotkit/react-core";
createRoot(document.getElementById("root")).render(
  <CopilotKit runtimeUrl="https://copilotkit-moviebot.onrender.com/copilotkit">
    <App />
  </CopilotKit>
);
