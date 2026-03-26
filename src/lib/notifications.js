import { LocalNotifications } from "@capacitor/local-notifications";
import { Haptics, ImpactStyle } from "@capacitor/haptics";

export async function requestNotifPermission() {
  try {
    const { display } = await LocalNotifications.requestPermissions();
    return display; // 'granted' | 'denied'
  } catch (e) {
    console.error("[Notif] Permission error:", e);
    return "denied";
  }
}

export async function getNotifStatus() {
  try {
    const { display } = await LocalNotifications.checkPermissions();
    return display;
  } catch {
    return "denied";
  }
}

export async function scheduleNotifications(reminders) {
  try {
    const pending = await LocalNotifications.getPending();
    if (pending.notifications.length > 0) {
      await LocalNotifications.cancel({ notifications: pending.notifications });
    }

    const notifications = [];
    const now = Date.now();
    let idCounter = 1;

    for (const r of reminders) {
      if (r.done || !r.deadline) continue;
      const deadline = new Date(r.deadline).getTime();

      const targetDate = new Date(deadline);

      targetDate.setDate(targetDate.getDate() - 1);
      targetDate.setHours(19, 15, 0, 0);

      const oneDayBefore = targetDate.getTime();
      if (oneDayBefore > now) {
        notifications.push({
          id: idCounter++,
          title: "⏰ Deadline besok!",
          body: `"${r.judul}" dikumpul besok!`,
          schedule: { at: new Date(oneDayBefore) },
          sound: "default",
          extra: { reminderId: r.id, url: "/reminder" },
          channelId: "nebula-reminders",
        });
      }
    }

    if (notifications.length > 0) {
      await LocalNotifications.schedule({ notifications });
      console.log("[Notif] Scheduled", notifications.length, "notifications");
    }
  } catch (e) {
    console.error("[Notif] Schedule error:", e);
  }
}

export async function setupNotifChannel() {
  try {
    await LocalNotifications.createChannel({
      id: "nebula-reminders",
      name: "Nebula Reminders",
      description: "Notifikasi deadline PR dan tugas",
      importance: 5, // IMPORTANCE_HIGH
      visibility: 1,
      sound: "default",
      vibration: true,
      lights: true,
      lightColor: "#3b82f6",
    });
  } catch (e) {
    console.error("[Notif] Channel error:", e);
  }
}

// Haptic feedback
export async function hapticLight() {
  try {
    await Haptics.impact({ style: ImpactStyle.Light });
  } catch {}
}
export async function hapticMedium() {
  try {
    await Haptics.impact({ style: ImpactStyle.Medium });
  } catch {}
}
export async function hapticSuccess() {
  try {
    await Haptics.notification({ type: "SUCCESS" });
  } catch {}
}
