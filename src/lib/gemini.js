// Model default — bisa diubah lewat Settings
const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta";
export const AVAILABLE_MODELS = [
  { id: "gemini-2.5-flash", label: "Gemini 2.5 Flash (Recommended)" },
  { id: "gemini-2.5-pro", label: "Gemini 2.5 Pro (Smarter, slower)" },
  { id: "gemini-2.5-flash-lite", label: "Gemini 2.5 Flash Lite (Fastest)" },
];
export const DEFAULT_MODEL = AVAILABLE_MODELS[0].id;

function getApiKey() {
  return localStorage.getItem("nebula_api_key") || "";
}
function getModel() {
  return localStorage.getItem("nebula_model") || DEFAULT_MODEL;
}

export async function sendToGemini({
  messages,
  systemInstruction,
  useSearch = false,
  onStream,
}) {
  const apiKey = getApiKey();
  if (!apiKey)
    throw new Error("API key belum diset. Pergi ke Pengaturan dulu!");

  const body = {
    system_instruction: systemInstruction
      ? { parts: [{ text: systemInstruction }] }
      : undefined,
    contents: messages,
    tools: useSearch ? [{ google_search: {} }] : undefined,
    generationConfig: { temperature: 0.7, maxOutputTokens: 4096 },
  };

  const model = getModel();
  const url = `${GEMINI_API_BASE}/models/${model}:${onStream ? "streamGenerateContent" : "generateContent"}?key=${apiKey}${onStream ? "&alt=sse" : ""}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Gemini error: ${res.status}`);
  }

  if (onStream) {
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let full = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      for (const line of decoder
        .decode(value)
        .split("\n")
        .filter((l) => l.startsWith("data: "))) {
        try {
          const text =
            JSON.parse(line.slice(6))?.candidates?.[0]?.content?.parts?.[0]
              ?.text || "";
          if (text) {
            full += text;
            onStream(text);
          }
        } catch {}
      }
    }
    return full;
  }

  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

export function buildSystemPrompt({
  materiContext,
  userInterests = "teknologi dan programming",
  mode = "general",
} = {}) {
  const base = `Kamu adalah Nebula, asisten belajar AI yang cerdas dan ramah dalam Bahasa Indonesia. Suka pakai analogi dari ${userInterests}. Jelaskan dengan jelas, menarik, dan mudah dipahami.`;
  const map = {
    general: base,
    explain: `${base}\n\nJelaskan materi dengan analogi segar, contoh nyata, dan struktur jelas. Poin penting di akhir.`,
    quiz: `${base}\n\nBuat soal yang menguji pemahaman bukan hafalan. Kembalikan HANYA JSON array valid, tanpa teks lain, tanpa markdown code block, tanpa penjelasan. Format: [{"id":"1","pertanyaan":"...","tipe":"pilihan_ganda","pilihan":["A. ...","B. ...","C. ...","D. ..."],"jawaban_benar":"A. ...","penjelasan":"..."}]`,
    discuss: `${base}\n\nAnalisis jawaban pengguna secara detail dan edukatif.`,
    fetch: `${base}\n\nCari dan rangkum materi dalam Markdown rapi dengan heading, konsep utama, penjelasan, dan contoh.`,
  };
  const prompt = map[mode] || base;
  return materiContext
    ? `${prompt}\n\n--- KONTEKS MATERI ---\n${materiContext}\n--- END ---`
    : prompt;
}

export async function fetchMateriFromTopic(topic, onStream) {
  return sendToGemini({
    messages: [
      {
        role: "user",
        parts: [
          {
            text: `Carikan dan buatkan materi belajar lengkap tentang: "${topic}"\n\nFormat Markdown dengan heading, konsep utama, penjelasan detail, contoh praktis, dan ringkasan.`,
          },
        ],
      },
    ],
    systemInstruction: buildSystemPrompt({ mode: "fetch" }),
    useSearch: true,
    onStream,
  });
}

export async function generateSoal(materiContent, jumlah = 5) {
  const result = await sendToGemini({
    messages: [
      {
        role: "user",
        parts: [
          {
            text: `Buatkan tepat ${jumlah} soal pilihan ganda dari materi ini.\n\nKembalikan HANYA JSON array, tanpa teks lain, tanpa markdown:\n[{"id":"1","pertanyaan":"...","tipe":"pilihan_ganda","pilihan":["A. ...","B. ...","C. ...","D. ..."],"jawaban_benar":"A. ...","penjelasan":"..."}]\n\nMateri:\n${materiContent}`,
          },
        ],
      },
    ],
    systemInstruction: buildSystemPrompt({ mode: "quiz" }),
  });
  // Coba parse langsung, lalu fallback strip markdown
  const attempts = [
    result.trim(),
    result
      .replace(/```json\s*/gi, "")
      .replace(/```\s*/g, "")
      .trim(),
    (result.match(/\[[\s\S]*\]/) || ["[]"])[0],
  ];
  for (const s of attempts) {
    try {
      const parsed = JSON.parse(s);
      if (Array.isArray(parsed)) return parsed;
    } catch {}
  }
  return [];
}

export async function diskusiJawaban({
  soal,
  jawabanUser,
  jawabanBenar,
  penjelasan,
  onStream,
}) {
  return sendToGemini({
    messages: [
      {
        role: "user",
        parts: [
          {
            text: `Soal: ${soal}\nJawaban saya: ${jawabanUser}\nJawaban benar: ${jawabanBenar}\nPenjelasan singkat: ${penjelasan}\n\nAnalisis jawaban saya secara detail dan edukatif!`,
          },
        ],
      },
    ],
    systemInstruction: buildSystemPrompt({ mode: "discuss" }),
    onStream,
  });
}

export async function chat({
  history,
  userMessage,
  materiContext,
  useSearch = false,
  onStream,
}) {
  return sendToGemini({
    messages: [...history, { role: "user", parts: [{ text: userMessage }] }],
    systemInstruction: buildSystemPrompt({ materiContext, mode: "general" }),
    useSearch,
    onStream,
  });
}
