"use client";

import { useState } from "react";

type Tab = "profile" | "appearance" | "notifications" | "integrations";

// ── Kuromi palette ──────────────────────────────────────────────────────────
// bg: #0d0010  surface: #160020  border: #3d1060
// accent-purple: #9b5de5  accent-pink: #f72585  text-muted: #a78bca
// ────────────────────────────────────────────────────────────────────────────

const KuromiStar = ({ className = "", style }: { className?: string; style?: React.CSSProperties }) => (
  <svg className={className} style={style} viewBox="0 0 16 16" fill="currentColor">
    <path d="M8 0l1.6 5.5H16l-4.8 3.5 1.8 5.5L8 11l-5 3.5 1.8-5.5L0 5.5h6.4z" />
  </svg>
);

const KuromiBow = () => (
  <svg viewBox="0 0 40 20" className="inline-block w-8 h-4" fill="none">
    <ellipse cx="10" cy="10" rx="9" ry="6" fill="#9b5de5" opacity=".8" />
    <ellipse cx="30" cy="10" rx="9" ry="6" fill="#9b5de5" opacity=".8" />
    <circle cx="20" cy="10" r="4" fill="#f72585" />
    <ellipse cx="10" cy="10" rx="9" ry="6" fill="none" stroke="#f72585" strokeWidth=".8" />
    <ellipse cx="30" cy="10" rx="9" ry="6" fill="none" stroke="#f72585" strokeWidth=".8" />
  </svg>
);

// ── Reusable toggle ─────────────────────────────────────────────────────────
function KuromiToggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      aria-pressed={on}
      className="relative w-12 h-6 rounded-full flex-shrink-0 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#f72585]/50"
      style={{
        background: on
          ? "linear-gradient(90deg,#9b5de5,#f72585)"
          : "rgba(61,16,96,0.6)",
        border: "1px solid rgba(155,93,229,0.4)",
      }}
    >
      <span
        className="absolute top-0.5 w-5 h-5 rounded-full transition-transform duration-300 flex items-center justify-center"
        style={{
          background: on ? "#fff" : "#a78bca",
          transform: on ? "translateX(26px)" : "translateX(2px)",
          boxShadow: on ? "0 0 6px #f72585" : "none",
          fontSize: 8,
        }}
      >
        {on ? "★" : ""}
      </span>
    </button>
  );
}

// ── Input ───────────────────────────────────────────────────────────────────
function KuromiInput({
  label, type = "text", value, onChange, placeholder,
}: {
  label: string; type?: string; value: string;
  onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold mb-1.5 uppercase tracking-widest" style={{ color: "#a78bca" }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg px-3 py-2 text-sm transition-all duration-200 focus:outline-none placeholder-[#5a3878]"
        style={{
          background: "rgba(22,0,32,0.8)",
          border: "1px solid rgba(61,16,96,0.8)",
          color: "#e8d5ff",
        }}
        onFocus={(e) => {
          e.target.style.border = "1px solid #9b5de5";
          e.target.style.boxShadow = "0 0 0 3px rgba(155,93,229,0.15)";
        }}
        onBlur={(e) => {
          e.target.style.border = "1px solid rgba(61,16,96,0.8)";
          e.target.style.boxShadow = "none";
        }}
      />
    </div>
  );
}

// ── Card ────────────────────────────────────────────────────────────────────
function KuromiCard({ children, danger = false }: { children: React.ReactNode; danger?: boolean }) {
  return (
    <div
      className="rounded-2xl p-6"
      style={{
        background: danger ? "rgba(247,37,133,0.04)" : "rgba(22,0,32,0.7)",
        border: `1px solid ${danger ? "rgba(247,37,133,0.25)" : "rgba(61,16,96,0.9)"}`,
        boxShadow: danger
          ? "0 0 20px rgba(247,37,133,0.06) inset"
          : "0 0 30px rgba(155,93,229,0.05) inset",
      }}
    >
      {children}
    </div>
  );
}

