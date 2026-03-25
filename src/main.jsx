import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { SplashScreen } from '@capacitor/splash-screen'
import { StatusBar, Style } from '@capacitor/status-bar'
import { App as CapApp } from '@capacitor/app'
import { LocalNotifications } from '@capacitor/local-notifications'
import { setupNotifChannel, scheduleNotifications } from './lib/notifications'
import { getReminders, migrateFromLocalStorage } from './lib/store'

async function initApp() {
  // Migrate data lama dari localStorage
  await migrateFromLocalStorage()

  // Setup status bar
  try {
    await StatusBar.setStyle({ style: Style.Dark })
    await StatusBar.setBackgroundColor({ color: '#07071a' })
  } catch {}

  // Setup notif channel (Android)
  await setupNotifChannel()

  // Schedule notifikasi dari reminders yang ada
  const reminders = await getReminders()
  await scheduleNotifications(reminders)

  // Handle notif tap → navigate
  await LocalNotifications.addListener('localNotificationActionPerformed', notification => {
    const url = notification.notification.extra?.url
    if (url) window.location.hash = url
  })

  // Hide splash screen
  try { await SplashScreen.hide() } catch {}
}

// Init dulu, baru render
initApp().catch(console.error)

createRoot(document.getElementById('root')).render(
  <StrictMode><App /></StrictMode>
)
