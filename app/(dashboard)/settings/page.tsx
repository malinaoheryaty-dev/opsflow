"use client";
// SAVE AS: app/(dashboard)/settings/page.tsx

import { useState } from "react";

type Tab = "profile" | "appearance" | "notifications" | "integrations";

const card: React.CSSProperties = {
  background: "rgba(168,85,247,0.06)",
  border: "1px solid rgba(168,85,247,0.15)",
  borderRadius: 14,
  padding: "22px 24px",
  marginBottom: 16,
};

const label: React.CSSProperties = {
  fontSize: 11.5,
  fontWeight: 600,
  color: "rgba(192,132,252,0.6)",
  letterSpacing: "0.05em",
  marginBottom: 6,
  display: "block",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "rgba(168,85,247,0.08)",
  border: "1px solid rgba(168,85,247,0.2)",
  borderRadius: 10,
  padding: "9px 13px",
  color: "#fff",
  fontSize: 13.5,
  fontFamily: "inherit",
  outline: "none",
  transition: "border-color 0.15s",
};

function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      style={{
        width: 42, height: 24, borderRadius: 12, cursor: "pointer",
        background: on ? "linear-gradient(135deg, #a855f7, #ec4899)" : "rgba(255,255,255,0.08)",
        border: "none",
        position: "relative",
        transition: "background 0.2s",
        flexShrink: 0,
      }}
    >
      <span style={{
        position: "absolute",
        top: 3,
        left: on ? 21 : 3,
        width: 18, height: 18,
        borderRadius: "50%",
        background: "#fff",
        transition: "left 0.2s",
      }} />
    </button>
  );
}

