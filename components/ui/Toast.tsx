"use client";
// SAVE AS: components/ui/Toast.tsx

import { useState, useEffect, createContext, useContext, useCallback } from "react";

const K = {
  surface:  "#161224",
  border:   "rgba(160,100,255,0.2)",
  pink:     "#ff6eb4",
  purple:   "#9b5de5",
  green:    "#4ade80",
  red:      "#f87171",
  yellow:   "#fbbf24",
  white:    "#f5f0ff",
  muted:    "rgba(224,210,255,0.4)",
};

type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType, duration?: number) => void;
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

const TYPE_CONFIG: Record<ToastType, { icon: string; color: string; bg: string }> = {
  success: { icon: "✓",  color: K.green,  bg: "rgba(74,222,128,0.1)"  },
  error:   { icon: "✕",  color: K.red,    bg: "rgba(248,113,113,0.1)" },
  info:    { icon: "✦",  color: K.purple, bg: "rgba(155,93,229,0.1)"  },
  warning: { icon: "⚠",  color: K.yellow, bg: "rgba(251,191,36,0.1)"  },
};

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const [exiting, setExiting] = useState(false);
  const cfg = TYPE_CONFIG[toast.type];

  useEffect(() => {
    const exitTimer = setTimeout(() => setExiting(true), (toast.duration ?? 3000) - 300);
    const removeTimer = setTimeout(() => onRemove(toast.id), toast.duration ?? 3000);
    return () => { clearTimeout(exitTimer); clearTimeout(removeTimer); };
  }, [toast, onRemove]);

  return (
    <div
      className={exiting ? "toast-exit" : "toast-enter"}
      style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "12px 16px", borderRadius: 12, marginBottom: 8,
        background: K.surface, border: `1px solid ${K.border}`,
        boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
        minWidth: 260, maxWidth: 360,
        cursor: "pointer",
      }}
      onClick={() => { setExiting(true); setTimeout(() => onRemove(toast.id), 300); }}
    >
      <div style={{
        width: 28, height: 28, borderRadius: 8, flexShrink: 0,
        background: cfg.bg, display: "flex", alignItems: "center",
        justifyContent: "center", fontSize: 14, color: cfg.color, fontWeight: 700,
      }}>{cfg.icon}</div>
      <span style={{ fontSize: 13.5, color: K.white, lineHeight: 1.5, flex: 1 }}>
        {toast.message}
      </span>
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = useCallback((message: string, type: ToastType = "info", duration = 3000) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { id, message, type, duration }]);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Toast container */}
      <div style={{
        position: "fixed", bottom: 24, right: 24,
        zIndex: 999, display: "flex", flexDirection: "column-reverse",
        pointerEvents: "none",
      }}>
        {toasts.map(t => (
          <div key={t.id} style={{ pointerEvents: "all" }}>
            <ToastItem toast={t} onRemove={removeToast} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}