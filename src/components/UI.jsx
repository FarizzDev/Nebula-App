// ============================================================
//
//  Toast:
//    import { useToast, ConfirmModal } from '../components/UI'
//    const toast = useToast()
//    toast.success('Materi berhasil disimpan!')
//    toast.error('Gagal konek ke API')
//    toast.warning('API key belum diset')
//    toast.info('Sinkronisasi selesai')
//
//  Confirm Modal:
//    const [confirm, setConfirm] = useState(null)
//    setConfirm({
//      title: 'Hapus materi?',
//      message: 'Aksi ini tidak bisa dibatalkan.',
//      onConfirm: () => deleteMateri(id),
//      variant: 'danger', // 'danger' | 'warning' | 'default'
//    })
//    <ConfirmModal config={confirm} onClose={() => setConfirm(null)} />
//
// ============================================================

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";

// ── Theme tokens ──────────────
const VARIANTS = {
  success: {
    icon: "✓",
    color: "#34d399",
    bg: "rgba(52,211,153,0.1)",
    border: "rgba(52,211,153,0.28)",
    glow: "rgba(52,211,153,0.25)",
    iconBg: "rgba(52,211,153,0.18)",
  },
  error: {
    icon: "✕",
    color: "#f87171",
    bg: "rgba(248,113,113,0.1)",
    border: "rgba(248,113,113,0.28)",
    glow: "rgba(248,113,113,0.2)",
    iconBg: "rgba(248,113,113,0.18)",
  },
  warning: {
    icon: "!",
    color: "#fbbf24",
    bg: "rgba(251,191,36,0.1)",
    border: "rgba(251,191,36,0.28)",
    glow: "rgba(251,191,36,0.2)",
    iconBg: "rgba(251,191,36,0.18)",
  },
  info: {
    icon: "i",
    color: "#60a5fa",
    bg: "rgba(59,130,246,0.1)",
    border: "rgba(96,165,250,0.28)",
    glow: "rgba(59,130,246,0.2)",
    iconBg: "rgba(59,130,246,0.18)",
  },
};

// ── Toast Context ─────────────────────────────────────────────
const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const show = useCallback((message, type = "info", duration = 3000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [
      ...prev.slice(-4),
      { id, message, type, exiting: false },
    ]);
    setTimeout(() => {
      // Trigger exit animation
      setToasts((prev) =>
        prev.map((t) => (t.id === id ? { ...t, exiting: true } : t)),
      );
      // Remove after animation
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 350);
    }, duration);
    return id;
  }, []);

  const dismiss = useCallback((id) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, exiting: true } : t)),
    );
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 350);
  }, []);

  const toast = {
    success: (msg, dur) => show(msg, "success", dur),
    error: (msg, dur) => show(msg, "error", dur ?? 4000),
    warning: (msg, dur) => show(msg, "warning", dur),
    info: (msg, dur) => show(msg, "info", dur),
    dismiss,
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}

