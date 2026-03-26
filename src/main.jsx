import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { SplashScreen } from "@capacitor/splash-screen";
import { StatusBar, Style } from "@capacitor/status-bar";
import { LocalNotifications } from "@capacitor/local-notifications";
import { setupNotifChannel, scheduleNotifications } from "./lib/notifications";
import { getReminders } from "./lib/store";

async function initApp() {
  try {
    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.setBackgroundColor({ color: "#07071a" });
  } catch {}

  await setupNotifChannel();

  const reminders = await getReminders();
  await scheduleNotifications(reminders);

  await LocalNotifications.addListener(
    "localNotificationActionPerformed",
    (notification) => {
      const url = notification.notification.extra?.url;
      if (url) window.location.hash = url;
    },
  );

  createRoot(document.getElementById("root")).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );

  setTimeout(async () => {
    try {
      await SplashScreen.hide();
    } catch {}
  }, 100);
}

initApp().catch(console.error);
