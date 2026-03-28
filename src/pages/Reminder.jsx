import { useState, useEffect } from "react";
import {
  getReminders,
  saveReminder,
  deleteReminder,
  toggleReminderDone,
} from "../lib/store";
import {
  requestNotifPermission,
  scheduleNotifications,
  getNotifStatus,
  hapticMedium,
  hapticSuccess,
  hapticError,
} from "../lib/notifications";
import { useToast, ConfirmModal } from "../components/UI";

export default function Reminder() {
  const [reminders, setReminders] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    judul: "",
    catatan: "",
    deadline: "",
    prioritas: "normal",
  });
  const [filter, setFilter] = useState("aktif");
  const [notifStatus, setNotifStatus] = useState("default");
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const toast = useToast();

  useEffect(() => {
    async function load() {
      const [r, status] = await Promise.all([getReminders(), getNotifStatus()]);
      setReminders(r);
      setNotifStatus(status);
      scheduleNotifications(r);
      setLoading(false);
    }
    load();
  }, []);

  async function handleEnableNotif() {
    const result = await requestNotifPermission();
    setNotifStatus(result);
    if (result === "granted") {
      await scheduleNotifications(reminders);
      await hapticSuccess();
    }
  }

  async function updateReminders(newList) {
    setReminders(newList);
    await scheduleNotifications(newList);
  }

  async function handleSave() {
    if (!form.judul.trim()) {
      await hapticError()
      toast.error("Nama tugas tidak boleh kosong!");
      return;
    }
    const updated = await saveReminder({
      ...form,
      id: Date.now().toString(),
      done: false,
    });
    await updateReminders(updated);
    await hapticSuccess();
    setForm({ judul: "", catatan: "", deadline: "", prioritas: "normal" });
    setShowAdd(false);
    toast.success("Reminder berhasil ditambahkan!");
  }

  async function handleToggle(id) {
    const { list: updated, done } = await toggleReminderDone(id);
    await updateReminders(updated);
    await hapticMedium();
    toast.info(`Reminder dipindahkan ke tab ${done ? "Selesai" : "Aktif"}.`);
  }

  async function handleDelete(id) {
    setConfirmDelete({
      title: "Hapus reminder?",
      message: "Aksi ini tidak bisa dibatalkan.",
      onConfirm: async () => {
        updateReminders(await deleteReminder(id));
        toast.success("Reminder berhasil dihapus!");
      },
      variant: "danger",
    });
  }

  const now = new Date();
  const filtered = reminders.filter((r) =>
    filter === "semua" ? true : filter === "selesai" ? r.done : !r.done,
  );
  const sorted = [...filtered].sort((a, b) => {
    if (!a.deadline) return 1;
    if (!b.deadline) return -1;
    return new Date(a.deadline) - new Date(b.deadline);
  });
  const activeCount = reminders.filter((r) => !r.done).length;
  const overdueCount = reminders.filter(
    (r) => !r.done && r.deadline && new Date(r.deadline) < now,
  ).length;

  const notifInfo = {
    default: {
      label: "🔔 Aktifkan Notifikasi",
      color: "var(--color-neon-2)",
      bg: "rgba(59,130,246,0.07)",
      border: "rgba(59,130,246,0.3)",
      hint: "tap untuk aktifkan",
      disabled: false,
    },
    granted: {
      label: "✅ Notifikasi Aktif",
      color: "var(--color-success)",
      bg: "rgba(52,211,153,0.07)",
      border: "rgba(52,211,153,0.3)",
      hint: "1 Hari sebelumnya jam 19:15",
      disabled: true,
    },
    denied: {
      label: "🚫 Notifikasi Diblokir",
      color: "var(--color-danger)",
      bg: "rgba(248,113,113,0.07)",
      border: "rgba(248,113,113,0.3)",
      hint: "izinkan di pengaturan app",
      disabled: true,
    },
    unsupported: {
      label: "❌ Tidak Didukung",
      color: "var(--color-text-3)",
      bg: "transparent",
      border: "var(--color-border)",
      hint: "",
      disabled: true,
    },
  }[notifStatus] || {
    label: "🔔 Aktifkan Notifikasi",
    color: "var(--color-neon-2)",
    bg: "rgba(59,130,246,0.07)",
    border: "rgba(59,130,246,0.3)",
    hint: "tap untuk aktifkan",
    disabled: false,
  };

  const inputS = {
    width: "100%",
    background: "var(--color-surface-2)",
    border: "1px solid var(--color-border)",
    borderRadius: 10,
    padding: "11px 13px",
    fontSize: 14,
    color: "var(--color-text)",
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "var(--font-body)",
  };

  if (loading)
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "60vh",
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            border: "3px solid var(--color-surface-3)",
            borderTopColor: "var(--color-neon)",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        />
      </div>
    );

  return (
    <div style={{ padding: "20px 16px", maxWidth: 600, margin: "0 auto" }}>
      <ConfirmModal
        config={confirmDelete}
        onClose={() => setConfirmDelete(null)}
      />

      <div style={{ marginBottom: 14 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: 22,
                fontWeight: 800,
                color: "var(--color-text)",
              }}
            >
              Reminder PR
            </h1>
            <p
              style={{
                fontSize: 12,
                marginTop: 2,
                color: overdueCount > 0 ? "var(--color-danger)" : "#8090a8",
              }}
            >
              {activeCount} aktif
              {overdueCount > 0 ? ` · ⚠️ ${overdueCount} terlambat` : ""}
            </p>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="btn-primary"
            style={{
              padding: "8px 18px",
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            + Tambah
          </button>
        </div>

        <button
          onClick={handleEnableNotif}
          disabled={notifInfo.disabled}
          style={{
            marginTop: 10,
            width: "100%",
            padding: "9px 13px",
            borderRadius: 10,
            fontSize: 12,
            fontWeight: 500,
            cursor: notifInfo.disabled ? "default" : "pointer",
            border: `1px solid ${notifInfo.border}`,
            background: notifInfo.bg,
            color: notifInfo.color,
            textAlign: "left",
          }}
        >
          {notifInfo.label}
          {notifInfo.hint && (
            <span style={{ color: "#8090a8", fontSize: 11, marginLeft: 6 }}>
              — {notifInfo.hint}
            </span>
          )}
        </button>
      </div>

      {overdueCount > 0 && (
        <div
          className="glass"
          style={{
            borderRadius: 12,
            padding: "11px 14px",
            marginBottom: 12,
            border: "1px solid rgba(248,113,113,0.3)",
            background: "rgba(248,113,113,0.06)",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <span style={{ fontSize: 18 }}>⚠️</span>
          <p style={{ fontSize: 13, color: "var(--color-danger)" }}>
            {overdueCount} tugas sudah lewat deadline!
          </p>
        </div>
      )}

      <div
        style={{
          display: "flex",
          gap: 3,
          marginBottom: 14,
          background: "var(--color-surface)",
          borderRadius: 10,
          padding: 4,
        }}
      >
        {[
          ["aktif", "Aktif"],
          ["selesai", "Selesai"],
          ["semua", "Semua"],
        ].map(([k, l]) => (
          <button
            key={k}
            onClick={() => setFilter(k)}
            className={filter === k ? "btn-neon" : ""}
            style={{
              flex: 1,
              padding: "7px 4px",
              borderRadius: 8,
              fontSize: 12,
              fontWeight: filter === k ? 600 : 400,
              cursor: "pointer",
              border: "none",
              background: filter === k ? undefined : "transparent",
              color: filter === k ? undefined : "var(--color-text-3)",
            }}
          >
            {l}
          </button>
        ))}
      </div>

      {sorted.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px 0" }}>
          <p style={{ fontSize: 40, marginBottom: 8 }}>
            {filter === "selesai" ? "🎉" : "✅"}
          </p>
          <p style={{ color: "var(--color-text-2)", fontWeight: 500 }}>
            {filter === "aktif" ? "Semua beres!" : "Kosong"}
          </p>
        </div>
      ) : (
        sorted.map((r) => {
          const dl = r.deadline ? new Date(r.deadline) : null;
          const overdue = !r.done && dl && dl < now;
          const today = dl && dl.toDateString() === now.toDateString();
          const pColor = {
            tinggi: "var(--color-danger)",
            normal: "var(--color-neon)",
            rendah: "var(--color-text-3)",
          }[r.prioritas];
          return (
            <div
              key={r.id}
              className="glass"
              style={{
                borderRadius: 12,
                padding: "12px 14px",
                marginBottom: 8,
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
                opacity: r.done ? 0.5 : 1,
                border: `1px solid ${overdue ? "rgba(248,113,113,0.3)" : "var(--color-border)"}`,
                boxShadow: overdue ? "0 0 12px rgba(248,113,113,0.08)" : "none",
              }}
            >
              <button
                onClick={() => handleToggle(r.id)}
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  marginTop: 1,
                  flexShrink: 0,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 11,
                  fontWeight: 700,
                  transition: "all 0.2s",
                  border: `2px solid ${r.done ? "var(--color-success)" : "var(--color-border-2)"}`,
                  background: r.done ? "var(--color-success)" : "transparent",
                  color: "white",
                  boxShadow: r.done ? "0 0 8px rgba(52,211,153,0.4)" : "none",
                }}
              >
                {r.done && "✓"}
              </button>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    marginBottom: 2,
                  }}
                >
                  <div
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      background: pColor,
                      flexShrink: 0,
                      boxShadow: `0 0 5px ${pColor}`,
                    }}
                  />
                  <p
                    style={{
                      fontSize: 14,
                      fontWeight: 500,
                      color: "var(--color-text)",
                      textDecoration: r.done ? "line-through" : "none",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {r.judul}
                  </p>
                </div>
                {r.catatan && (
                  <p
                    style={{
                      fontSize: 12,
                      color: "#8090a8",
                      marginBottom: 2,
                      paddingLeft: 13,
                    }}
                  >
                    {r.catatan}
                  </p>
                )}
                {dl && (
                  <p
                    style={{
                      fontSize: 11,
                      paddingLeft: 13,
                      color: overdue
                        ? "var(--color-danger)"
                        : today
                          ? "var(--color-warning)"
                          : "#8090a8",
                    }}
                  >
                    {overdue
                      ? "⚠️ Terlambat · "
                      : today
                        ? "⏰ Hari ini · "
                        : "📅 "}
                    {dl.toLocaleDateString("id-ID", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                )}
              </div>
              <button
                onClick={() => handleDelete(r.id)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--color-text-3)",
                  fontSize: 14,
                  padding: 4,
                  flexShrink: 0,
                }}
              >
                ✕
              </button>
            </div>
          );
        })
      )}

      {showAdd && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,0.75)",
              backdropFilter: "blur(4px)",
            }}
            onClick={() => setShowAdd(false)}
          />
          <div
            className="glass animate-fade-up"
            style={{
              position: "relative",
              width: "100%",
              maxWidth: 500,
              borderRadius: 20,
              border: "1px solid var(--color-border-2)",
            }}
          >
            <div
              style={{
                padding: "14px 16px",
                borderBottom: "1px solid var(--color-border)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h3
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: "var(--color-text)",
                }}
              >
                Tambah Reminder
              </h3>
              <button
                onClick={() => setShowAdd(false)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--color-text-3)",
                  fontSize: 20,
                }}
              >
                ×
              </button>
            </div>
            <div
              style={{
                padding: 16,
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              <input
                value={form.judul}
                onChange={(e) =>
                  setForm((f) => ({ ...f, judul: e.target.value }))
                }
                placeholder="Nama tugas / PR"
                style={inputS}
                onFocus={(e) =>
                  (e.target.style.borderColor = "rgba(96,165,250,0.5)")
                }
                onBlur={(e) =>
                  (e.target.style.borderColor = "var(--color-border)")
                }
              />
              <input
                value={form.catatan}
                onChange={(e) =>
                  setForm((f) => ({ ...f, catatan: e.target.value }))
                }
                placeholder="Catatan (opsional)"
                style={inputS}
                onFocus={(e) =>
                  (e.target.style.borderColor = "rgba(96,165,250,0.5)")
                }
                onBlur={(e) =>
                  (e.target.style.borderColor = "var(--color-border)")
                }
              />
              <div>
                <p style={{ fontSize: 12, color: "#8090a8", marginBottom: 5 }}>
                  Deadline
                </p>
                <input
                  type="datetime-local"
                  value={form.deadline}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, deadline: e.target.value }))
                  }
                  style={inputS}
                  onFocus={(e) =>
                    (e.target.style.borderColor = "rgba(96,165,250,0.5)")
                  }
                  onBlur={(e) =>
                    (e.target.style.borderColor = "var(--color-border)")
                  }
                />
              </div>
              <div>
                <p style={{ fontSize: 12, color: "#8090a8", marginBottom: 5 }}>
                  Prioritas
                </p>
                <div style={{ display: "flex", gap: 6 }}>
                  {[
                    ["rendah", "🟢"],
                    ["normal", "🟡"],
                    ["tinggi", "🔴"],
                  ].map(([p, e]) => (
                    <button
                      key={p}
                      onClick={() => setForm((f) => ({ ...f, prioritas: p }))}
                      className={form.prioritas === p ? "btn-neon" : ""}
                      style={{
                        flex: 1,
                        padding: "8px 4px",
                        borderRadius: 9,
                        fontSize: 12,
                        cursor: "pointer",
                        textTransform: "capitalize",
                        border:
                          form.prioritas === p
                            ? undefined
                            : "1px solid var(--color-border)",
                        background:
                          form.prioritas === p ? undefined : "transparent",
                        color:
                          form.prioritas === p
                            ? undefined
                            : "var(--color-text-3)",
                      }}
                    >
                      {e} {p}
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={handleSave}
                className="btn-primary"
                style={{
                  width: "100%",
                  padding: 13,
                  borderRadius: 11,
                  fontSize: 14,
                  fontWeight: 700,
                }}
              >
                Simpan Reminder
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
