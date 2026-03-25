const CACHE = "nebula-v1";

self.addEventListener("install", (e) => {
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(self.clients.claim());
});

self.addEventListener("message", async (e) => {
  // Fungsi pembantu buat ngirim pesan balik ke Eruda
  const sendLogToEruda = (msg) => {
    e.source.postMessage({ type: "SW_LOG", text: msg });
  };
  if (e.data?.type === "TEST_TRIGGER") {
    const triggerTime = Date.now() + 60 * 1000;

    try {
      if (!("showTrigger" in Notification.prototype)) {
        sendLogToEruda(
          "❌ ERROR: Browser HP lu belum support Notification Triggers API (showTrigger)!",
        );
        return;
      }

      await self.registration.showNotification("🔔 Berhasil Bro!", {
        body: "Kalau ini muncul pas app ditutup, berarti Opsi 2 work 100%!",
        icon: "/icon.svg",
        vibrate: [200, 100, 200],
        showTrigger: new TimestampTrigger(triggerTime),
      });

      sendLogToEruda(
        "✅ MANTAP: Jadwal notif 1 menit ke depan berhasil diserahkan ke OS!",
      );
    } catch (err) {
      sendLogToEruda("❌ ERROR eksekusi SW: " + err.message);
    }
  }

  if (e.data?.type === "TEST_INSTANT") {
    try {
      await self.registration.showNotification("⚡ Notif Instan Masuk!", {
        body: "Kalau ini muncul, berarti izin notif aman. Yang busuk berarti API showTrigger-nya.",
        icon: "/icon.svg",
        vibrate: [100, 50, 100],
      });
      sendLogToEruda("✅ MANTAP: Notif instan berhasil dipanggil!");
    } catch (err) {
      sendLogToEruda("❌ ERROR Notif Instan: " + err.message);
    }
  }
});

self.addEventListener("push", (e) => {
  // Tangkap pesan dari backend Termux lu
  const pesan = e.data ? e.data.text() : "Notif dari luar angkasa";

  e.waitUntil(
    self.registration.showNotification("🔥 Tembus Bro!", {
      body: pesan,
      icon: "/icon.svg",
      vibrate: [500, 200, 500],
    }),
  );
});

//
// // Terima pesan dari app untuk schedule notifikasi
// self.addEventListener('message', e => {
//   if (e.data?.type === 'SCHEDULE_NOTIFICATIONS') {
//     scheduleReminders(e.data.reminders)
//   }
// })
//
// // Simpan timer IDs
// const timers = []
//
// function scheduleReminders(reminders) {
//   // Clear semua timer lama
//   timers.forEach(id => clearTimeout(id))
//   timers.length = 0
//
//   const now = Date.now()
//   reminders.forEach(r => {
//     if (r.done || !r.deadline) return
//     const deadline = new Date(r.deadline).getTime()
//     const diff = deadline - now
//
//     // Notif H-1 hari
//     const oneDayBefore = diff - 24 * 60 * 60 * 1000
//     if (oneDayBefore > 0) {
//       timers.push(setTimeout(() => {
//         self.registration.showNotification('⏰ Deadline besok!', {
//           body: `"${r.judul}" deadline besok!`,
//           icon: '/icon.svg',
//           badge: '/icon.svg',
//           tag: 'reminder-' + r.id + '-1d',
//           data: { url: '/reminder' },
//           vibrate: [200, 100, 200],
//         })
//       }, oneDayBefore))
//     }
//
//     // Notif H-1 jam
//     const oneHourBefore = diff - 60 * 60 * 1000
//     if (oneHourBefore > 0) {
//       timers.push(setTimeout(() => {
//         self.registration.showNotification('🚨 Deadline 1 jam lagi!', {
//           body: `"${r.judul}" deadline dalam 1 jam!`,
//           icon: '/icon.svg',
//           badge: '/icon.svg',
//           tag: 'reminder-' + r.id + '-1h',
//           data: { url: '/reminder' },
//           vibrate: [300, 100, 300, 100, 300],
//         })
//       }, oneHourBefore))
//     }
//
//     // Notif tepat deadline
//     if (diff > 0) {
//       timers.push(setTimeout(() => {
//         self.registration.showNotification('💀 Deadline sekarang!', {
//           body: `"${r.judul}" sudah deadline!`,
//           icon: '/icon.svg',
//           badge: '/icon.svg',
//           tag: 'reminder-' + r.id + '-now',
//           data: { url: '/reminder' },
//           vibrate: [500, 100, 500],
//         })
//       }, diff))
//     }
//   })
//
//   console.log('[SW] Scheduled', timers.length, 'notifications')
// }
//
// // Klik notifikasi → buka app
// self.addEventListener('notificationclick', e => {
//   e.notification.close()
//   const url = e.notification.data?.url || '/'
//   e.waitUntil(
//     self.clients.matchAll({ type: 'window' }).then(clients => {
//       for (const client of clients) {
//         if (client.url.includes(self.location.origin)) {
//           client.focus()
//           client.navigate(url)
//           return
//         }
//       }
//       return self.clients.openWindow(url)
//     })
//   )
// })
