import { useState, useEffect } from "react";
import { getSettings, saveSettings } from "../lib/store";
import { AVAILABLE_MODELS, DEFAULT_MODEL } from "../lib/gemini";
import { hapticSuccess } from "../lib/notifications";

export default function Settings() {
  const [settings, setSettings] = useState({});
  const [saved, setSaved] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSettings().then((s) => {
      setSettings(s);
      setLoading(false);
    });
  }, []);

  async function handleSave() {
    await saveSettings(settings);
    await hapticSuccess();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

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
    transition: "border-color 0.2s",
  };
  const section = { borderRadius: 16, padding: 16, marginBottom: 12 };

  const VERSION = "0.5.0";

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
    <div style={{ padding: "20px 16px", maxWidth: 500, margin: "0 auto" }}>
      <h1
        style={{
          fontSize: 22,
          fontWeight: 800,
          color: "var(--color-text)",
          marginBottom: 3,
        }}
      >
        Pengaturan
      </h1>
      <p style={{ fontSize: 13, color: "#8090a8", marginBottom: 20 }}>
        Konfigurasi Nebula
      </p>

      <div className="glass" style={section}>
        <h2
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: "var(--color-text)",
            marginBottom: 4,
          }}
        >
          Gemini API Key
        </h2>
        <p style={{ fontSize: 12, color: "#8090a8", marginBottom: 10 }}>
          Gratis di{" "}
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "var(--color-neon-2)" }}
          >
            aistudio.google.com
          </a>
        </p>
        <div style={{ position: "relative" }}>
          <input
            type={showKey ? "text" : "password"}
            value={settings.apiKey || ""}
            onChange={(e) =>
              setSettings((s) => ({ ...s, apiKey: e.target.value }))
            }
            placeholder="AIza..."
            style={{
              ...inputS,
              paddingRight: 40,
              fontFamily: "var(--font-mono)",
            }}
            onFocus={(e) =>
              (e.target.style.borderColor = "rgba(96,165,250,0.5)")
            }
            onBlur={(e) => (e.target.style.borderColor = "var(--color-border)")}
          />
          <button
            onClick={() => setShowKey((s) => !s)}
            style={{
              position: "absolute",
              right: 10,
              top: "50%",
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 16,
            }}
          >
            {showKey ? "🙈" : "👁️"}
          </button>
        </div>
      </div>

      <div className="glass" style={section}>
        <h2
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: "var(--color-text)",
            marginBottom: 4,
          }}
        >
          Model AI
        </h2>
        <p style={{ fontSize: 12, color: "#8090a8", marginBottom: 10 }}>
          Pilih model Gemini
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          {AVAILABLE_MODELS.map((m) => (
            <button
              key={m.id}
              onClick={() => setSettings((s) => ({ ...s, model: m.id }))}
              style={{
                textAlign: "left",
                padding: "10px 13px",
                borderRadius: 10,
                cursor: "pointer",
                transition: "all 0.15s",
                border: `1px solid ${(settings.model || DEFAULT_MODEL) === m.id ? "rgba(96,165,250,0.5)" : "var(--color-border)"}`,
                background:
                  (settings.model || DEFAULT_MODEL) === m.id
                    ? "rgba(59,130,246,0.1)"
                    : "var(--color-surface-2)",
                color: "var(--color-text)",
              }}
            >
              <p style={{ fontSize: 13, fontWeight: 600 }}>{m.label}</p>
              <p
                style={{
                  fontSize: 11,
                  color: "#8090a8",
                  marginTop: 2,
                  fontFamily: "var(--font-mono)",
                }}
              >
                {m.id}
              </p>
            </button>
          ))}
        </div>
      </div>

      <div className="glass" style={section}>
        <h2
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: "var(--color-text)",
            marginBottom: 4,
          }}
        >
          Minat Kamu
        </h2>
        <p style={{ fontSize: 12, color: "#8090a8", marginBottom: 10 }}>
          AI pakai ini buat analogi yang relevan
        </p>
        <input
          value={settings.userInterests || ""}
          onChange={(e) =>
            setSettings((s) => ({ ...s, userInterests: e.target.value }))
          }
          placeholder="teknologi, programming, gaming..."
          style={inputS}
          onFocus={(e) => (e.target.style.borderColor = "rgba(96,165,250,0.5)")}
          onBlur={(e) => (e.target.style.borderColor = "var(--color-border)")}
        />
      </div>

      <div className="glass" style={section}>
        <h2
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: "var(--color-text)",
            marginBottom: 10,
          }}
        >
          Pomodoro Timer
        </h2>
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}
        >
          {[
            ["pomodoroWork", "🧠 Belajar (menit)", 5, 90],
            ["pomodoroBreak", "☕ Istirahat (menit)", 1, 30],
          ].map(([k, l, min, max]) => (
            <div key={k}>
              <p style={{ fontSize: 12, color: "#8090a8", marginBottom: 5 }}>
                {l}
              </p>
              <input
                type="number"
                min={min}
                max={max}
                value={settings[k] || 25}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, [k]: parseInt(e.target.value) }))
                }
                style={{
                  ...inputS,
                  textAlign: "center",
                  fontFamily: "var(--font-mono)",
                }}
                onFocus={(e) =>
                  (e.target.style.borderColor = "rgba(96,165,250,0.5)")
                }
                onBlur={(e) =>
                  (e.target.style.borderColor = "var(--color-border)")
                }
              />
            </div>
          ))}
        </div>
      </div>

      <div
        className="glass"
        style={{ ...section, border: "1px solid rgba(59,130,246,0.18)" }}
      >
        <h2
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: "var(--color-text)",
            marginBottom: 10,
          }}
        >
          Tentang Nebula
        </h2>
        {[
          "⚡ Vite + React + Capacitor",
          "🤖 Gemini API + Google Search",
          "💾 Capacitor Preferences",
          "📱 Native Android App",
        ].map((t) => (
          <p
            key={t}
            style={{
              fontSize: 12,
              color: "#8090a8",
              fontFamily: "var(--font-mono)",
              marginBottom: 4,
            }}
          >
            {t}
          </p>
        ))}
        <p
          style={{
            fontSize: 12,
            color: "var(--color-text-2)",
            fontFamily: "var(--font-mono)",
            marginTop: 8,
          }}
        >
          {VERSION} — Built with ❤️ by{" "}
          <a
            href="https://github.com/FarizzDev"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "var(--color-neon-2)" }}
          >
            FarizzDev
          </a>
        </p>
      </div>

      <button
        onClick={handleSave}
        className="btn-primary"
        style={{
          width: "100%",
          padding: 14,
          borderRadius: 12,
          fontSize: 15,
          fontWeight: 700,
          background: saved
            ? "linear-gradient(135deg,#34d399,#059669)"
            : undefined,
          boxShadow: saved ? "0 0 24px rgba(52,211,153,0.4)" : undefined,
        }}
      >
        {saved ? "✅ Tersimpan!" : "Simpan Pengaturan"}
      </button>
    </div>
  );
}
