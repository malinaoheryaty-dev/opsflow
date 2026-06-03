"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useOpsTheme } from "@/components/theme/ThemeProvider";

type SaveState = "idle" | "saving" | "saved" | "error";

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

export default function SettingsPage() {
  const supabase = useMemo(() => createClient(), []);
  const { theme, setTheme } = useOpsTheme();

  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState("");
  const [fullName, setFullName] = useState("");
  const [originalName, setOriginalName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadProfile() {
      setLoading(true);

      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (!mounted) return;

      if (userError || !user) {
        setMessage("You must be logged in to view settings.");
        setSaveState("error");
        setLoading(false);
        return;
      }

      setEmail(user.email ?? "");
      setUserId(user.id);

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name,email")
        .eq("id", user.id)
        .maybeSingle();

      const name =
        profile?.full_name ??
        user.user_metadata?.full_name ??
        user.user_metadata?.name ??
        "";

      if (!mounted) return;

      setFullName(name);
      setOriginalName(name);
      setLoading(false);
    }

    loadProfile();

    return () => {
      mounted = false;
    };
  }, [supabase]);

  const hasNameChanges = fullName.trim() !== originalName.trim();

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
          <p>Change your username and switch between dark and light mode.</p>
        </div>

        <div className="topbar-actions">
          <div className="search-pill">⌕ Search settings...</div>
          <button className="icon-btn" type="button">☾</button>
        </div>
      </header>

      <section className="settings-grid">
        <div className="settings-main-stack">
          <SettingsCard
            title="Profile"
            subtitle="Update the name shown in your OpsFlow dashboard."
            icon="✦"
          >
            {loading ? (
              <div className="settings-loading">Loading profile...</div>
            ) : (
              <>
                <label className="settings-label" htmlFor="fullName">Display name</label>
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

                <label className="settings-label" htmlFor="email">Email</label>
                <input id="email" value={email} disabled className="settings-input disabled" />

                <div className="settings-actions">
                  <button
                    type="button"
                    onClick={() => {
                      setFullName(originalName);
                      setSaveState("idle");
                      setMessage("");
                    }}
                    disabled={!hasNameChanges || saveState === "saving"}
                    className="settings-secondary-btn"
                  >
                    Reset
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveProfile}
                    disabled={!hasNameChanges || saveState === "saving"}
                    className="settings-primary-btn"
                  >
                    {saveState === "saving" ? "Saving..." : "Save profile"}
                  </button>
                </div>

                {message && (
                  <p className={saveState === "error" ? "settings-message error" : "settings-message success"}>
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
                onClick={() => setTheme("dark")}
                className={`theme-option ${theme === "dark" ? "active" : ""}`}
              >
                <div className="theme-preview dark-preview"><span /><span /><span /></div>
                <strong>Dark Mode</strong>
                <small>Deep black with violet glow</small>
              </button>

              <button
                type="button"
                onClick={() => setTheme("light")}
                className={`theme-option ${theme === "light" ? "active" : ""}`}
              >
                <div className="theme-preview light-preview"><span /><span /><span /></div>
                <strong>Light Mode</strong>
                <small>Soft lavender and clean purple</small>
              </button>
            </div>

            <p className="settings-hint">
              Your theme is saved in this browser and loads automatically.
            </p>
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
              <div><strong>{theme === "dark" ? "Dark" : "Light"}</strong><span>Theme</span></div>
              <div><strong>Live</strong><span>Status</span></div>
            </div>
          </section>

          <section className="kuromi-card settings-info-card">
            <div className="panel-title-row"><span>Functional Settings</span><span>✦</span></div>
            <ul>
              <li>Username saves to Supabase profile.</li>
              <li>Auth metadata syncs after saving.</li>
              <li>Dark/light mode persists locally.</li>
              <li>Gmail, Calendar, and Tasks stay untouched.</li>
            </ul>
          </section>
        </aside>
      </section>
    </main>
  );
}