// ── Main component ──────────────────────────────────────────────────────────
export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("profile");

  const [profile, setProfile] = useState({ name: "", email: "", role: "", timezone: "Asia/Manila" });
  const [profileSaved, setProfileSaved] = useState(false);

  const [theme, setTheme] = useState<"dark" | "light" | "system">("dark");
  const [accentColor, setAccentColor] = useState("purple");
  const [compactMode, setCompactMode] = useState(false);

  const [notifications, setNotifications] = useState({
    taskAssigned: true, taskCompleted: true, mentions: true, weeklyReport: false, systemAlerts: true,
  });

  const [integrations, setIntegrations] = useState({
    gmail: false, calendar: false, discord: false,
  });

  const handleProfileSave = () => {
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2000);
  };

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "profile",       label: "Profile",       icon: "🐾" },
    { id: "appearance",    label: "Appearance",    icon: "🎀" },
    { id: "notifications", label: "Notifications", icon: "🔔" },
    { id: "integrations",  label: "Integrations",  icon: "🔗" },
  ];

  const accentColors = [
    { id: "purple",   label: "Kuromi Purple", hex: "#9b5de5" },
    { id: "pink",     label: "Hot Pink",      hex: "#f72585" },
    { id: "lavender", label: "Lavender",      hex: "#c77dff" },
    { id: "midnight", label: "Midnight",      hex: "#7b2fff" },
    { id: "skull",    label: "Skull White",   hex: "#e8d5ff" },
  ];

  const notifLabels: Record<keyof typeof notifications, string> = {
    taskAssigned: "Task Assigned to Me",
    taskCompleted: "Task Completed",
    mentions: "Mentions & Comments",
    weeklyReport: "Weekly Summary Report",
    systemAlerts: "System Alerts",
  };
  const notifDesc: Record<keyof typeof notifications, string> = {
    taskAssigned: "Get notified when someone assigns you a task",
    taskCompleted: "Get notified when a task you own is completed",
    mentions: "Get notified when you're mentioned in a comment",
    weeklyReport: "Receive a weekly digest of workspace activity",
    systemAlerts: "Important alerts about your account and workspace",
  };

  return (
    <div
      className="min-h-screen flex-1 p-6 overflow-auto"
      style={{
        background: "#0d0010",
        fontFamily: "'Nunito', sans-serif",
      }}
    >
      {/* Google Font */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&family=Fredoka+One&display=swap');
        * { box-sizing: border-box; }
        select option { background: #160020; color: #e8d5ff; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #0d0010; }
        ::-webkit-scrollbar-thumb { background: #3d1060; border-radius: 3px; }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
        @keyframes glow-pulse { 0%,100%{opacity:.6} 50%{opacity:1} }
      `}</style>

      {/* Floating bg stars */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        {[...Array(18)].map((_, i) => (
          <KuromiStar
            key={i}
            className="absolute"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${6 + Math.random() * 10}px`,
              color: i % 2 === 0 ? "#9b5de5" : "#f72585",
              opacity: 0.08 + Math.random() * 0.12,
              animation: `float ${3 + Math.random() * 4}s ease-in-out ${Math.random() * 2}s infinite`,
            }}
          />
        ))}
      </div>

      <div className="relative" style={{ zIndex: 1 }}>
        {/* Header */}
        <div className="mb-8 flex items-center gap-3">
          <KuromiBow />
          <div>
            <h1
              className="text-2xl font-extrabold"
              style={{ fontFamily: "'Fredoka One', cursive", color: "#e8d5ff", letterSpacing: "0.02em" }}
            >
              Settings
              <KuromiStar className="inline-block w-4 h-4 ml-2" style={{ color: "#f72585" }} />
            </h1>
            <p className="text-xs mt-0.5" style={{ color: "#7a5a9a" }}>
              Customize your workspace, your way ✦
            </p>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Sidebar */}
          <nav className="w-48 flex-shrink-0">
            <div
              className="rounded-2xl p-2"
              style={{
                background: "rgba(22,0,32,0.7)",
                border: "1px solid rgba(61,16,96,0.9)",
              }}
            >
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 text-left mb-0.5 last:mb-0"
                  style={
                    activeTab === tab.id
                      ? {
                          background: "linear-gradient(135deg,rgba(155,93,229,0.25),rgba(247,37,133,0.15))",
                          color: "#e8d5ff",
                          border: "1px solid rgba(155,93,229,0.4)",
                          boxShadow: "0 0 12px rgba(155,93,229,0.15)",
                        }
                      : {
                          background: "transparent",
                          color: "#7a5a9a",
                          border: "1px solid transparent",
                        }
                  }
                  onMouseEnter={(e) => {
                    if (activeTab !== tab.id) {
                      (e.currentTarget as HTMLButtonElement).style.color = "#c77dff";
                      (e.currentTarget as HTMLButtonElement).style.background = "rgba(155,93,229,0.08)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeTab !== tab.id) {
                      (e.currentTarget as HTMLButtonElement).style.color = "#7a5a9a";
                      (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                    }
                  }}
                >
                  <span className="text-base">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Kuromi doodle label */}
            <p className="text-center text-xs mt-4" style={{ color: "#3d1060" }}>
              ★ opsflow ★
            </p>
          </nav>

          {/* Panel */}
          <div className="flex-1 max-w-2xl">

            {/* ── PROFILE TAB ── */}
            {activeTab === "profile" && (
              <div className="space-y-5">
                <KuromiCard>
                  <h2 className="font-extrabold text-base mb-5 flex items-center gap-2" style={{ fontFamily: "'Fredoka One', cursive", color: "#c77dff" }}>
                    <span>🐾</span> Profile Information
                  </h2>

                  {/* Avatar */}
                  <div className="flex items-center gap-4 mb-6">
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-black relative"
                      style={{
                        background: "linear-gradient(135deg,#9b5de5,#f72585)",
                        boxShadow: "0 0 20px rgba(155,93,229,0.4)",
                        color: "#fff",
                        fontFamily: "'Fredoka One', cursive",
                      }}
                    >
                      {profile.name ? profile.name[0].toUpperCase() : "✦"}
                      <span
                        className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs"
                        style={{ background: "#f72585", border: "2px solid #0d0010" }}
                      >★</span>
                    </div>
                    <div>
                      <button
                        className="text-sm font-bold transition-colors"
                        style={{ color: "#9b5de5" }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "#f72585")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "#9b5de5")}
                      >
                        Change avatar
                      </button>
                      <p className="text-xs mt-0.5" style={{ color: "#5a3878" }}>JPG or PNG, max 2MB</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <KuromiInput label="Full Name" value={profile.name} onChange={(v) => setProfile({ ...profile, name: v })} placeholder="Your name" />
                    <KuromiInput label="Email" type="email" value={profile.email} onChange={(v) => setProfile({ ...profile, email: v })} placeholder="you@example.com" />
                    <KuromiInput label="Role" value={profile.role} onChange={(v) => setProfile({ ...profile, role: v })} placeholder="e.g. Operations Lead" />
                    <div>
                      <label className="block text-xs font-semibold mb-1.5 uppercase tracking-widest" style={{ color: "#a78bca" }}>Timezone</label>
                      <select
                        value={profile.timezone}
                        onChange={(e) => setProfile({ ...profile, timezone: e.target.value })}
                        className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none transition-all"
                        style={{
                          background: "rgba(22,0,32,0.8)",
                          border: "1px solid rgba(61,16,96,0.8)",
                          color: "#e8d5ff",
                        }}
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

                  <div className="mt-6">
                    <button
                      onClick={handleProfileSave}
                      className="px-5 py-2 rounded-xl text-sm font-extrabold transition-all duration-200"
                      style={{
                        background: "linear-gradient(135deg,#9b5de5,#f72585)",
                        color: "#fff",
                        boxShadow: profileSaved ? "0 0 20px rgba(247,37,133,0.4)" : "0 0 12px rgba(155,93,229,0.3)",
                        transform: profileSaved ? "scale(1.03)" : "scale(1)",
                      }}
                    >
                      {profileSaved ? "✓ Saved! ★" : "Save Changes"}
                    </button>
                  </div>
                </KuromiCard>

                <KuromiCard danger>
                  <h2 className="font-extrabold text-base mb-4 flex items-center gap-2" style={{ fontFamily: "'Fredoka One', cursive", color: "#f72585" }}>
                    <span>💀</span> Danger Zone
                  </h2>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold" style={{ color: "#e8d5ff" }}>Delete Account</p>
                      <p className="text-xs mt-0.5" style={{ color: "#7a5a9a" }}>Permanently remove your account and all data</p>
                    </div>
                    <button
                      className="px-4 py-1.5 rounded-xl text-sm font-bold transition-all duration-200"
                      style={{ border: "1px solid rgba(247,37,133,0.5)", color: "#f72585", background: "transparent" }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.background = "rgba(247,37,133,0.12)";
                        (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 12px rgba(247,37,133,0.2)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                        (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </KuromiCard>
              </div>
            )}

            {/* ── APPEARANCE TAB ── */}
            {activeTab === "appearance" && (
              <div className="space-y-5">
                <KuromiCard>
                  <h2 className="font-extrabold text-base mb-5 flex items-center gap-2" style={{ fontFamily: "'Fredoka One', cursive", color: "#c77dff" }}>
                    <span>🎀</span> Theme
                  </h2>
                  <div className="flex gap-3">
                    {(["dark", "light", "system"] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => setTheme(t)}
                        className="flex-1 py-3 rounded-xl text-sm font-bold capitalize transition-all duration-200"
                        style={
                          theme === t
                            ? {
                                background: "linear-gradient(135deg,rgba(155,93,229,0.25),rgba(247,37,133,0.15))",
                                border: "1px solid rgba(155,93,229,0.6)",
                                color: "#e8d5ff",
                                boxShadow: "0 0 14px rgba(155,93,229,0.2)",
                              }
                            : {
                                background: "rgba(22,0,32,0.5)",
                                border: "1px solid rgba(61,16,96,0.6)",
                                color: "#7a5a9a",
                              }
                        }
                      >
                        {t === "dark" ? "🌙" : t === "light" ? "☀️" : "💻"} {t}
                      </button>
                    ))}
                  </div>
                </KuromiCard>

                <KuromiCard>
                  <h2 className="font-extrabold text-base mb-5 flex items-center gap-2" style={{ fontFamily: "'Fredoka One', cursive", color: "#c77dff" }}>
                    <span>✦</span> Accent Color
                  </h2>
                  <div className="flex gap-3 flex-wrap">
                    {accentColors.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => setAccentColor(c.id)}
                        title={c.label}
                        className="w-9 h-9 rounded-full transition-all duration-200 focus:outline-none"
                        style={{
                          background: c.hex,
                          boxShadow:
                            accentColor === c.id
                              ? `0 0 0 3px #0d0010, 0 0 0 5px ${c.hex}, 0 0 16px ${c.hex}`
                              : "none",
                          opacity: accentColor === c.id ? 1 : 0.55,
                          transform: accentColor === c.id ? "scale(1.2)" : "scale(1)",
                        }}
                      />
                    ))}
                  </div>
                  <p className="text-xs mt-3" style={{ color: "#5a3878" }}>
                    Selected: <span style={{ color: accentColors.find(c => c.id === accentColor)?.hex }}>{accentColors.find(c => c.id === accentColor)?.label}</span>
                  </p>
                </KuromiCard>

                <KuromiCard>
                  <h2 className="font-extrabold text-base mb-4 flex items-center gap-2" style={{ fontFamily: "'Fredoka One', cursive", color: "#c77dff" }}>
                    <span>📐</span> Layout
                  </h2>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold" style={{ color: "#e8d5ff" }}>Compact Mode</p>
                      <p className="text-xs mt-0.5" style={{ color: "#7a5a9a" }}>Reduce spacing and padding throughout the app</p>
                    </div>
                    <KuromiToggle on={compactMode} onToggle={() => setCompactMode(!compactMode)} />
                  </div>
                </KuromiCard>
              </div>
            )}

            {/* ── NOTIFICATIONS TAB ── */}
            {activeTab === "notifications" && (
              <KuromiCard>
                <h2 className="font-extrabold text-base mb-5 flex items-center gap-2" style={{ fontFamily: "'Fredoka One', cursive", color: "#c77dff" }}>
                  <span>🔔</span> Notification Preferences
                </h2>
                <div className="space-y-1">
                  {(Object.entries(notifications) as [keyof typeof notifications, boolean][]).map(([key, value], i, arr) => (
                    <div
                      key={key}
                      className="flex items-center justify-between py-3.5"
                      style={{
                        borderBottom: i < arr.length - 1 ? "1px solid rgba(61,16,96,0.5)" : "none",
                      }}
                    >
                      <div>
                        <p className="text-sm font-semibold" style={{ color: "#e8d5ff" }}>{notifLabels[key]}</p>
                        <p className="text-xs mt-0.5" style={{ color: "#7a5a9a" }}>{notifDesc[key]}</p>
                      </div>
                      <KuromiToggle on={value} onToggle={() => setNotifications({ ...notifications, [key]: !value })} />
                    </div>
                  ))}
                </div>
              </KuromiCard>
            )}

            {/* ── INTEGRATIONS TAB ── */}
            {activeTab === "integrations" && (
              <div className="space-y-4">
                {([
                  { key: "gmail" as const,    icon: "📧", label: "Gmail",           desc: "Connect Gmail to view emails in OpsFlow",  color: "#f72585" },
                  { key: "calendar" as const, icon: "📅", label: "Google Calendar", desc: "Sync calendar events with the dashboard",   color: "#9b5de5" },
                  { key: "discord" as const,  icon: "🎮", label: "Discord",         desc: "Monitor your server from OpsFlow",          color: "#c77dff" },
                ]).map((intg) => (
                  <KuromiCard key={intg.key}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span
                          className="text-2xl w-12 h-12 rounded-xl flex items-center justify-center"
                          style={{ background: "rgba(13,0,16,0.6)", border: "1px solid rgba(61,16,96,0.7)" }}
                        >
                          {intg.icon}
                        </span>
                        <div>
                          <p className="text-sm font-extrabold" style={{ color: intg.color }}>{intg.label}</p>
                          <p className="text-xs mt-0.5" style={{ color: "#7a5a9a" }}>{intg.desc}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setIntegrations({ ...integrations, [intg.key]: !integrations[intg.key] })}
                        className="px-4 py-1.5 rounded-xl text-sm font-bold transition-all duration-200 ml-4 flex-shrink-0"
                        style={
                          integrations[intg.key]
                            ? {
                                background: "rgba(61,16,96,0.5)",
                                border: "1px solid rgba(155,93,229,0.3)",
                                color: "#a78bca",
                              }
                            : {
                                background: "linear-gradient(135deg,#9b5de5,#f72585)",
                                border: "none",
                                color: "#fff",
                                boxShadow: "0 0 14px rgba(155,93,229,0.3)",
                              }
                        }
                        onMouseEnter={(e) => {
                          const btn = e.currentTarget as HTMLButtonElement;
                          if (integrations[intg.key]) {
                            btn.style.background = "rgba(247,37,133,0.12)";
                            btn.style.color = "#f72585";
                          } else {
                            btn.style.boxShadow = "0 0 20px rgba(247,37,133,0.4)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          const btn = e.currentTarget as HTMLButtonElement;
                          if (integrations[intg.key]) {
                            btn.style.background = "rgba(61,16,96,0.5)";
                            btn.style.color = "#a78bca";
                          } else {
                            btn.style.boxShadow = "0 0 14px rgba(155,93,229,0.3)";
                          }
                        }}
                      >
                        {integrations[intg.key] ? "Disconnect" : "Connect ★"}
                      </button>
                    </div>
                  </KuromiCard>
                ))}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}