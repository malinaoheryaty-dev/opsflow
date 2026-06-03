"use client";
// SAVE AS: app/(dashboard)/settings/page.tsx

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useOpsTheme } from "@/components/theme/ThemeProvider";

type Theme = "dark" | "light";
type SaveState = "idle" | "saving" | "saved" | "error";

type NotificationPrefs = {
  taskAssigned: boolean;
  taskCompleted: boolean;
  mentions: boolean;
  weeklyReport: boolean;
  systemAlerts: boolean;
};

type WorkspacePrefs = {
  showMiniCalendar: boolean;
  showGmailWidget: boolean;
  showAiPanel: boolean;
};

type Preferences = {
  theme: Theme;
  accentColor: "purple";
  compactMode: boolean;
  ai_enabled: boolean;
  eod_report_time: string;
  daily_focus_limit: number;
  notifications: NotificationPrefs;
  workspace: WorkspacePrefs;
};

type ProfileRow = {
  full_name: string | null;
  email: string | null;
  timezone: string | null;
  preferences: Partial<Preferences> | null;
  gmail_access_token: string | null;
  google_calendar_token: string | null;
  discord_access_token: string | null;
};

const DEFAULT_NOTIFICATIONS: NotificationPrefs = {
  taskAssigned: true,
  taskCompleted: true,
  mentions: true,
  weeklyReport: false,
  systemAlerts: true,
};

const DEFAULT_WORKSPACE: WorkspacePrefs = {
  showMiniCalendar: true,
  showGmailWidget: true,
  showAiPanel: true,
};

const DEFAULT_PREFERENCES: Preferences = {
  theme: "dark",
  accentColor: "purple",
  compactMode: false,
  ai_enabled: true,
  eod_report_time: "17:00",
  daily_focus_limit: 5,
  notifications: DEFAULT_NOTIFICATIONS,
  workspace: DEFAULT_WORKSPACE,
};

function mergePreferences(raw: Partial<Preferences> | null | undefined): Preferences {
  return {
    ...DEFAULT_PREFERENCES,
    ...(raw ?? {}),
    accentColor: "purple",
    notifications: {
      ...DEFAULT_NOTIFICATIONS,
      ...(raw?.notifications ?? {}),
    },
    workspace: {
      ...DEFAULT_WORKSPACE,
      ...(raw?.workspace ?? {}),
    },
  };
}

function SettingsCard({
  title,
  subtitle,
  icon,
  children,
}: {
  title: string;
  subtitle: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <section className="kuromi-card settings-card">
      <div className="settings-card-head">
        <div className="settings-icon">{icon}</div>
        <div>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
      </div>
      <div className="settings-card-body">{children}</div>
    </section>
  );
}

function Toggle({
  on,
  onChange,
  disabled = false,
}: {
  on: boolean;
  onChange: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      disabled={disabled}
      className={`settings-toggle ${on ? "on" : ""}`}
      aria-pressed={on}
    >
      <span />
    </button>
  );
}

function IntegrationStatus({
  icon,
  title,
  description,
  connected,
  comingSoon = false,
}: {
  icon: string;
  title: string;
  description: string;
  connected: boolean;
  comingSoon?: boolean;
}) {
  return (
    <div className="settings-integration-row">
      <div className="settings-integration-icon">{icon}</div>
      <div>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
      <span
        className={
          connected
            ? "settings-status connected"
            : comingSoon
              ? "settings-status soon"
              : "settings-status"
        }
      >
        {connected ? "Connected" : comingSoon ? "Coming soon" : "Not connected"}
      </span>
    </div>
  );
}

