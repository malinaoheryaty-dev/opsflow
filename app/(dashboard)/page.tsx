"use client";
// SAVE AS: app/(dashboard)/page.tsx

import { useEffect, useState, Suspense } from "react";
import { createClient } from "@/lib/supabase/client";
import { useTasks, selectFocusTasks, selectOverdueTasks, selectCompletedToday } from "@/hooks/useTasks";
import GmailWidget from "@/components/gmail/GmailWidget";
import type { Task, Priority, TaskStatus } from "@/types/database";

export const dynamic = "force-dynamic";

const K = {
  bg:       "#0a0a0f",
  surface:  "#12101a",
  surface2: "#1a1726",
  border:   "rgba(180,130,255,0.12)",
  border2:  "rgba(255,255,255,0.06)",
  pink:     "#ff6eb4",
  purple:   "#b46fff",
  lavender: "#d4aaff",
  white:    "#f0eaff",
  muted:    "rgba(240,234,255,0.35)",
  faint:    "rgba(240,234,255,0.12)",
  green:    "#7effa0",
  red:      "#ff6b8a",
  yellow:   "#ffd97d",
};

const PRIORITY_CFG: Record<Priority, { label: string; color: string; bg: string }> = {
  urgent: { label: "Urgent", color: K.red,    bg: "rgba(255,107,138,0.12)" },
  high:   { label: "High",   color: K.pink,   bg: "rgba(255,110,180,0.12)" },
  medium: { label: "Medium", color: K.purple, bg: "rgba(180,111,255,0.12)" },
  low:    { label: "Low",    color: K.muted,  bg: "rgba(240,234,255,0.07)" },
};

function MiniCalendar() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const today = now.getDate();
  const monthName = now.toLocaleString("default", { month: "long" });
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days: (number | null)[] = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  while (days.length % 7 !== 0) days.push(null);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: K.lavender }}>{monthName} {year}</span>
        <span style={{ fontSize: 11, color: K.muted }}>📅</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2, marginBottom: 4 }}>
        {["S","M","T","W","T","F","S"].map((d, i) => (
          <div key={i} style={{ textAlign: "center", fontSize: 10, color: K.muted, paddingBottom: 4, fontWeight: 600 }}>{d}</div>
        ))}
        {days.map((d, i) => (
          <div key={i} style={{
            textAlign: "center", fontSize: 11.5, padding: "3px 0", borderRadius: 6,
            background: d === today ? K.purple : "transparent",
            color: d === today ? "#fff" : d ? K.white : "transparent",
            fontWeight: d === today ? 700 : 400,
          }}>{d ?? ""}</div>
        ))}
      </div>
    </div>
  );
}

function TaskRow({ task, onToggle }: { task: Task; onToggle: (id: string) => void }) {
  const isDone = task.status === "done";
  const p = PRIORITY_CFG[task.priority];
  const today = new Date().toISOString().split("T")[0];

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      padding: "9px 12px", borderRadius: 10, marginBottom: 5,
      background: isDone ? "rgba(255,255,255,0.02)" : K.surface2,
      border: `1px solid ${isDone ? K.border2 : K.border}`,
      opacity: isDone ? 0.45 : 1, transition: "all 0.15s",
    }}>
      <div onClick={() => onToggle(task.id)} style={{
        width: 16, height: 16, borderRadius: 4, flexShrink: 0, cursor: "pointer",
        border: isDone ? `2px solid ${K.green}` : `2px solid ${K.border}`,
        background: isDone ? K.green : "transparent",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 9, color: "#000", transition: "all 0.15s",
      }}>{isDone && "✓"}</div>
      <span style={{ flex: 1, fontSize: 13, color: isDone ? K.muted : K.white, textDecoration: isDone ? "line-through" : "none", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{task.title}</span>
      <span style={{ padding: "1px 7px", borderRadius: 100, fontSize: 10, fontWeight: 700, background: p.bg, color: p.color, flexShrink: 0 }}>{p.label}</span>
      {task.due_date && (
        <span style={{ fontSize: 10.5, color: K.muted, fontFamily: "monospace", flexShrink: 0 }}>
          {task.due_date === today ? "Today" : task.due_date.slice(5)}
        </span>
      )}
    </div>
  );
}

function StatCard({ label, value, color, icon, sub }: { label: string; value: number; color: string; icon: string; sub?: string }) {
  return (
    <div style={{ background: K.surface, border: `1px solid ${K.border}`, borderRadius: 16, padding: "20px 22px", flex: 1, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: -10, right: -10, fontSize: 60, opacity: 0.06, lineHeight: 1 }}>{icon}</div>
      <div style={{ fontSize: 11, fontWeight: 700, color: K.muted, letterSpacing: "0.06em", marginBottom: 8 }}>{label.toUpperCase()}</div>
      <div style={{ fontSize: 34, fontWeight: 800, color, lineHeight: 1, marginBottom: 4 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: K.muted }}>{sub}</div>}
    </div>
  );
}