// ── Toast Container ───────────────────────────────────────────
function ToastContainer({ toasts, onDismiss }) {
  if (toasts.length === 0) return null;
  return (
    <div
      style={{
        position: "fixed",
        bottom: 74,
        left: 0,
        right: 0,
        zIndex: 200,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
        padding: "0 16px",
        pointerEvents: "none",
      }}
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

// ── Toast Item ────────────────────────────────────────────────
function ToastItem({ toast, onDismiss }) {
  const v = VARIANTS[toast.type] || VARIANTS.info;

  return (
    <div
      onClick={() => onDismiss(toast.id)}
      style={{
        pointerEvents: "all",
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 14px",
        borderRadius: 14,
        maxWidth: 360,
        width: "100%",
        cursor: "pointer",
        background: `rgba(10,10,30,0.92)`,
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: `1px solid ${v.border}`,
        boxShadow: `0 4px 24px rgba(0,0,0,0.4), 0 0 16px ${v.glow}`,
        animation: toast.exiting
          ? "toastOut 0.35s cubic-bezier(0.4,0,1,1) forwards"
          : "toastIn 0.35s cubic-bezier(0,0,0.2,1) forwards",
      }}
    >
      {/* Icon */}
      <div
        style={{
          width: 26,
          height: 26,
          borderRadius: "50%",
          background: v.iconBg,
          border: `1px solid ${v.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          fontSize: 13,
          fontWeight: 700,
          color: v.color,
          boxShadow: `0 0 8px ${v.glow}`,
        }}
      >
        {v.icon}
      </div>

      {/* Message */}
      <p
        style={{
          flex: 1,
          fontSize: 13,
          fontWeight: 500,
          color: "#e2e8f0",
          lineHeight: 1.4,
          margin: 0,
        }}
      >
        {toast.message}
      </p>

      {/* Dismiss hint */}
      <div
        style={{
          width: 18,
          height: 18,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.06)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 11,
          color: "#4a5568",
          flexShrink: 0,
        }}
      >
        ×
      </div>

      {/* Accent line */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: "50%",
          transform: "translateY(-50%)",
          width: 3,
          height: "60%",
          borderRadius: "0 2px 2px 0",
          background: v.color,
          boxShadow: `0 0 8px ${v.color}`,
        }}
      />
    </div>
  );
}

// ── Inject keyframes ─────────────────────────────
let _injected = false;
function injectKeyframes() {
  if (_injected || typeof document === "undefined") return;
  _injected = true;
  const style = document.createElement("style");
  style.textContent = `
    @keyframes toastIn {
      from { opacity: 0; transform: translateY(20px) scale(0.95); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }
    @keyframes toastOut {
      from { opacity: 1; transform: translateY(0) scale(1); }
      to   { opacity: 0; transform: translateY(12px) scale(0.95); }
    }
    @keyframes modalIn {
      from { opacity: 0; transform: translateY(24px) scale(0.97); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }
    @keyframes overlayIn {
      from { opacity: 0; }
      to   { opacity: 1; }
    }
  `;
  document.head.appendChild(style);
}
injectKeyframes();

// ── Confirm Modal ─────────────────────────────────────────────
// config: { title, message, onConfirm, variant, confirmLabel, cancelLabel }
export function ConfirmModal({ config, onClose }) {
  const confirmRef = useRef();

  useEffect(() => {
    if (config) {
      setTimeout(() => confirmRef.current?.focus(), 100);
    }
  }, [config]);

  if (!config) return null;

  const variant = config.variant || "default";
  const confirmVariants = {
    danger: {
      bg: "linear-gradient(135deg,#ef4444,#dc2626)",
      shadow: "rgba(239,68,68,0.4)",
      label: config.confirmLabel || "Hapus",
    },
    warning: {
      bg: "linear-gradient(135deg,#f59e0b,#d97706)",
      shadow: "rgba(245,158,11,0.4)",
      label: config.confirmLabel || "Lanjutkan",
    },
    default: {
      bg: "linear-gradient(135deg,#3b82f6,#6366f1)",
      shadow: "rgba(59,130,246,0.4)",
      label: config.confirmLabel || "Konfirmasi",
    },
  };
  const cv = confirmVariants[variant];

  const iconMap = {
    danger: {
      emoji: "🗑️",
      color: "#f87171",
      bg: "rgba(248,113,113,0.1)",
      border: "rgba(248,113,113,0.25)",
    },
    warning: {
      emoji: "⚠️",
      color: "#fbbf24",
      bg: "rgba(251,191,36,0.1)",
      border: "rgba(251,191,36,0.25)",
    },
    default: {
      emoji: "ℹ️",
      color: "#60a5fa",
      bg: "rgba(59,130,246,0.1)",
      border: "rgba(96,165,250,0.25)",
    },
  };
  const ic = iconMap[variant];

  function handleConfirm() {
    config.onConfirm?.();
    onClose();
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 300,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        padding: 16,
      }}
    >
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.7)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
          animation: "overlayIn 0.2s ease forwards",
        }}
      />

      {/* Modal */}
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 400,
          background: "rgba(10,10,28,0.96)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          borderRadius: 20,
          border: "1px solid rgba(59,130,246,0.15)",
          boxShadow:
            "0 -4px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.03) inset",
          animation: "modalIn 0.3s cubic-bezier(0,0,0.2,1) forwards",
          overflow: "hidden",
        }}
      >
        {/* Top accent line */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "20%",
            right: "20%",
            height: 2,
            borderRadius: "0 0 4px 4px",
            background:
              variant === "danger"
                ? "linear-gradient(90deg,transparent,#f87171,transparent)"
                : variant === "warning"
                  ? "linear-gradient(90deg,transparent,#fbbf24,transparent)"
                  : "linear-gradient(90deg,transparent,#60a5fa,transparent)",
            boxShadow:
              variant === "danger"
                ? "0 0 12px rgba(248,113,113,0.5)"
                : variant === "warning"
                  ? "0 0 12px rgba(251,191,36,0.5)"
                  : "0 0 12px rgba(96,165,250,0.5)",
          }}
        />

        <div style={{ padding: "24px 20px 20px" }}>
          {/* Icon */}
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              background: ic.bg,
              border: `1px solid ${ic.border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
              marginBottom: 16,
              boxShadow: `0 0 16px ${ic.border}`,
            }}
          >
            {ic.emoji}
          </div>

          {/* Title */}
          <h3
            style={{
              fontSize: 17,
              fontWeight: 700,
              color: "#e2e8f0",
              marginBottom: 8,
              fontFamily: "var(--font-display)",
            }}
          >
            {config.title || "Konfirmasi"}
          </h3>

          {/* Message */}
          {config.message && (
            <p
              style={{
                fontSize: 13,
                color: "#8090a8",
                lineHeight: 1.6,
                marginBottom: 0,
              }}
            >
              {config.message}
            </p>
          )}
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: "rgba(59,130,246,0.08)" }} />

        {/* Actions */}
        <div style={{ padding: "14px 20px", display: "flex", gap: 10 }}>
          {/* Cancel */}
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: "11px 16px",
              borderRadius: 12,
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#94a3b8",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "rgba(255,255,255,0.08)";
              e.target.style.color = "#e2e8f0";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "rgba(255,255,255,0.05)";
              e.target.style.color = "#94a3b8";
            }}
          >
            {config.cancelLabel || "Batal"}
          </button>

          {/* Confirm */}
          <button
            ref={confirmRef}
            onClick={handleConfirm}
            style={{
              flex: 1,
              padding: "11px 16px",
              borderRadius: 12,
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
              background: cv.bg,
              border: "none",
              color: "white",
              boxShadow: `0 2px 16px ${cv.shadow}`,
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) =>
              (e.target.style.boxShadow = `0 4px 24px ${cv.shadow}`)
            }
            onMouseLeave={(e) =>
              (e.target.style.boxShadow = `0 2px 16px ${cv.shadow}`)
            }
          >
            {cv.label}
          </button>
        </div>
      </div>
    </div>
  );
}
