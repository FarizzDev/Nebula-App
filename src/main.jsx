import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { registerSW, scheduleNotifications } from "./lib/notifications";
import { getReminders } from "./lib/store";

registerSW().then(async () => {
  scheduleNotifications(getReminders());
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