function FloatingQuickAdd() {
  const { createTask } = useTasks();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    if (!value.trim() || saving) return;
    setSaving(true);
    try {
      await createTask({ title: value.trim(), priority, source: "manual", status: "todo" });
      setValue(""); setSaved(true);
      setTimeout(() => { setSaved(false); setOpen(false); }, 1200);
    } finally { setSaving(false); }
  };

  return (
    <>
      {open && <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 98 }} />}
      {open && (
        <div style={{ position: "fixed", bottom: 90, right: 32, width: 340, zIndex: 99, background: K.surface, border: `1px solid ${K.border}`, borderRadius: 18, padding: 20, boxShadow: `0 20px 60px rgba(180,111,255,0.2)` }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: K.lavender, marginBottom: 12 }}>⚡ Quick Add Task</div>
          <input
            autoFocus value={value}
            onChange={e => setValue(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") setOpen(false); }}
            placeholder="What needs to be done?"
            style={{ width: "100%", background: K.surface2, border: `1px solid ${K.border}`, borderRadius: 10, padding: "10px 12px", color: K.white, fontSize: 13.5, outline: "none", fontFamily: "inherit", marginBottom: 10, boxSizing: "border-box" }}
          />
          <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
            {(["urgent","high","medium","low"] as Priority[]).map(p => (
              <button key={p} onClick={() => setPriority(p)} style={{ flex: 1, padding: "5px 0", borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: "pointer", background: priority === p ? PRIORITY_CFG[p].bg : "transparent", border: `1px solid ${priority === p ? PRIORITY_CFG[p].color : K.border2}`, color: priority === p ? PRIORITY_CFG[p].color : K.muted }}>
                {PRIORITY_CFG[p].label}
              </button>
            ))}
          </div>
          <button onClick={handleSave} disabled={!value.trim() || saving} style={{ width: "100%", padding: "10px", borderRadius: 10, border: "none", background: saved ? K.green : `linear-gradient(135deg, ${K.purple}, ${K.pink})`, color: saved ? "#000" : "#fff", fontSize: 13.5, fontWeight: 700, cursor: value.trim() ? "pointer" : "default" }}>
            {saved ? "✓ Added!" : saving ? "Adding..." : "Add Task"}
          </button>
        </div>
      )}
      <button onClick={() => setOpen(o => !o)} style={{ position: "fixed", bottom: 32, right: 32, width: 54, height: 54, borderRadius: "50%", border: "none", zIndex: 100, background: `linear-gradient(135deg, ${K.purple}, ${K.pink})`, color: "#fff", fontSize: 26, cursor: "pointer", boxShadow: `0 4px 24px rgba(180,111,255,0.5)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {open ? "×" : "+"}
      </button>
    </>
  );
}

export default function DashboardPage() {
  const [userName, setUserName] = useState("there");
  const { tasks, loading, toggleStatus } = useTasks();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const { data } = await supabase.from("profiles").select("full_name").eq("id", user.id).single();
      if (data?.full_name) setUserName(data.full_name.split(" ")[0]);
    });
  }, []);

  const focusTasks     = selectFocusTasks(tasks);
  const overdueTasks   = selectOverdueTasks(tasks);
  const completedToday = selectCompletedToday(tasks);
  const dueToday       = tasks.filter(t => { const today = new Date().toISOString().split("T")[0]; return t.due_date === today && t.status !== "done"; });
  const activeTasks    = tasks.filter(t => t.status !== "done" && t.status !== "cancelled");
  const hour           = new Date().getHours();
  const greeting       = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  if (loading) return <div style={{ color: K.muted, padding: 40, textAlign: "center" }}>Loading your workspace 🖤</div>;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700;800&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-thumb { background: rgba(180,111,255,0.3); border-radius: 2px; }
      `}</style>

      <div style={{ position: "relative", zIndex: 1, fontFamily: "'DM Sans', sans-serif" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 3 }}>
              <span style={{ fontSize: 20 }}>🖤</span>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: K.white, margin: 0 }}>
                {greeting}, <span style={{ color: K.pink }}>{userName}</span>
              </h1>
            </div>
            <div style={{ fontSize: 12, color: K.muted, paddingLeft: 30 }}>
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </div>
          </div>
          {overdueTasks.length > 0 && (
            <a href="/tasks" style={{ background: "rgba(255,107,138,0.1)", border: `1px solid rgba(255,107,138,0.25)`, borderRadius: 10, padding: "7px 14px", fontSize: 12.5, color: K.red, textDecoration: "none" }}>
              ⚠️ {overdueTasks.length} overdue
            </a>
          )}
        </div>

        {/* Stats */}
        <div style={{ display: "flex", gap: 12, marginBottom: 18 }}>
          <StatCard label="Done Today"   value={completedToday.length} color={K.green}  icon="✅" sub="completed" />
          <StatCard label="Due Today"    value={dueToday.length}       color={K.yellow} icon="🎯" sub="pending" />
          <StatCard label="Focus"        value={focusTasks.length}     color={K.pink}   icon="⚡" sub="starred" />
          <StatCard label="Total Active" value={activeTasks.length}    color={K.purple} icon="📋" sub="all tasks" />
        </div>

        {/* Main grid */}
        <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 16, alignItems: "start" }}>

          {/* Left: Calendar + Gmail */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ background: K.surface, border: `1px solid ${K.border}`, borderRadius: 16, padding: 18 }}>
              <MiniCalendar />
            </div>
            <div style={{ background: K.surface, border: `1px solid ${K.border}`, borderRadius: 16, padding: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: K.lavender }}>📧 Gmail</div>
                <span style={{ fontSize: 10.5, color: K.muted }}>Unread</span>
              </div>
              <div style={{ maxHeight: 300, overflowY: "auto" }}>
                <Suspense fallback={<div style={{ color: K.muted, fontSize: 12 }}>Loading...</div>}>
                  <GmailWidget />
                </Suspense>
              </div>
            </div>
          </div>

          {/* Right: Focus + Tasks */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Focus */}
            <div style={{ background: K.surface, border: `1px solid ${K.border}`, borderRadius: 16, padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 15 }}>⚡</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: K.white }}>Daily Focus</span>
                  <span style={{ fontSize: 11, background: "rgba(180,111,255,0.15)", color: K.purple, padding: "2px 8px", borderRadius: 100, fontWeight: 600 }}>{focusTasks.length}</span>
                </div>
                <a href="/tasks" style={{ fontSize: 12, color: K.pink, textDecoration: "none", fontWeight: 600 }}>View all →</a>
              </div>
              {focusTasks.length === 0 ? (
                <div style={{ textAlign: "center", padding: "16px 0" }}>
                  <div style={{ fontSize: 24, marginBottom: 6 }}>🖤</div>
                  <div style={{ fontSize: 12.5, color: K.muted }}>Star tasks to add them here</div>
                </div>
              ) : (
                <div style={{ maxHeight: 180, overflowY: "auto" }}>
                  {focusTasks.map(task => <TaskRow key={task.id} task={task} onToggle={toggleStatus} />)}
                </div>
              )}
            </div>

            {/* All tasks */}
            <div style={{ background: K.surface, border: `1px solid ${K.border}`, borderRadius: 16, padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 15 }}>📋</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: K.white }}>Recent Tasks</span>
                </div>
                <a href="/tasks" style={{ fontSize: 12, color: K.pink, textDecoration: "none", fontWeight: 600 }}>Manage →</a>
              </div>
              <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                {([
                  { label: "To Do",    status: "todo",        color: K.muted   },
                  { label: "Progress", status: "in_progress", color: K.purple  },
                  { label: "Done",     status: "done",        color: K.green   },
                  { label: "Blocked",  status: "blocked",     color: K.red     },
                ] as { label: string; status: TaskStatus; color: string }[]).map(s => (
                  <div key={s.status} style={{ flex: 1, background: K.surface2, border: `1px solid ${K.border2}`, borderRadius: 10, padding: "8px 0", textAlign: "center" }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: s.color }}>{tasks.filter(t => t.status === s.status).length}</div>
                    <div style={{ fontSize: 10, color: K.muted, marginTop: 1 }}>{s.label}</div>
                  </div>
                ))}
              </div>
              <div style={{ maxHeight: 180, overflowY: "auto" }}>
                {tasks.filter(t => !t.is_focus && t.status !== "done").slice(0, 5).map(task => (
                  <TaskRow key={task.id} task={task} onToggle={toggleStatus} />
                ))}
                {tasks.filter(t => !t.is_focus && t.status !== "done").length === 0 && (
                  <div style={{ textAlign: "center", padding: "16px 0", color: K.muted, fontSize: 13 }}>All caught up! 🖤</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <FloatingQuickAdd />
    </>
  );
}