"use client";
// SAVE AS: components/gmail/GmailWidget.tsx

import { useGmail, type Email } from "@/hooks/useGmail";
import { useTasks } from "@/hooks/useTasks";
import { useState, useEffect, useRef } from "react";

const K = {
  surface:  "#161224",
  surface2: "#1e1830",
  surface3: "#251f3a",
  border:   "rgba(160,100,255,0.15)",
  border2:  "rgba(255,255,255,0.06)",
  pink:     "#ff6eb4",
  purple:   "#9b5de5",
  purple2:  "#c084fc",
  white:    "#f5f0ff",
  muted:    "rgba(224,210,255,0.4)",
  red:      "#f87171",
  green:    "#4ade80",
};

function parseFrom(from: string) {
  const match = from.match(/^"?([^"<]+)"?\s*<?/);
  return match ? match[1].trim() : from;
}

function parseDate(date: string) {
  try {
    return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch {
    return date;
  }
}

function parseEmail(from: string): string {
  const match = from.match(/<(.+)>/);
  return match ? match[1] : from;
}

interface FullEmail {
  id: string;
  subject: string;
  from: string;
  to: string;
  date: string;
  snippet: string;
  body: string;
  threadId: string;
}

// ─── Email Detail Panel ───────────────────────────────────────
function EmailPanel({
  emailId,
  onClose,
}: {
  emailId: string;
  onClose: () => void;
}) {
  const [email, setEmail] = useState<FullEmail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"read" | "reply" | "compose">("read");
  const [replyBody, setReplyBody] = useState("");
  const [composeTo, setComposeTo] = useState("");
  const [composeSubject, setComposeSubject] = useState("");
  const [composeBody, setComposeBody] = useState("");
  const [sending, setSending] = useState(false);
  const [sendStatus, setSendStatus] = useState<"idle" | "success" | "error">("idle");
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/gmail/${emailId}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) setError(data.error);
        else setEmail(data);
      })
      .catch(() => setError("Failed to load email"))
      .finally(() => setLoading(false));
  }, [emailId]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const handleSend = async () => {
    if (!email) return;
    setSending(true);
    setSendStatus("idle");
    const isReply = mode === "reply";
    try {
      const res = await fetch("/api/gmail/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: isReply ? parseEmail(email.from) : composeTo,
          subject: isReply ? `Re: ${email.subject}` : composeSubject,
          body: isReply ? replyBody : composeBody,
          threadId: isReply ? email.threadId : undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSendStatus("success");
        if (isReply) setReplyBody("");
        else { setComposeTo(""); setComposeSubject(""); setComposeBody(""); }
        setTimeout(() => setSendStatus("idle"), 2500);
      } else {
        setSendStatus("error");
      }
    } catch {
      setSendStatus("error");
    } finally {
      setSending(false);
    }
  };

  const panelStyle: React.CSSProperties = {
    position: "fixed",
    top: 0,
    right: 0,
    width: 480,
    height: "100vh",
    background: "#120f1e",
    borderLeft: `1px solid ${K.border}`,
    zIndex: 1000,
    display: "flex",
    flexDirection: "column",
    boxShadow: "-12px 0 48px rgba(0,0,0,0.6)",
    animation: "slideIn 0.22s cubic-bezier(0.16,1,0.3,1)",
  };

  return (
    <>
      <style>{`
        @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
      `}</style>

      {/* Backdrop */}
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 999 }} />

      <div ref={panelRef} style={panelStyle}>

        {/* Header */}
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${K.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => setMode("read")}
              style={{ padding: "5px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", border: "none", background: mode === "read" ? `linear-gradient(135deg, ${K.purple}, ${K.pink})` : "rgba(255,255,255,0.06)", color: mode === "read" ? "#fff" : K.muted }}
            >
              Read
            </button>
            <button
              onClick={() => setMode("reply")}
              style={{ padding: "5px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", border: "none", background: mode === "reply" ? `linear-gradient(135deg, ${K.purple}, ${K.pink})` : "rgba(255,255,255,0.06)", color: mode === "reply" ? "#fff" : K.muted }}
            >
              ↩ Reply
            </button>
            <button
              onClick={() => setMode("compose")}
              style={{ padding: "5px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", border: "none", background: mode === "compose" ? `linear-gradient(135deg, ${K.purple}, ${K.pink})` : "rgba(255,255,255,0.06)", color: mode === "compose" ? "#fff" : K.muted }}
            >
              ✏️ New
            </button>
          </div>
          <button
            onClick={onClose}
            style={{ background: "transparent", border: "none", color: K.muted, fontSize: 20, cursor: "pointer", lineHeight: 1, padding: "2px 6px" }}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>

          {/* ── COMPOSE mode ── */}
          {mode === "compose" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: K.white, margin: 0 }}>New Email</p>
              <input
                placeholder="To"
                value={composeTo}
                onChange={e => setComposeTo(e.target.value)}
                style={inputStyle}
              />
              <input
                placeholder="Subject"
                value={composeSubject}
                onChange={e => setComposeSubject(e.target.value)}
                style={inputStyle}
              />
              <textarea
                placeholder="Write your message..."
                value={composeBody}
                onChange={e => setComposeBody(e.target.value)}
                rows={12}
                style={{ ...inputStyle, resize: "vertical", fontFamily: "'DM Sans', sans-serif" }}
              />
              {sendStatus === "success" && <p style={{ color: K.green, fontSize: 12, margin: 0 }}>✓ Sent!</p>}
              {sendStatus === "error" && <p style={{ color: K.red, fontSize: 12, margin: 0 }}>Failed to send. Try again.</p>}
              <button onClick={handleSend} disabled={sending || !composeTo || !composeBody} style={sendBtnStyle(sending)}>
                {sending ? "Sending..." : "Send →"}
              </button>
            </div>
          )}

          {/* ── READ / REPLY mode with email info ── */}
          {(mode === "read" || mode === "reply") && (
            <>
              {loading && (
                <div style={{ color: K.muted, fontSize: 13, textAlign: "center", paddingTop: 40 }}>Loading...</div>
              )}
              {error && (
                <div style={{ color: K.red, fontSize: 13 }}>Error: {error}</div>
              )}
              {!loading && !error && email && (
                <>
                  {/* Email meta */}
                  <h2 style={{ fontSize: 15, fontWeight: 700, color: K.white, margin: "0 0 14px" }}>{email.subject}</h2>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 16, padding: "12px 14px", background: "rgba(255,255,255,0.03)", borderRadius: 10, border: `1px solid ${K.border}` }}>
                    <Row label="From" value={email.from} />
                    <Row label="To" value={email.to} />
                    <Row label="Date" value={new Date(email.date).toLocaleString()} />
                  </div>

                  {/* Body */}
                  {mode === "read" && (
                    <div style={{ fontSize: 13, color: "rgba(224,210,255,0.75)", lineHeight: 1.75, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                      {email.body || email.snippet}
                    </div>
                  )}

                  {/* Reply box */}
                  {mode === "reply" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      <p style={{ fontSize: 12, color: K.muted, margin: 0 }}>Replying to <span style={{ color: K.purple2 }}>{parseEmail(email.from)}</span></p>
                      <textarea
                        placeholder="Write your reply..."
                        value={replyBody}
                        onChange={e => setReplyBody(e.target.value)}
                        rows={10}
                        style={{ ...inputStyle, resize: "vertical", fontFamily: "'DM Sans', sans-serif" }}
                        autoFocus
                      />
                      {sendStatus === "success" && <p style={{ color: K.green, fontSize: 12, margin: 0 }}>✓ Reply sent!</p>}
                      {sendStatus === "error" && <p style={{ color: K.red, fontSize: 12, margin: 0 }}>Failed to send. Try again.</p>}
                      <button onClick={handleSend} disabled={sending || !replyBody.trim()} style={sendBtnStyle(sending)}>
                        {sending ? "Sending..." : "Send Reply →"}
                      </button>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", gap: 8, fontSize: 12 }}>
      <span style={{ color: K.muted, width: 36, flexShrink: 0 }}>{label}</span>
      <span style={{ color: K.white, wordBreak: "break-all" }}>{value}</span>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(160,100,255,0.2)",
  borderRadius: 10,
  padding: "10px 14px",
  color: "#f5f0ff",
  fontSize: 13,
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
};

const sendBtnStyle = (disabled: boolean): React.CSSProperties => ({
  background: disabled ? "rgba(155,93,229,0.3)" : "linear-gradient(135deg, #9b5de5, #ff6eb4)",
  border: "none",
  borderRadius: 10,
  padding: "10px 20px",
  color: "#fff",
  fontSize: 13,
  fontWeight: 700,
  cursor: disabled ? "not-allowed" : "pointer",
  opacity: disabled ? 0.6 : 1,
  alignSelf: "flex-end",
});

// ─── Main Widget ──────────────────────────────────────────────
export default function GmailWidget() {
  const { emails, loading, error, connected } = useGmail();
  const { createTask } = useTasks();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [composing, setComposing] = useState(false);

  const handleCreateTask = async (subject: string) => {
    await createTask({
      title: `Reply: ${subject}`,
      priority: "medium",
      source: "gmail",
      status: "todo",
    });
  };

  if (loading) return (
    <div style={{ padding: "12px 0", color: K.muted, fontSize: 13 }}>Loading emails...</div>
  );

  if (!connected) return (
    <div style={{ padding: 20, textAlign: "center" }}>
      <div style={{ fontSize: 28, marginBottom: 10 }}>📧</div>
      <div style={{ fontSize: 13, color: K.muted, marginBottom: 12 }}>Gmail not connected yet.</div>
      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.2)", lineHeight: 1.7 }}>
        Sign out and sign back in with Google to grant Gmail access.
      </div>
    </div>
  );

  if (error) return (
    <div style={{ padding: "12px 0", color: K.red, fontSize: 13 }}>Error: {error}</div>
  );

  if (emails.length === 0) return (
    <div style={{ padding: "12px 0", textAlign: "center", color: K.muted, fontSize: 13 }}>
      🎉 No unread emails!
    </div>
  );

  return (
    <>
      {/* Compose button */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
        <button
          onClick={() => { setComposing(true); setSelectedId(null); }}
          style={{ background: "rgba(155,93,229,0.15)", border: "1px solid rgba(155,93,229,0.3)", borderRadius: 8, padding: "4px 12px", color: K.purple2, fontSize: 12, fontWeight: 600, cursor: "pointer" }}
        >
          ✏️ Compose
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {emails.map(email => (
          <div
            key={email.id}
            onClick={() => { setSelectedId(email.id); setComposing(false); }}
            style={{
              padding: "11px 13px",
              borderRadius: 10,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.07)",
              cursor: "pointer",
              transition: "background 0.15s, border-color 0.15s",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLDivElement).style.background = "rgba(155,93,229,0.1)";
              (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(155,93,229,0.25)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.04)";
              (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.07)";
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
              <span style={{ fontSize: 12.5, fontWeight: 600, color: "rgba(255,255,255,0.7)" }}>
                {parseFrom(email.from)}
              </span>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)" }}>
                {parseDate(email.date)}
              </span>
            </div>
            <div style={{ fontSize: 12.5, color: K.white, fontWeight: 500, marginBottom: 3 }}>
              {email.subject}
            </div>
            <div style={{
              fontSize: 11.5, color: K.muted, lineHeight: 1.5,
              overflow: "hidden", display: "-webkit-box",
              WebkitLineClamp: 1, WebkitBoxOrient: "vertical",
            }}>
              {email.snippet}
            </div>
          </div>
        ))}
      </div>

      {/* Slide-in panel for reading */}
      {(selectedId || composing) && (
        <EmailPanel
          emailId={selectedId ?? ""}
          onClose={() => { setSelectedId(null); setComposing(false); }}
        />
      )}

      {/* Compose-only panel (no email to load) */}
      {composing && !selectedId && (
        <EmailPanel
          emailId=""
          onClose={() => setComposing(false)}
        />
      )}
    </>
  );
}