"use client";

import { useState } from "react";

type Tab = "profile" | "appearance" | "notifications" | "integrations";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("profile");

  // Profile state
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    role: "",
    timezone: "Asia/Manila",
  });
  const [profileSaved, setProfileSaved] = useState(false);

  // Appearance state
  const [theme, setTheme] = useState<"dark" | "light" | "system">("dark");
  const [accentColor, setAccentColor] = useState("cyan");
  const [compactMode, setCompactMode] = useState(false);

  // Notifications state
  const [notifications, setNotifications] = useState({
    taskAssigned: true,
    taskCompleted: true,
    mentions: true,
    weeklyReport: false,
    systemAlerts: true,
  });

  // Integrations state
  const [integrations, setIntegrations] = useState({
    gmail: false,
    calendar: false,
    discord: false,
  });

  const handleProfileSave = () => {
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2000);
  };

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "profile", label: "Profile", icon: "👤" },
    { id: "appearance", label: "Appearance", icon: "🎨" },
    { id: "notifications", label: "Notifications", icon: "🔔" },
    { id: "integrations", label: "Integrations", icon: "🔗" },
  ];

  const accentColors = [
    { id: "cyan", label: "Cyan", class: "bg-cyan-400" },
    { id: "violet", label: "Violet", class: "bg-violet-500" },
    { id: "emerald", label: "Emerald", class: "bg-emerald-400" },
    { id: "amber", label: "Amber", class: "bg-amber-400" },
    { id: "rose", label: "Rose", class: "bg-rose-500" },
  ];

  return (
    <div className="flex-1 p-6 overflow-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Settings</h1>
        <p className="text-gray-400 text-sm">
          Manage your account and workspace preferences
        </p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar Tabs */}
        <nav className="w-48 flex-shrink-0">
          <ul className="space-y-1">
            {tabs.map((tab) => (
              <li key={tab.id}>
                <button
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
                    activeTab === tab.id
                      ? "bg-white/10 text-white"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <span>{tab.icon}</span>
                  {tab.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Panel */}
        <div className="flex-1 max-w-2xl">
          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className="space-y-6">
              <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-5">
                <h2 className="text-white font-semibold text-base">
                  Profile Information
                </h2>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center text-2xl font-bold text-white">
                    {profile.name ? profile.name[0].toUpperCase() : "?"}
                  </div>
                  <div>
                    <button className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors">
                      Change avatar
                    </button>
                    <p className="text-xs text-gray-500 mt-0.5">
                      JPG or PNG, max 2MB
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1.5 font-medium">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={profile.name}
                      onChange={(e) =>
                        setProfile({ ...profile, name: e.target.value })
                      }
                      placeholder="Your name"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1.5 font-medium">
                      Email
                    </label>
                    <input
                      type="email"
                      value={profile.email}
                      onChange={(e) =>
                        setProfile({ ...profile, email: e.target.value })
                      }
                      placeholder="you@example.com"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1.5 font-medium">
                      Role
                    </label>
                    <input
                      type="text"
                      value={profile.role}
                      onChange={(e) =>
                        setProfile({ ...profile, role: e.target.value })
                      }
                      placeholder="e.g. Operations Lead"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1.5 font-medium">
                      Timezone
                    </label>
                    <select
                      value={profile.timezone}
                      onChange={(e) =>
                        setProfile({ ...profile, timezone: e.target.value })
                      }
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-colors"
                    >
                      <option value="Asia/Manila">Asia/Manila (PHT)</option>
                      <option value="UTC">UTC</option>
                      <option value="America/New_York">
                        America/New_York (ET)
                      </option>
                      <option value="America/Los_Angeles">
                        America/Los_Angeles (PT)
                      </option>
                      <option value="Europe/London">Europe/London (GMT)</option>
                      <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={handleProfileSave}
                    className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-black text-sm font-semibold rounded-lg transition-colors"
                  >
                    {profileSaved ? "✓ Saved!" : "Save Changes"}
                  </button>
                </div>
              </div>

              {/* Danger zone */}
              <div className="bg-rose-500/5 border border-rose-500/20 rounded-xl p-6 space-y-4">
                <h2 className="text-rose-400 font-semibold text-base">
                  Danger Zone
                </h2>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white">Delete Account</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Permanently remove your account and all data
                    </p>
                  </div>
                  <button className="px-3 py-1.5 border border-rose-500/40 text-rose-400 hover:bg-rose-500/10 text-sm rounded-lg transition-colors">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Appearance Tab */}
          {activeTab === "appearance" && (
            <div className="space-y-6">
              <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-6">
                <h2 className="text-white font-semibold text-base">Theme</h2>
                <div className="flex gap-3">
                  {(["dark", "light", "system"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTheme(t)}
                      className={`flex-1 py-3 rounded-lg border text-sm font-medium capitalize transition-colors ${
                        theme === t
                          ? "border-cyan-500 bg-cyan-500/10 text-cyan-400"
                          : "border-white/10 text-gray-400 hover:border-white/20 hover:text-white"
                      }`}
                    >
                      {t === "dark" ? "🌙" : t === "light" ? "☀️" : "💻"}{" "}
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
                <h2 className="text-white font-semibold text-base">
                  Accent Color
                </h2>
                <div className="flex gap-3">
                  {accentColors.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setAccentColor(c.id)}
                      title={c.label}
                      className={`w-8 h-8 rounded-full ${c.class} transition-all ${
                        accentColor === c.id
                          ? "ring-2 ring-offset-2 ring-offset-gray-900 ring-white scale-110"
                          : "opacity-60 hover:opacity-100"
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
                <h2 className="text-white font-semibold text-base">Layout</h2>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white">Compact Mode</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Reduce spacing and padding throughout the app
                    </p>
                  </div>
                  <button
                    onClick={() => setCompactMode(!compactMode)}
                    className={`relative w-11 h-6 rounded-full transition-colors ${
                      compactMode ? "bg-cyan-500" : "bg-white/10"
                    }`}
                  >
                    <span
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        compactMode ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === "notifications" && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-5">
              <h2 className="text-white font-semibold text-base">
                Notification Preferences
              </h2>
              {(
                Object.entries(notifications) as [
                  keyof typeof notifications,
                  boolean
                ][]
              ).map(([key, value]) => {
                const labels: Record<keyof typeof notifications, string> = {
                  taskAssigned: "Task Assigned to Me",
                  taskCompleted: "Task Completed",
                  mentions: "Mentions & Comments",
                  weeklyReport: "Weekly Summary Report",
                  systemAlerts: "System Alerts",
                };
                const descriptions: Record<keyof typeof notifications, string> =
                  {
                    taskAssigned: "Get notified when someone assigns you a task",
                    taskCompleted:
                      "Get notified when a task you own is completed",
                    mentions:
                      "Get notified when you're mentioned in a comment",
                    weeklyReport:
                      "Receive a weekly digest of workspace activity",
                    systemAlerts:
                      "Important alerts about your account and workspace",
                  };
                return (
                  <div
                    key={key}
                    className="flex items-center justify-between py-3 border-b border-white/5 last:border-0"
                  >
                    <div>
                      <p className="text-sm text-white">{labels[key]}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {descriptions[key]}
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        setNotifications({ ...notifications, [key]: !value })
                      }
                      className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
                        value ? "bg-cyan-500" : "bg-white/10"
                      }`}
                    >
                      <span
                        className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          value ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Integrations Tab */}
          {activeTab === "integrations" && (
            <div className="space-y-4">
              {[
                {
                  key: "gmail" as const,
                  icon: "📧",
                  label: "Gmail",
                  description: "Connect your Gmail to view emails in OpsFlow",
                  color: "text-red-400",
                },
                {
                  key: "calendar" as const,
                  icon: "📅",
                  label: "Google Calendar",
                  description: "Sync your calendar events with the dashboard",
                  color: "text-blue-400",
                },
                {
                  key: "discord" as const,
                  icon: "🎮",
                  label: "Discord",
                  description:
                    "Connect Discord to monitor your server from OpsFlow",
                  color: "text-violet-400",
                },
              ].map((integration) => (
                <div
                  key={integration.key}
                  className="bg-white/5 border border-white/10 rounded-xl p-5 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">{integration.icon}</span>
                    <div>
                      <p
                        className={`text-sm font-semibold ${integration.color}`}
                      >
                        {integration.label}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {integration.description}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      setIntegrations({
                        ...integrations,
                        [integration.key]: !integrations[integration.key],
                      })
                    }
                    className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      integrations[integration.key]
                        ? "bg-white/10 text-white hover:bg-white/5"
                        : "bg-cyan-500 hover:bg-cyan-400 text-black"
                    }`}
                  >
                    {integrations[integration.key] ? "Disconnect" : "Connect"}
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