export default function SettingsPage() {
  const supabase = useMemo(() => createClient(), []);
  const { theme, setTheme } = useOpsTheme();

  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState("");
  const [fullName, setFullName] = useState("");
  const [originalName, setOriginalName] = useState("");
  const [timezone, setTimezone] = useState("Asia/Manila");
  const [preferences, setPreferences] = useState<Preferences>(DEFAULT_PREFERENCES);
  const [loading, setLoading] = useState(true);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [message, setMessage] = useState("");

  const [gmailConnected, setGmailConnected] = useState(false);
  const [calendarConnected, setCalendarConnected] = useState(false);
  const [discordConnected, setDiscordConnected] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadProfile() {
      setLoading(true);
      setMessage("");

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (!mounted) return;

      if (userError || !user) {
        setMessage("You must be logged in to view settings.");
        setSaveState("error");
        setLoading(false);
        return;
      }

      setEmail(user.email ?? "");
      setUserId(user.id);

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select(
          `
          full_name,
          email,
          timezone,
          preferences,
          gmail_access_token,
          google_calendar_token,
          discord_access_token
        `,
        )
        .eq("id", user.id)
        .maybeSingle<ProfileRow>();

      if (!mounted) return;

      if (profileError) {
        console.error(profileError);
        setMessage("Could not load profile settings.");
        setSaveState("error");
        setLoading(false);
        return;
      }

      const name =
        profile?.full_name ??
        user.user_metadata?.full_name ??
        user.user_metadata?.name ??
        "";

      const mergedPrefs = mergePreferences(profile?.preferences);

      setFullName(name);
      setOriginalName(name);
      setTimezone(profile?.timezone ?? "Asia/Manila");
      setPreferences(mergedPrefs);
      setTheme(mergedPrefs.theme);

      setGmailConnected(Boolean(profile?.gmail_access_token));
      setCalendarConnected(Boolean(profile?.google_calendar_token));
      setDiscordConnected(Boolean(profile?.discord_access_token));

      setLoading(false);
    }

    loadProfile();

    return () => {
      mounted = false;
    };
  }, [supabase, setTheme]);

  const hasProfileChanges = fullName.trim() !== originalName.trim();

  async function updatePreferences(nextPreferences: Preferences, successMessage = "Preferences saved ✦") {
    if (!userId) return;

    setPreferences(nextPreferences);
    setSaveState("saving");
    setMessage("");

    const { error } = await supabase
      .from("profiles")
      .update({
        preferences: nextPreferences,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) {
      console.error(error);
      setSaveState("error");
      setMessage("Could not save preferences.");
      return;
    }

    setSaveState("saved");
    setMessage(successMessage);

    setTimeout(() => {
      setSaveState("idle");
      setMessage("");
    }, 1800);
  }

  async function handleThemeChange(nextTheme: Theme) {
    setTheme(nextTheme);

    await updatePreferences(
      {
        ...preferences,
        theme: nextTheme,
        accentColor: "purple",
      },
      `${nextTheme === "dark" ? "Dark" : "Light"} mode saved ✦`,
    );
  }

  async function handleCompactModeChange() {
    await updatePreferences(
      {
        ...preferences,
        compactMode: !preferences.compactMode,
        accentColor: "purple",
      },
      "Layout preference saved ✦",
    );
  }

  async function handleNotificationChange(key: keyof NotificationPrefs) {
    await updatePreferences(
      {
        ...preferences,
        notifications: {
          ...preferences.notifications,
          [key]: !preferences.notifications[key],
        },
      },
      "Notification preference saved ✦",
    );
  }

  async function handleWorkspaceChange(key: keyof WorkspacePrefs) {
    await updatePreferences(
      {
        ...preferences,
        workspace: {
          ...preferences.workspace,
          [key]: !preferences.workspace[key],
        },
      },
      "Workspace preference saved ✦",
    );
  }

  async function handleSaveProfile() {
    if (!userId) return;

    const cleanName = fullName.trim();

    if (!cleanName) {
      setSaveState("error");
      setMessage("Display name cannot be empty.");
      return;
    }

    setSaveState("saving");
    setMessage("");

    try {
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert(
          {
            id: userId,
            full_name: cleanName,
            email,
            timezone,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id" },
        );

      if (profileError) throw profileError;

      const { error: metadataError } = await supabase.auth.updateUser({
        data: { full_name: cleanName, name: cleanName },
      });

      if (metadataError) throw metadataError;

      setOriginalName(cleanName);
      setSaveState("saved");
      setMessage("Profile updated successfully ✦");

      window.dispatchEvent(
        new CustomEvent("opsflow-profile-updated", {
          detail: { full_name: cleanName },
        }),
      );

      setTimeout(() => {
        setSaveState("idle");
        setMessage("");
      }, 2500);
    } catch (error) {
      console.error(error);
      setSaveState("error");
      setMessage("Could not save profile. Check your Supabase profiles table.");
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <main className="kuromi-page settings-page">
      <div className="kuromi-bg-orb orb-one" />
      <div className="kuromi-bg-orb orb-two" />

      <header className="kuromi-topbar">
        <div>
          <div className="panel-eyebrow">OpsFlow Control Room</div>
          <h1>
            Settings <span>Center</span> ✦
          </h1>
          <p>Manage profile, theme, notifications, workspace, and integrations.</p>
        </div>

        <div className="topbar-actions">
          <div className="search-pill">⌕ Search settings...</div>
          <button className="icon-btn" type="button">
            ☾
          </button>
        </div>
      </header>

      <section className="settings-grid">
        <div className="settings-main-stack">
          <SettingsCard
            title="Profile"
            subtitle="Update the name and timezone shown across OpsFlow."
            icon="✦"
          >
            {loading ? (
              <div className="settings-loading">Loading profile...</div>
            ) : (
              <>
                <label className="settings-label" htmlFor="fullName">
                  Display name
                </label>
                <input
                  id="fullName"
                  value={fullName}
                  onChange={(event) => {
                    setFullName(event.target.value);
                    setSaveState("idle");
                    setMessage("");
                  }}
                  placeholder="Enter your name"
                  className="settings-input"
                />

                <label className="settings-label" htmlFor="email">
                  Email
                </label>
                <input id="email" value={email} disabled className="settings-input disabled" />

                <label className="settings-label" htmlFor="timezone">
                  Timezone
                </label>
                <select
                  id="timezone"
                  value={timezone}
                  onChange={(event) => {
                    setTimezone(event.target.value);
                    setSaveState("idle");
                    setMessage("");
                  }}
                  className="settings-input"
                >
                  <option value="Asia/Manila">Asia/Manila (PHT)</option>
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">America/New_York (ET)</option>
                  <option value="America/Los_Angeles">America/Los_Angeles (PT)</option>
                  <option value="Europe/London">Europe/London (GMT)</option>
                  <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
                </select>

                <div className="settings-actions">
                  <button
                    type="button"
                    onClick={() => {
                      setFullName(originalName);
                      setSaveState("idle");
                      setMessage("");
                    }}
                    disabled={!hasProfileChanges || saveState === "saving"}
                    className="settings-secondary-btn"
                  >
                    Reset Name
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveProfile}
                    disabled={saveState === "saving"}
                    className="settings-primary-btn"
                  >
                    {saveState === "saving" ? "Saving..." : "Save profile"}
                  </button>
                </div>

                {message && (
                  <p
                    className={
                      saveState === "error"
                        ? "settings-message error"
                        : "settings-message success"
                    }
                  >
                    {message}
                  </p>
                )}
              </>
            )}
          </SettingsCard>

          <SettingsCard
            title="Appearance"
            subtitle="Purple-first dark and light modes for your workspace."
            icon="☾"
          >
            <div className="theme-toggle-grid">
              <button
                type="button"
                onClick={() => handleThemeChange("dark")}
                className={`theme-option ${theme === "dark" ? "active" : ""}`}
              >
                <div className="theme-preview dark-preview">
                  <span />
                  <span />
                  <span />
                </div>
                <strong>Dark Mode</strong>
                <small>Deep black with violet glow</small>
              </button>

              <button
                type="button"
                onClick={() => handleThemeChange("light")}
                className={`theme-option ${theme === "light" ? "active" : ""}`}
              >
                <div className="theme-preview light-preview">
                  <span />
                  <span />
                  <span />
                </div>
                <strong>Light Mode</strong>
                <small>Soft lavender and clean purple</small>
              </button>
            </div>

            <div className="settings-row">
              <div>
                <h3>Compact mode</h3>
                <p>Reduce spacing in supported widgets.</p>
              </div>
              <Toggle on={preferences.compactMode} onChange={handleCompactModeChange} />
            </div>

            <p className="settings-hint">
              Theme is saved locally and in your Supabase profile preferences.
            </p>
          </SettingsCard>

          <SettingsCard
            title="Notifications"
            subtitle="Control which OpsFlow updates you want to receive."
            icon="🔔"
          >
            {(
              [
                ["taskAssigned", "Task assigned", "Notify me when a task is assigned to me."],
                ["taskCompleted", "Task completed", "Notify me when a tracked task is completed."],
                ["mentions", "Mentions", "Notify me when I am mentioned."],
                ["weeklyReport", "Weekly report", "Send me a weekly workspace summary."],
                ["systemAlerts", "System alerts", "Important security and system notifications."],
              ] as [keyof NotificationPrefs, string, string][]
            ).map(([key, title, desc]) => (
              <div className="settings-row" key={key}>
                <div>
                  <h3>{title}</h3>
                  <p>{desc}</p>
                </div>
                <Toggle
                  on={preferences.notifications[key]}
                  onChange={() => handleNotificationChange(key)}
                />
              </div>
            ))}
          </SettingsCard>

          <SettingsCard
            title="Workspace"
            subtitle="Choose which dashboard widgets should be shown by default."
            icon="▦"
          >
            {(
              [
                ["showMiniCalendar", "Mini calendar", "Keep mini calendar visible on the dashboard."],
                ["showGmailWidget", "Gmail widget", "Keep Gmail widget visible below calendar."],
                ["showAiPanel", "AI panel", "Show the AI assistant/activity panel."],
              ] as [keyof WorkspacePrefs, string, string][]
            ).map(([key, title, desc]) => (
              <div className="settings-row" key={key}>
                <div>
                  <h3>{title}</h3>
                  <p>{desc}</p>
                </div>
                <Toggle
                  on={preferences.workspace[key]}
                  onChange={() => handleWorkspaceChange(key)}
                />
              </div>
            ))}
          </SettingsCard>

          <SettingsCard
            title="Integrations"
            subtitle="View real connection status from your OpsFlow profile."
            icon="🔗"
          >
            <div className="settings-integration-list">
              <IntegrationStatus
                icon="📧"
                title="Gmail"
                description="Used by the Gmail inbox widget."
                connected={gmailConnected}
              />
              <IntegrationStatus
                icon="📅"
                title="Google Calendar"
                description="Used by the mini calendar widget."
                connected={calendarConnected}
              />
              <IntegrationStatus
                icon="🎮"
                title="Discord"
                description="Planned last, after the full UI is complete."
                connected={discordConnected}
                comingSoon={!discordConnected}
              />
            </div>
          </SettingsCard>
        </div>

        <aside className="settings-side-stack">
          <section className="kuromi-card settings-profile-card">
            <div className="settings-avatar">
              {fullName ? fullName.slice(0, 1).toUpperCase() : "✦"}
            </div>
            <h2>{fullName || "OpsFlow User"}</h2>
            <p>{email || "Loading email..."}</p>

            <div className="settings-mini-status">
              <div>
                <strong>{theme === "dark" ? "Dark" : "Light"}</strong>
                <span>Theme</span>
              </div>
              <div>
                <strong>{timezone.replace("_", " ")}</strong>
                <span>Timezone</span>
              </div>
            </div>
          </section>

          <section className="kuromi-card settings-info-card">
            <div className="panel-title-row">
              <span>Functional Settings</span>
              <span>✦</span>
            </div>
            <ul>
              <li>Username saves to Supabase profile.</li>
              <li>Theme saves to preferences JSON.</li>
              <li>Notifications save to preferences JSON.</li>
              <li>Integration statuses use real token columns.</li>
            </ul>
          </section>

          <section className="kuromi-card settings-info-card">
            <div className="panel-title-row">
              <span>Account</span>
              <span>☾</span>
            </div>
            <button type="button" onClick={handleSignOut} className="settings-danger-btn">
              Sign out
            </button>
          </section>
        </aside>
      </section>
    </main>
  );
}
