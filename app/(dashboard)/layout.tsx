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
  { label: "Gmail",     icon: "📧" },
  { label: "Calendar",  icon: "📅" },
  { label: "Discord",   icon: "🎮" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [aiOpen, setAiOpen] = useState(false);
  const supabase = createClient();
  const router = useRouter();
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
      background: "#0a0a0f", fontFamily: "'DM Sans', sans-serif", color: "#fff",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
        select option { background: #1a1a2e; }
        input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(0.5); }
      `}</style>

      {/* ── Sidebar ─────────────────────────────── */}
      <aside style={{
        width: 220, background: "#0e0c16",
        borderRight: "1px solid rgba(255,255,255,0.07)",
        display: "flex", flexDirection: "column",
        padding: "20px 12px", flexShrink: 0,
        position: "sticky", top: 0, height: "100vh",
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 8px", marginBottom: 28 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 9,
            background: "linear-gradient(135deg, #4A9EFF 0%, #A78BFA 100%)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15,
          }}>⚡</div>
          <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: "-0.01em" }}>OpsFlow</span>
        </div>

        {/* Main nav */}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, color: "rgba(255,255,255,0.2)", letterSpacing: "0.08em", marginBottom: 8, paddingLeft: 8 }}>
            WORKSPACE
          </div>
          {NAV.map(item => {
            const active = pathname === item.href;
            return (
              <a key={item.href} href={item.href} style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "8px 10px", borderRadius: 9, marginBottom: 2,
                textDecoration: "none",
                background: active ? "rgba(74,158,255,0.12)" : "transparent",
                border: active ? "1px solid rgba(74,158,255,0.2)" : "1px solid transparent",
                color: active ? "#4A9EFF" : "rgba(255,255,255,0.45)",
                fontSize: 13.5, fontWeight: active ? 600 : 400,
                transition: "all 0.15s",
              }}>
                <KuromiIcon
  name={NAV_ICONS[item.href]}
  size={16}
  color={active ? "#9b5de5" : "rgba(224,210,255,0.35)"}
/>
{item.label}
              </a>
            );
          })}

          <div style={{ height: 1, background: "rgba(255,255,255,0.07)", margin: "14px 8px" }} />

          <div style={{ fontSize: 10.5, fontWeight: 700, color: "rgba(255,255,255,0.2)", letterSpacing: "0.08em", marginBottom: 8, paddingLeft: 8 }}>
            INTEGRATIONS
          </div>
          {INTEGRATIONS.map(item => (
            <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 10px", borderRadius: 8 }}>
              <span style={{ fontSize: 13 }}>{item.icon}</span>
              <span style={{ fontSize: 12.5, color: "rgba(255,255,255,0.35)" }}>{item.label}</span>
              <span style={{ marginLeft: "auto", width: 6, height: 6, borderRadius: "50%", background: "#22C55E" }} />
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div>
          <button
            onClick={() => setAiOpen(o => !o)}
            style={{
              width: "100%", display: "flex", alignItems: "center", gap: 10,
              padding: "10px 10px", borderRadius: 10, cursor: "pointer", marginBottom: 8,
              background: aiOpen ? "rgba(167,139,250,0.15)" : "rgba(167,139,250,0.08)",
              border: "1px solid rgba(167,139,250,0.25)",
              color: "#A78BFA", fontSize: 13, fontWeight: 600,
            }}
          >
            <KuromiIcon name="ai" size={16} color="#c084fc" /> AI Assistant
          </button>

          {/* User */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px" }}>
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" style={{ width: 28, height: 28, borderRadius: "50%" }} />
            ) : (
              <div style={{
                width: 28, height: 28, borderRadius: "50%",
                background: "#4A9EFF", display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: 11, fontWeight: 700,
              }}>{initials}</div>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: "rgba(255,255,255,0.75)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {profile?.full_name ?? "Loading..."}
              </div>
            </div>
            <button onClick={handleSignOut} title="Sign out" style={{
              background: "none", border: "none", color: "rgba(255,255,255,0.2)",
              fontSize: 14, cursor: "pointer",
            }}><KuromiIcon name="signout" size={14} color="rgba(224,210,255,0.25)" /></button>
          </div>
        </div>
      </aside>

      {/* ── Main content ─────────────────────────── */}
      <main style={{ flex: 1, overflowY: "auto", padding: "28px 32px", paddingRight: aiOpen ? 392 : 32, transition: "padding-right 0.2s ease" }}>
        {children}
      </main>

      {/* ── AI Sidebar ───────────────────────────── */}
      {aiOpen && <AISidebar onClose={() => setAiOpen(false)} />}
    </div>
  );
}

// ─── Minimal AI sidebar (full version in next phase) ─────────
function AISidebar({ onClose }: { onClose: () => void }) {
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState([
    { role: "assistant", text: "Hi! I can summarize your Discord, prioritize tasks, or generate your EOD report. What do you need?" }
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
      setMsgs(m => [...m, { role: "assistant", text: "Sorry, something went wrong. Try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: "fixed", right: 0, top: 0, bottom: 0, width: 360,
      background: "#0F0F13", borderLeft: "1px solid rgba(255,255,255,0.08)",
      display: "flex", flexDirection: "column", zIndex: 200,
    }}>
      <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: "linear-gradient(135deg, #A78BFA, #4A9EFF)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>✦</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>AI Assistant</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>Powered by Claude</div>
          </div>
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", fontSize: 22, cursor: "pointer", lineHeight: 1 }}>×</button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
        {msgs.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
            <div style={{
              maxWidth: "85%", padding: "10px 13px", lineHeight: 1.6, fontSize: 13.5,
              borderRadius: m.role === "user" ? "12px 12px 4px 12px" : "12px 12px 12px 4px",
              background: m.role === "user" ? "#4A9EFF" : "rgba(255,255,255,0.07)",
              color: m.role === "user" ? "#fff" : "rgba(255,255,255,0.78)",
            }}>{m.text}</div>
          </div>
        ))}
        {loading && (
          <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, padding: "4px 0" }}>✦ Thinking...</div>
        )}
      </div>

      <div style={{ padding: 14, borderTop: "1px solid rgba(255,255,255,0.07)", display: "flex", gap: 8 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send()}
          placeholder="Ask anything..."
          style={{
            flex: 1, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 10, padding: "10px 12px", color: "#fff", fontSize: 13.5,
            outline: "none", fontFamily: "inherit",
          }}
        />
        <button onClick={send} disabled={loading} style={{
          background: "#4A9EFF", border: "none", borderRadius: 10,
          padding: "10px 16px", color: "#fff", fontSize: 16, cursor: "pointer",
        }}>↑</button>
      </div>
    </div>
  );
}