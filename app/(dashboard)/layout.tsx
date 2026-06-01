"use client";
// SAVE AS: app/(dashboard)/layout.tsx

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types/database";
import { KuromiIcon, NAV_ICONS } from "@/components/ui/KuromiIcons";

const NAV = [
  { href: "/",         label: "Dashboard" },
  { href: "/tasks",    label: "Tasks" },
  { href: "/notes",    label: "Notes" },
  { href: "/discord",  label: "Discord" },
  { href: "/team",     label: "Team" },
  { href: "/reports",  label: "Reports" },
  { href: "/settings", label: "Settings" },
];

const INTEGRATIONS = [
  { label: "Gmail",    icon: "📧" },
  { label: "Calendar", icon: "📅" },
  { label: "Discord",  icon: "🎮" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [profile, setProfile]         = useState<Profile | null>(null);
  const [aiOpen, setAiOpen]           = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const supabase = createClient();
  const router   = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push("/login"); return; }
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (data) setProfile(data);
    });
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const initials = profile?.full_name
    ? profile.full_name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  return (
    <div style={{
      display: "flex", minHeight: "100vh",
      background: "#0d0b14",
      fontFamily: "'DM Sans', sans-serif", color: "#fff",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: rgba(168,85,247,0.25); border-radius: 2px; }
        select option { background: #1a1030; }
        input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(0.5); }

        .nav-link { transition: all 0.15s ease; }
        .nav-link:hover .nav-icon-wrap {
          background: rgba(155,93,229,0.18) !important;
        }
        .nav-link:hover {
          color: rgba(255,255,255,0.85) !important;
        }
        .nav-link:hover .nav-label {
          color: rgba(255,255,255,0.85) !important;
        }

        .toggle-btn:hover {
          background: rgba(168,85,247,0.3) !important;
          border-color: rgba(168,85,247,0.6) !important;
        }

        .integration-row:hover {
          background: rgba(155,93,229,0.08) !important;
        }

        .ai-btn:hover {
          background: rgba(167,139,250,0.2) !important;
        }
      `}</style>

      {/* ── Sidebar toggle ── */}
      <button
        className="toggle-btn"
        onClick={() => setSidebarOpen(o => !o)}
        title={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
        style={{
          position: "fixed",
          top: 20,
          left: sidebarOpen ? 194 : 10,
          zIndex: 400,
          width: 22, height: 22,
          borderRadius: "50%",
          background: "rgba(155,93,229,0.15)",
          border: "1px solid rgba(155,93,229,0.4)",
          color: "#c084fc",
          fontSize: 8,
          cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "left 0.28s ease, background 0.15s, border-color 0.15s",
        }}
      >
        {sidebarOpen ? "◀" : "▶"}
      </button>

      {/* ── Sidebar ── */}
      <aside style={{
        width: sidebarOpen ? 210 : 0,
        flexShrink: 0,
        background: "#110e1f",
        borderRight: "1px solid rgba(155,93,229,0.12)",
        display: "flex", flexDirection: "column",
        position: "sticky", top: 0, height: "100vh",
        overflow: "hidden",
        transition: "width 0.28s ease",
      }}>
        <div style={{ width: 210, display: "flex", flexDirection: "column", height: "100%", padding: "16px 10px 12px" }}>

          {/* ── Logo ── */}
          <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "4px 8px", marginBottom: 22 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10, flexShrink: 0,
              background: "linear-gradient(135deg, #9b5de5 0%, #ff6eb4 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18, boxShadow: "0 4px 12px rgba(155,93,229,0.35)",
            }}>🖤</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, letterSpacing: "-0.01em", lineHeight: 1.1 }}>OpsFlow</div>
              <div style={{ fontSize: 10, color: "#ff6eb4", fontWeight: 600, letterSpacing: "0.05em" }}>WORKSPACE</div>
            </div>
          </div>

          {/* ── Nav section label ── */}
          <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(192,132,252,0.3)", letterSpacing: "0.12em", marginBottom: 6, paddingLeft: 10 }}>
            WORKSPACE
          </div>

          {/* ── Nav items ── */}
          <div style={{ flex: 1, overflowY: "auto" }}>
            {NAV.map(item => {
              const active = pathname === item.href;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  className="nav-link"
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "4px 6px 4px 4px",
                    borderRadius: 10, marginBottom: 2,
                    textDecoration: "none",
                    background: active ? "rgba(155,93,229,0.14)" : "transparent",
                    position: "relative",
                  }}
                >
                  {/* Active left bar */}
                  {active && (
                    <div style={{
                      position: "absolute", left: 0, top: "20%", bottom: "20%",
                      width: 3, borderRadius: 2,
                      background: "linear-gradient(180deg, #9b5de5, #ff6eb4)",
                    }} />
                  )}

                  {/* Icon wrapper */}
                  <div
                    className="nav-icon-wrap"
                    style={{
                      width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      background: active ? "rgba(155,93,229,0.22)" : "transparent",
                      transition: "background 0.15s",
                      marginLeft: 4,
                    }}
                  >
                    <KuromiIcon
                      name={NAV_ICONS[item.href]}
                      size={17}
                      color={active ? "#c084fc" : "rgba(192,132,252,0.45)"}
                    />
                  </div>

                  {/* Label */}
                  <span
                    className="nav-label"
                    style={{
                      fontSize: 13.5,
                      fontWeight: active ? 600 : 400,
                      color: active ? "#e0aaff" : "rgba(255,255,255,0.42)",
                      transition: "color 0.15s",
                    }}
                  >
                    {item.label}
                  </span>

                  {/* Plus badge on some items — matches screenshot */}
                  {(item.href === "/tasks" || item.href === "/notes" || item.href === "/team") && (
                    <div style={{ marginLeft: "auto", color: "rgba(192,132,252,0.25)", fontSize: 14, fontWeight: 300 }}>+</div>
                  )}
                </a>
              );
            })}

            {/* ── Divider ── */}
            <div style={{ height: 1, background: "rgba(155,93,229,0.1)", margin: "10px 8px" }} />

            {/* ── Integrations ── */}
            <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(192,132,252,0.3)", letterSpacing: "0.12em", marginBottom: 6, paddingLeft: 10 }}>
              INTEGRATIONS
            </div>
            {INTEGRATIONS.map(item => (
              <div
                key={item.label}
                className="integration-row"
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "6px 10px 6px 14px", borderRadius: 8,
                  cursor: "pointer", transition: "background 0.15s",
                }}
              >
                <span style={{ fontSize: 14 }}>{item.icon}</span>
                <span style={{ fontSize: 13, color: "rgba(255,255,255,0.32)" }}>{item.label}</span>
                <span style={{ marginLeft: "auto", width: 6, height: 6, borderRadius: "50%", background: "#9b5de5", boxShadow: "0 0 6px rgba(155,93,229,0.6)" }} />
              </div>
            ))}
          </div>

          {/* ── Bottom: AI + User ── */}
          <div style={{ marginTop: 8 }}>
            {/* AI Assistant button */}
            <button
              className="ai-btn"
              onClick={() => setAiOpen(o => !o)}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: 10,
                padding: "10px 12px", borderRadius: 11, cursor: "pointer", marginBottom: 8,
                background: aiOpen ? "rgba(167,139,250,0.18)" : "rgba(167,139,250,0.09)",
                border: "1px solid rgba(167,139,250,0.22)",
                color: "#c084fc", fontSize: 13, fontWeight: 600,
                transition: "background 0.15s",
              }}
            >
              <div style={{
                width: 26, height: 26, borderRadius: 7, flexShrink: 0,
                background: "linear-gradient(135deg, #9b5de5, #ff6eb4)",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13,
              }}>✦</div>
              AI Assistant
            </button>

            {/* User row */}
            <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "6px 8px", borderRadius: 10 }}>
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="" style={{
                  width: 30, height: 30, borderRadius: "50%",
                  border: "2px solid rgba(155,93,229,0.4)",
                }} />
              ) : (
                <div style={{
                  width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
                  background: "linear-gradient(135deg, #9b5de5, #ff6eb4)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, fontWeight: 700,
                  border: "2px solid rgba(155,93,229,0.35)",
                }}>{initials}</div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: "rgba(255,255,255,0.7)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {profile?.full_name ?? "Loading..."}
                </div>
                {profile?.email && (
                  <div style={{ fontSize: 10.5, color: "rgba(192,132,252,0.4)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: 1 }}>
                    {profile.email}
                  </div>
                )}
              </div>
              <button onClick={handleSignOut} title="Sign out" style={{
                background: "none", border: "none",
                cursor: "pointer", flexShrink: 0,
                display: "flex", alignItems: "center",
              }}>
                <KuromiIcon name="signout" size={14} color="rgba(192,132,252,0.3)" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <main style={{
        flex: 1, overflowY: "auto",
        padding: "28px 32px",
        paddingRight: aiOpen ? 392 : 32,
        transition: "padding-right 0.2s ease",
        background: "radial-gradient(ellipse at 20% 0%, rgba(155,93,229,0.06) 0%, transparent 60%), #0d0b14",
      }}>
        {children}
      </main>

      {aiOpen && <AISidebar onClose={() => setAiOpen(false)} />}
    </div>
  );
}

function AISidebar({ onClose }: { onClose: () => void }) {
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState([
    { role: "assistant", text: "Hey there! I'm Kuromi 🖤✨ How can I help you slay your day?" }
  ]);
  const [loading, setLoading] = useState(false);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setMsgs(m => [...m, { role: "user", text: userMsg }]);
    setLoading(true);
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg }),
      });
      const data = await res.json();
      setMsgs(m => [...m, { role: "assistant", text: data.reply }]);
    } catch {
      setMsgs(m => [...m, { role: "assistant", text: "Sorry, something went wrong!" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: "fixed", right: 0, top: 0, bottom: 0, width: 360,
      background: "#110e1f",
      borderLeft: "1px solid rgba(155,93,229,0.15)",
      display: "flex", flexDirection: "column", zIndex: 200,
    }}>
      <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(155,93,229,0.12)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg, #9b5de5, #ff6eb4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17 }}>🖤</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>Kuromi AI Assistant</div>
            <div style={{ fontSize: 11, color: "rgba(192,132,252,0.45)" }}>Powered by Claude</div>
          </div>
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", color: "rgba(192,132,252,0.4)", fontSize: 22, cursor: "pointer", lineHeight: 1 }}>×</button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
        {msgs.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
            <div style={{
              maxWidth: "85%", padding: "10px 13px", lineHeight: 1.6, fontSize: 13.5,
              borderRadius: m.role === "user" ? "12px 12px 4px 12px" : "12px 12px 12px 4px",
              background: m.role === "user"
                ? "linear-gradient(135deg, #9b5de5, #ff6eb4)"
                : "rgba(155,93,229,0.1)",
              border: m.role === "user" ? "none" : "1px solid rgba(155,93,229,0.18)",
              color: "#fff",
            }}>{m.text}</div>
          </div>
        ))}
        {loading && <div style={{ color: "rgba(192,132,252,0.45)", fontSize: 13 }}>🖤 Thinking...</div>}
      </div>

      <div style={{ padding: 14, borderTop: "1px solid rgba(155,93,229,0.12)", display: "flex", gap: 8 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send()}
          placeholder="Ask Kuromi anything..."
          style={{
            flex: 1, background: "rgba(155,93,229,0.08)",
            border: "1px solid rgba(155,93,229,0.22)",
            borderRadius: 10, padding: "10px 12px", color: "#fff",
            fontSize: 13.5, outline: "none", fontFamily: "inherit",
          }}
        />
        <button onClick={send} disabled={loading} style={{
          background: "linear-gradient(135deg, #9b5de5, #ff6eb4)",
          border: "none", borderRadius: 10,
          padding: "10px 16px", color: "#fff", fontSize: 16, cursor: "pointer",
        }}>↑</button>
      </div>
    </div>
  );
}