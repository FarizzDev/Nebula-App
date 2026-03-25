// Register SW dan schedule notifikasi dari reminders
export async function registerSW() {
  if (!('serviceWorker' in navigator)) return null
  try {
    const reg = await navigator.serviceWorker.register('/sw.js')
    console.log('[Notif] SW registered')
    return reg
  } catch (e) {
    console.error('[Notif] SW failed:', e)
    return null
  }
}

export async function requestNotifPermission() {
  if (!('Notification' in window)) return 'unsupported'
  if (Notification.permission === 'granted') return 'granted'
  const result = await Notification.requestPermission()
  return result
}

export async function scheduleNotifications(reminders) {
  if (Notification.permission !== 'granted') return
  if (!('serviceWorker' in navigator)) return

  try {
    const reg = await navigator.serviceWorker.ready
    reg.active?.postMessage({
      type: 'SCHEDULE_NOTIFICATIONS',
      reminders,
    })
  } catch (e) {
    console.error('[Notif] Schedule failed:', e)
  }
}

export function getNotifStatus() {
  if (!('Notification' in window)) return 'unsupported'
  return Notification.permission // 'default' | 'granted' | 'denied'
}
