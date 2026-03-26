import { Preferences } from "@capacitor/preferences";

// ── Helpers ──────────────────────────────────────────────────
async function get(key) {
  try {
    const { value } = await Preferences.get({ key });
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

async function set(key, value) {
  try {
    await Preferences.set({ key, value: JSON.stringify(value) });
  } catch (e) {
    console.error("store.set error:", e);
  }
}

async function remove(key) {
  try {
    await Preferences.remove({ key });
  } catch {}
}

// ── Keys ──────────────────────────────────────────────────────
const K = {
  MATERI: "nebula_materi",
  CHAT: "nebula_chat_",
  REMINDERS: "nebula_reminders",
  SETTINGS: "nebula_settings",
};

// ── Materi ────────────────────────────────────────────────────
export async function getMateriList() {
  return (await get(K.MATERI)) || [];
}
export async function getMateriById(id) {
  return (await getMateriList()).find((m) => m.id === id) || null;
}
export async function saveMateri(m) {
  const list = await getMateriList();
  const now = new Date().toISOString();
  const idx = list.findIndex((x) => x.id === m.id);
  if (idx >= 0) list[idx] = { ...m, updatedAt: now };
  else
    list.unshift({
      ...m,
      id: m.id || Date.now().toString(),
      createdAt: now,
      updatedAt: now,
    });
  await set(K.MATERI, list);
  return list;
}
export async function deleteMateri(id) {
  const list = (await getMateriList()).filter((m) => m.id !== id);
  await set(K.MATERI, list);
  return list;
}

// ── Chat ──────────────────────────────────────────────────────
export async function getChatHistory(id = "general") {
  return (await get(K.CHAT + id)) || [];
}
export async function saveChatHistory(id, h) {
  await set(K.CHAT + id, h.slice(-100));
}
export async function clearChatHistory(id) {
  await remove(K.CHAT + id);
}

// ── Reminders ─────────────────────────────────────────────────
export async function getReminders() {
  return (await get(K.REMINDERS)) || [];
}
export async function saveReminder(r) {
  const list = await getReminders();
  const idx = list.findIndex((x) => x.id === r.id);
  if (idx >= 0) list[idx] = r;
  else
    list.unshift({
      ...r,
      id: r.id || Date.now().toString(),
      createdAt: new Date().toISOString(),
    });
  await set(K.REMINDERS, list);
  return list;
}
export async function deleteReminder(id) {
  const list = (await getReminders()).filter((r) => r.id !== id);
  await set(K.REMINDERS, list);
  return list;
}
export async function toggleReminderDone(id) {
  const list = (await getReminders()).map((r) =>
    r.id === id ? { ...r, done: !r.done } : r,
  );
  await set(K.REMINDERS, list);
  return list;
}

// ── Settings ──────────────────────────────────────────────────
export const DEFAULT_SETTINGS = {
  apiKey: "",
  userInterests: "teknologi dan programming",
  pomodoroWork: 25,
  pomodoroBreak: 5,
  model: "",
};
export async function getSettings() {
  return { ...DEFAULT_SETTINGS, ...((await get(K.SETTINGS)) || {}) };
}
export async function saveSettings(s) {
  const current = await getSettings();
  const merged = { ...current, ...s };
  await set(K.SETTINGS, merged);

  if (s.apiKey !== undefined)
    await Preferences.set({ key: "nebula_api_key", value: s.apiKey });
  if (s.model !== undefined)
    await Preferences.set({ key: "nebula_model", value: s.model });
  return merged;
}
