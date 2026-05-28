"use client";
// SAVE AS: app/(dashboard)/page.tsx

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useTasks, selectFocusTasks, selectOverdueTasks, selectCompletedToday } from "@/hooks/useTasks";
import type { Task, Priority, TaskStatus } from "@/types/database";

export const dynamic = "force-dynamic";

// ─── Types ────────────────────────────────────────────────────
interface CalendarEvent {
  time: string;
  title: string;
  duration: string;
  type: "meeting" | "important" | "deadline";
}

// ─── Config ───────────────────────────────────────────────────
const PRIORITY_CFG: Record<Priority, { label: string; color: string; bg: string }> = {
  urgent: { label: "Urgent", color: "#FF4444", bg: "rgba(255,68,68,0.12)" },
  high:   { label: "High",   color: "#FF8C42", bg: "rgba(255,140,66,0.12)" },
  medium: { label: "Medium", color: "#4A9EFF", bg: "rgba(74,158,255,0.12)" },
  low:    { label: "Low",    color: "#6B7280", bg: "rgba(107,114,128,0.12)" },
};

// Placeholder calendar events — replaced by Google Calendar in the next phase
const MOCK_EVENTS: CalendarEvent[] = [
  { time: "9:00 AM",  title: "Team Standup",        duration: "30m", type: "meeting" },
  { time: "11:00 AM", title: "Product Review",       duration: "1h",  type: "meeting" },
  { time: "2:00 PM",  title: "Investor Update Call", duration: "45m", type: "important" },
  { time: "4:00 PM",  title: "Team Retro",           duration: "1h",  type: "meeting" },
];

// ─── Sub-components ───────────────────────────────────────────
function StatCard({
  label, value, sub, color, icon,
}: {
  label: string; value: string | number; sub?: string; color: string; icon: string;
}) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 14, padding: "18px 20px", flex: 1,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.35)", marginBottom: 6, fontWeight: 600, letterSpacing: "0.05em" }}>
            {label.toUpperCase()}
          </div>
          <div style={{ fontSize: 30, fontWeight: 700, color, lineHeight: 1 }}>{value}</div>
          {sub && <div style={{ fontSize: 12, color: "rgba(255,255,255,0.28)", marginTop: 5 }}>{sub}</div>}
        </div>
        <span style={{ fontSize: 22, opacity: 0.55 }}>{icon}</span>
      </div>
    </div>
  );
}

