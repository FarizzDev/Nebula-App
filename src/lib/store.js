const K = {
  MATERI:    'nebula_materi',
  CHAT:      'nebula_chat_',
  REMINDERS: 'nebula_reminders',
  SETTINGS:  'nebula_settings',
}

const get = k => { try { return JSON.parse(localStorage.getItem(k)) } catch { return null } }
const set = (k,v) => { try { localStorage.setItem(k, JSON.stringify(v)) } catch(e) { console.error(e) } }

// Materi
export const getMateriList  = () => get(K.MATERI) || []
export const getMateriById  = id => getMateriList().find(m => m.id === id) || null
export const deleteMateri   = id => { const l=getMateriList().filter(m=>m.id!==id); set(K.MATERI,l); return l }
export function saveMateri(m) {
  const list=getMateriList(), now=new Date().toISOString(), idx=list.findIndex(x=>x.id===m.id)
  if (idx>=0) list[idx]={...m,updatedAt:now}
  else list.unshift({...m,id:m.id||Date.now().toString(),createdAt:now,updatedAt:now})
  set(K.MATERI,list); return list
}

// Chat
export const getChatHistory   = (id='general') => get(K.CHAT+id) || []
export const saveChatHistory  = (id,h) => set(K.CHAT+id, h.slice(-100))
export const clearChatHistory = id => localStorage.removeItem(K.CHAT+id)

// Reminders
export const getReminders = () => get(K.REMINDERS) || []
export const deleteReminder = id => { const l=getReminders().filter(r=>r.id!==id); set(K.REMINDERS,l); return l }
export const toggleReminderDone = id => { const l=getReminders().map(r=>r.id===id?{...r,done:!r.done}:r); set(K.REMINDERS,l); return l }
export function saveReminder(r) {
  const list=getReminders(), idx=list.findIndex(x=>x.id===r.id)
  if (idx>=0) list[idx]=r
  else list.unshift({...r,id:r.id||Date.now().toString(),createdAt:new Date().toISOString()})
  set(K.REMINDERS,list); return list
}

// Settings
export const DEFAULT_SETTINGS = { apiKey:'', userInterests:'teknologi dan programming', pomodoroWork:25, pomodoroBreak:5, model:'' }
export const getSettings = () => ({ ...DEFAULT_SETTINGS, ...(get(K.SETTINGS)||{}) })
export function saveSettings(s) {
  const merged={...getSettings(),...s}
  set(K.SETTINGS,merged)
  if (s.apiKey!==undefined) localStorage.setItem('nebula_api_key', s.apiKey)
  if (s.model!==undefined)  localStorage.setItem('nebula_model', s.model)
  return merged
}