export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>("profile");

  const [profile, setProfile] = useState({ name: "", email: "", role: "", timezone: "Asia/Manila" });
  const [saved, setSaved] = useState(false);

  const [accentColor, setAccentColor] = useState("purple");
  const [compactMode, setCompactMode] = useState(false);

  const [notifs, setNotifs] = useState({
    taskAssigned: true, taskCompleted: true,
    mentions: true, weeklyReport: false, systemAlerts: true,
  });

  const [integrations, setIntegrations] = useState({
    gmail: false, calendar: false, discord: false,
  });

  const tabs: { id: Tab; icon: string; label: string }[] = [
    { id: "profile",       icon: "👤", label: "Profile" },
    { id: "appearance",    icon: "🎨", label: "Appearance" },
    { id: "notifications", icon: "🔔", label: "Notifications" },
    { id: "integrations",  icon: "🔗", label: "Integrations" },
  ];

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const colors = [
    { id: "purple", bg: "linear-gradient(135deg, #a855f7, #ec4899)" },
    { id: "blue",   bg: "linear-gradient(135deg, #3b82f6, #6366f1)" },
    { id: "green",  bg: "linear-gradient(135deg, #22c55e, #10b981)" },
    { id: "amber",  bg: "linear-gradient(135deg, #f59e0b, #ef4444)" },
  ];

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", color: "#fff", maxWidth: 860 }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Settings</h1>
        <p style={{ fontSize: 13.5, color: "rgba(192,132,252,0.55)" }}>
          Manage your account and workspace preferences
        </p>
      </div>

      <div style={{ display: "flex", gap: 24 }}>
        {/* Tab nav */}
        <nav style={{ width: 160, flexShrink: 0 }}>
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: 10,
                padding: "9px 12px", borderRadius: 10, marginBottom: 3,
                background: tab === t.id ? "rgba(168,85,247,0.18)" : "transparent",
                border: tab === t.id ? "1px solid rgba(168,85,247,0.3)" : "1px solid transparent",
                color: tab === t.id ? "#d8b4fe" : "rgba(255,255,255,0.38)",
                fontSize: 13.5, fontWeight: tab === t.id ? 600 : 400,
                cursor: "pointer", textAlign: "left",
                transition: "all 0.15s",
              }}
            >
              <span>{t.icon}</span> {t.label}
            </button>
          ))}
        </nav>

        {/* Panel */}
        <div style={{ flex: 1 }}>

          {/* ── Profile ── */}
          {tab === "profile" && (
            <>
              <div style={card}>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 18, color: "#d8b4fe" }}>Profile Information</div>

                {/* Avatar */}
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: "50%",
                    background: "linear-gradient(135deg, #a855f7, #ec4899)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 22, fontWeight: 700,
                    border: "2px solid rgba(168,85,247,0.4)",
                  }}>
                    {profile.name ? profile.name[0].toUpperCase() : "🖤"}
                  </div>
                  <div>
                    <button style={{ fontSize: 13, color: "#c084fc", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", padding: 0 }}>
                      Change avatar
                    </button>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", marginTop: 2 }}>JPG or PNG, max 2MB</div>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  {[
                    { key: "name",  label: "Full Name",  placeholder: "Your name",          type: "text"  },
                    { key: "email", label: "Email",       placeholder: "you@example.com",    type: "email" },
                    { key: "role",  label: "Role",        placeholder: "e.g. Operations Lead", type: "text" },
                  ].map(f => (
                    <div key={f.key}>
                      <span style={label}>{f.label}</span>
                      <input
                        type={f.type}
                        value={profile[f.key as keyof typeof profile]}
                        onChange={e => setProfile({ ...profile, [f.key]: e.target.value })}
                        placeholder={f.placeholder}
                        style={inputStyle}
                      />
                    </div>
                  ))}
                  <div>
                    <span style={label}>Timezone</span>
                    <select
                      value={profile.timezone}
                      onChange={e => setProfile({ ...profile, timezone: e.target.value })}
                      style={{ ...inputStyle, cursor: "pointer" }}
                    >
                      <option value="Asia/Manila">Asia/Manila (PHT)</option>
                      <option value="UTC">UTC</option>
                      <option value="America/New_York">America/New_York (ET)</option>
                      <option value="America/Los_Angeles">America/Los_Angeles (PT)</option>
                      <option value="Europe/London">Europe/London (GMT)</option>
                      <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={handleSave}
                  style={{
                    marginTop: 20,
                    padding: "9px 22px", borderRadius: 10,
                    background: "linear-gradient(135deg, #a855f7, #ec4899)",
                    border: "none", color: "#fff", fontSize: 13.5,
                    fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                    transition: "opacity 0.15s",
                  }}
                >
                  {saved ? "✓ Saved!" : "Save Changes"}
                </button>
              </div>

              {/* Danger zone */}
              <div style={{ ...card, background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.2)" }}>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: "#f87171" }}>Danger Zone</div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontSize: 13.5, color: "#fff" }}>Delete Account</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>Permanently remove your account and all data</div>
                  </div>
                  <button style={{
                    padding: "7px 16px", borderRadius: 8,
                    background: "none", border: "1px solid rgba(239,68,68,0.4)",
                    color: "#f87171", fontSize: 13, cursor: "pointer", fontFamily: "inherit",
                  }}>Delete</button>
                </div>
              </div>
            </>
          )}

          {/* ── Appearance ── */}
          {tab === "appearance" && (
            <>
              <div style={card}>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, color: "#d8b4fe" }}>Accent Color</div>
                <div style={{ display: "flex", gap: 12 }}>
                  {colors.map(c => (
                    <button
                      key={c.id}
                      onClick={() => setAccentColor(c.id)}
                      style={{
                        width: 32, height: 32, borderRadius: "50%",
                        background: c.bg, border: "none", cursor: "pointer",
                        outline: accentColor === c.id ? "3px solid #fff" : "3px solid transparent",
                        outlineOffset: 2,
                        transform: accentColor === c.id ? "scale(1.15)" : "scale(1)",
                        transition: "all 0.15s",
                      }}
                    />
                  ))}
                </div>
              </div>

              <div style={card}>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, color: "#d8b4fe" }}>Layout</div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontSize: 13.5 }}>Compact Mode</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>Reduce spacing and padding throughout the app</div>
                  </div>
                  <Toggle on={compactMode} onChange={() => setCompactMode(v => !v)} />
                </div>
              </div>
            </>
          )}

          {/* ── Notifications ── */}
          {tab === "notifications" && (
            <div style={card}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 18, color: "#d8b4fe" }}>Notification Preferences</div>
              {(Object.entries(notifs) as [keyof typeof notifs, boolean][]).map(([key, val]) => {
                const meta: Record<keyof typeof notifs, { label: string; desc: string }> = {
                  taskAssigned:  { label: "Task Assigned to Me",    desc: "Get notified when someone assigns you a task" },
                  taskCompleted: { label: "Task Completed",          desc: "Get notified when a task you own is completed" },
                  mentions:      { label: "Mentions & Comments",     desc: "Get notified when you're mentioned in a comment" },
                  weeklyReport:  { label: "Weekly Summary Report",   desc: "Receive a weekly digest of workspace activity" },
                  systemAlerts:  { label: "System Alerts",           desc: "Important alerts about your account and workspace" },
                };
                return (
                  <div key={key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid rgba(168,85,247,0.08)" }}>
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 500 }}>{meta[key].label}</div>
                      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>{meta[key].desc}</div>
                    </div>
                    <Toggle on={val} onChange={() => setNotifs(n => ({ ...n, [key]: !val }))} />
                  </div>
                );
              })}
            </div>
          )}

          {/* ── Integrations ── */}
          {tab === "integrations" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { key: "gmail" as const,    icon: "📧", label: "Gmail",           desc: "Connect your Gmail to view emails in OpsFlow",          color: "#f87171" },
                { key: "calendar" as const, icon: "📅", label: "Google Calendar", desc: "Sync your calendar events with the dashboard",           color: "#60a5fa" },
                { key: "discord" as const,  icon: "🎮", label: "Discord",         desc: "Connect Discord to monitor your server from OpsFlow",   color: "#a78bfa" },
              ].map(i => (
                <div key={i.key} style={{ ...card, marginBottom: 0, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <span style={{ fontSize: 24 }}>{i.icon}</span>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: i.color }}>{i.label}</div>
                      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>{i.desc}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => setIntegrations(s => ({ ...s, [i.key]: !s[i.key] }))}
                    style={{
                      padding: "8px 18px", borderRadius: 9,
                      background: integrations[i.key]
                        ? "rgba(255,255,255,0.07)"
                        : "linear-gradient(135deg, #a855f7, #ec4899)",
                      border: integrations[i.key] ? "1px solid rgba(255,255,255,0.12)" : "none",
                      color: "#fff", fontSize: 13, fontWeight: 600,
                      cursor: "pointer", fontFamily: "inherit",
                    }}
                  >
                    {integrations[i.key] ? "Disconnect" : "Connect"}
                  </button>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}