function FocusTaskRow({
  task, onToggle,
}: {
  task: Task; onToggle: (id: string) => void;
}) {
  const isDone = task.status === "done";
  const p = PRIORITY_CFG[task.priority];
  const today = new Date().toISOString().split("T")[0];

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      padding: "10px 14px", borderRadius: 10, marginBottom: 6,
      background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)",
      opacity: isDone ? 0.45 : 1, transition: "opacity 0.2s",
    }}>
      {/* Checkbox */}
      <div
        onClick={() => onToggle(task.id)}
        style={{
          width: 18, height: 18, borderRadius: 5, flexShrink: 0, cursor: "pointer",
          border: isDone ? "2px solid #22C55E" : "2px solid rgba(255,255,255,0.2)",
          background: isDone ? "#22C55E" : "transparent",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 10, color: "#fff", transition: "all 0.15s",
        }}
      >{isDone && "✓"}</div>

      {/* Title */}
      <span style={{
        flex: 1, fontSize: 13.5,
        color: isDone ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.85)",
        textDecoration: isDone ? "line-through" : "none",
      }}>{task.title}</span>

      {/* Priority */}
      <span style={{
        padding: "2px 8px", borderRadius: 100, fontSize: 11, fontWeight: 600,
        background: p.bg, color: p.color, flexShrink: 0,
      }}>{p.label}</span>

      {/* Due */}
      {task.due_date && (
        <span style={{ fontSize: 11.5, color: "rgba(255,255,255,0.28)", fontFamily: "monospace", flexShrink: 0 }}>
          {task.due_date === today ? "Today" : task.due_date.slice(5)}
        </span>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────
export default function DashboardPage() {
  const [userName, setUserName] = useState("there");
  const { tasks, loading, toggleStatus } = useTasks();

  // Get user's first name for greeting
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();
      if (data?.full_name) {
        setUserName(data.full_name.split(" ")[0]);
      }
    });
  }, []);

  // Derived stats
  const focusTasks     = selectFocusTasks(tasks);
  const overdueTasks   = selectOverdueTasks(tasks);
  const completedToday = selectCompletedToday(tasks);
  const dueToday = tasks.filter(t => {
    const today = new Date().toISOString().split("T")[0];
    return t.due_date === today && t.status !== "done";
  });

  // Greeting based on time of day
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  // Formatted date
  const dateStr = new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", color: "rgba(255,255,255,0.3)", fontSize: 14 }}>
        Loading your workspace...
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* ── Header ─────────────────────────────────────────── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#fff", marginBottom: 4 }}>
            {greeting}, {userName} 👋
          </h1>
          <div style={{ fontSize: 13.5, color: "rgba(255,255,255,0.35)" }}>{dateStr}</div>
        </div>

        {overdueTasks.length > 0 && (
          <a href="/tasks" style={{
            background: "rgba(255,68,68,0.1)", border: "1px solid rgba(255,68,68,0.25)",
            borderRadius: 10, padding: "8px 16px", fontSize: 13,
            color: "#FF6B6B", textDecoration: "none", display: "flex", alignItems: "center", gap: 6,
          }}>
            ⚠️ {overdueTasks.length} overdue task{overdueTasks.length > 1 ? "s" : ""}
          </a>
        )}
      </div>

      {/* ── Stats row ──────────────────────────────────────── */}
      <div style={{ display: "flex", gap: 14 }}>
        <StatCard
          label="Completed Today"
          value={completedToday.length}
          sub="tasks done"
          color="#22C55E"
          icon="✅"
        />
        <StatCard
          label="Due Today"
          value={dueToday.length}
          sub="need attention"
          color="#FF8C42"
          icon="🎯"
        />
        <StatCard
          label="In Focus"
          value={focusTasks.length}
          sub="starred tasks"
          color="#4A9EFF"
          icon="⚡"
        />
        <StatCard
          label="Total Active"
          value={tasks.filter(t => t.status !== "done" && t.status !== "cancelled").length}
          sub="across all tasks"
          color="#A78BFA"
          icon="📋"
        />
      </div>

      {/* ── Main 2-col grid ────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 16 }}>

        {/* Left column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Daily Focus */}
          <div style={{
            background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 16, padding: 20,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>⚡ Daily Focus</div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>
                  {focusTasks.filter(t => t.status === "done").length}/{focusTasks.length} done
                </span>
                <a href="/tasks" style={{ fontSize: 12, color: "#4A9EFF", textDecoration: "none" }}>View all →</a>
              </div>
            </div>

            {focusTasks.length === 0 ? (
              <div style={{ textAlign: "center", padding: "24px 0" }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>🎯</div>
                <div style={{ fontSize: 13.5, color: "rgba(255,255,255,0.3)", marginBottom: 12 }}>
                  No focus tasks yet.
                </div>
                <a href="/tasks" style={{
                  fontSize: 13, color: "#4A9EFF", textDecoration: "none",
                  background: "rgba(74,158,255,0.1)", padding: "6px 14px",
                  borderRadius: 8, border: "1px solid rgba(74,158,255,0.2)",
                }}>
                  ★ Star tasks to add them here
                </a>
              </div>
            ) : (
              focusTasks.map(task => (
                <FocusTaskRow key={task.id} task={task} onToggle={toggleStatus} />
              ))
            )}
          </div>

          {/* All tasks quick view */}
          <div style={{
            background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 16, padding: 20,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>📋 All Tasks</div>
              <a href="/tasks" style={{ fontSize: 12, color: "#4A9EFF", textDecoration: "none" }}>Manage →</a>
            </div>

            {/* Status breakdown */}
            <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
              {(["todo", "in_progress", "done", "blocked"] as TaskStatus[]).map(s => {
                const count = tasks.filter(t => t.status === s).length;
                const colors: Record<TaskStatus, string> = {
                  todo: "#6B7280", in_progress: "#4A9EFF", done: "#22C55E",
                  blocked: "#FF4444", cancelled: "#6B7280",
                };
                const labels: Record<TaskStatus, string> = {
                  todo: "To Do", in_progress: "In Progress", done: "Done",
                  blocked: "Blocked", cancelled: "Cancelled",
                };
                return (
                  <div key={s} style={{ flex: 1, background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "10px 12px", textAlign: "center" }}>
                    <div style={{ fontSize: 20, fontWeight: 700, color: colors[s] }}>{count}</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>{labels[s]}</div>
                  </div>
                );
              })}
            </div>

            {/* Recent non-focus tasks */}
            {tasks
              .filter(t => !t.is_focus && t.status !== "done")
              .slice(0, 4)
              .map(task => (
                <FocusTaskRow key={task.id} task={task} onToggle={toggleStatus} />
              ))}

            {tasks.filter(t => !t.is_focus && t.status !== "done").length === 0 && (
              <div style={{ textAlign: "center", padding: "16px 0", color: "rgba(255,255,255,0.2)", fontSize: 13 }}>
                All caught up! ✨
              </div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Calendar widget */}
          <div style={{
            background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 16, padding: 20,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>📅 Today</div>
              <span style={{ fontSize: 11.5, color: "rgba(255,255,255,0.25)", background: "rgba(255,255,255,0.05)", padding: "3px 8px", borderRadius: 6 }}>
                Calendar coming soon
              </span>
            </div>

            {MOCK_EVENTS.map((evt, i) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 10 }}>
                <div style={{ width: 60, fontSize: 11, color: "rgba(255,255,255,0.35)", fontFamily: "monospace", paddingTop: 2, flexShrink: 0 }}>
                  {evt.time}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: 13, fontWeight: evt.type === "important" ? 600 : 400,
                    color: evt.type === "important" ? "#FF8C42" : "rgba(255,255,255,0.78)",
                  }}>{evt.title}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", marginTop: 1 }}>{evt.duration}</div>
                </div>
                <div style={{
                  width: 7, height: 7, borderRadius: "50%", flexShrink: 0, marginTop: 5,
                  background: evt.type === "important" ? "#FF8C42" : "#4A9EFF",
                }} />
              </div>
            ))}
          </div>

          {/* Quick capture */}
          <div style={{
            background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 16, padding: 20,
          }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#fff", marginBottom: 12 }}>⚡ Quick Capture</div>
            <QuickCapture />
          </div>

          {/* Integrations status */}
          <div style={{
            background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 16, padding: 20,
          }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#fff", marginBottom: 12 }}>🔌 Integrations</div>
            {[
              { label: "Discord",  icon: "💬", status: "Ready to connect", color: "#7289DA", connected: false },
              { label: "Gmail",    icon: "📧", status: "Connected via OAuth", color: "#22C55E", connected: true },
              { label: "Calendar", icon: "📅", status: "Connected via OAuth", color: "#22C55E", connected: true },
            ].map(item => (
              <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <span style={{ fontSize: 16 }}>{item.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", fontWeight: 500 }}>{item.label}</div>
                  <div style={{ fontSize: 11, color: item.connected ? "#22C55E" : "rgba(255,255,255,0.3)" }}>{item.status}</div>
                </div>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: item.connected ? "#22C55E" : "rgba(255,255,255,0.15)" }} />
              </div>
            ))}
            <a href="/settings" style={{
              display: "block", textAlign: "center", marginTop: 8, fontSize: 12.5,
              color: "#4A9EFF", textDecoration: "none",
              background: "rgba(74,158,255,0.08)", padding: "7px",
              borderRadius: 8, border: "1px solid rgba(74,158,255,0.15)",
            }}>Manage integrations →</a>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Quick capture widget ─────────────────────────────────────
function QuickCapture() {
  const { createTask } = useTasks();
  const [value, setValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    if (!value.trim() || saving) return;
    setSaving(true);
    try {
      await createTask({
        title: value.trim(),
        priority: "medium",
        source: "manual",
        status: "todo",
      });
      setValue("");
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <textarea
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSave(); }}
        placeholder="Brain dump something... (⌘+Enter to save as task)"
        rows={3}
        style={{
          width: "100%", background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10,
          padding: "10px 12px", color: "#fff", fontSize: 13.5, lineHeight: 1.6,
          outline: "none", resize: "none", fontFamily: "inherit",
          boxSizing: "border-box",
        }}
      />
      <button
        onClick={handleSave}
        disabled={!value.trim() || saving}
        style={{
          width: "100%", marginTop: 8,
          background: saved ? "#22C55E" : value.trim() ? "#4A9EFF" : "rgba(255,255,255,0.06)",
          border: "none", borderRadius: 9, padding: "9px",
          color: "#fff", fontSize: 13, fontWeight: 600,
          cursor: value.trim() ? "pointer" : "default",
          transition: "background 0.2s",
        }}
      >
        {saved ? "✓ Saved as task!" : saving ? "Saving..." : "+ Add as Task"}
      </button>
    </div>
  );
}