"use client";
// SAVE AS: app/(dashboard)/page.tsx

import { useEffect, useState, Suspense } from "react";
import { createClient } from "@/lib/supabase/client";
import { useTasks, selectFocusTasks, selectOverdueTasks, selectCompletedToday } from "@/hooks/useTasks";
import GmailWidget from "@/components/gmail/GmailWidget";
import type { Task, Priority, TaskStatus } from "@/types/database";

export const dynamic = "force-dynamic";

const K = {
  bg:       "#0d0b14",
  surface:  "#161224",
  surface2: "#1e1830",
  surface3: "#251f3a",
  border:   "rgba(160,100,255,0.15)",
  border2:  "rgba(255,255,255,0.06)",
  pink:     "#ff6eb4",
  pink2:    "#ff9ed2",
  purple:   "#9b5de5",
  purple2:  "#c084fc",
  lavender: "#e0aaff",
  white:    "#f5f0ff",
  muted:    "rgba(224,210,255,0.4)",
  faint:    "rgba(224,210,255,0.08)",
  green:    "#4ade80",
  red:      "#f87171",
  yellow:   "#fbbf24",
  chart1:   "#9b5de5",
  chart2:   "#ff6eb4",
};

const PRIORITY_CFG: Record<Priority, { label: string; color: string; bg: string }> = {
  urgent: { label: "Urgent", color: K.red,     bg: "rgba(248,113,113,0.12)" },
  high:   { label: "High",   color: K.pink,    bg: "rgba(255,110,180,0.12)" },
  medium: { label: "Medium", color: K.purple2, bg: "rgba(192,132,252,0.12)" },
  low:    { label: "Low",    color: K.muted,   bg: "rgba(224,210,255,0.07)" },
};

// ─── Mini Calendar ────────────────────────────────────────────
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

  const EVENTS = [
    { time: "10:00 AM", title: "Team Standup" },
    { time: "02:00 PM", title: "Product Review" },
    { time: "05:00 PM", title: "EOD Check-in" },
  ];

  return (
    <div>
      {/* Month header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 20 }}>🖤</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: K.white }}>{monthName} {year}</span>
        </div>
        <span style={{ color: K.pink, fontSize: 16 }}>🩷</span>
      </div>

      {/* Day headers */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: 6 }}>
        {["SUN","MON","TUE","WED","THU","FRI","SAT"].map((d, i) => (
          <div key={i} style={{ textAlign: "center", fontSize: 9, color: K.muted, fontWeight: 700, letterSpacing: "0.05em", paddingBottom: 6 }}>{d}</div>
        ))}
      </div>

      {/* Days grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "2px 0", marginBottom: 16 }}>
        {days.map((d, i) => (
          <div key={i} style={{
            textAlign: "center", fontSize: 12, padding: "5px 2px", borderRadius: 8,
            background: d === today ? `linear-gradient(135deg, ${K.purple}, ${K.pink})` : "transparent",
            color: d === today ? "#fff" : d ? K.white : "transparent",
            fontWeight: d === today ? 800 : 400,
            cursor: d ? "pointer" : "default",
          }}>{d ?? ""}</div>
        ))}
      </div>

      {/* Events */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {EVENTS.map((evt, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: i === 0 ? K.purple : i === 1 ? K.pink : K.purple2, flexShrink: 0 }} />
            <span style={{ fontSize: 11, color: K.muted, width: 64, flexShrink: 0 }}>{evt.time}</span>
            <span style={{ fontSize: 12, color: K.white, fontWeight: 500 }}>{evt.title}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Sparkline chart (SVG) ────────────────────────────────────
function SparklineChart({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 300; const h = 80;
  const points = data.map((v, i) => ({
    x: (i / (data.length - 1)) * w,
    y: h - ((v - min) / range) * (h - 10) - 5,
  }));
  const path = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const area = `${path} L ${w} ${h} L 0 ${h} Z`;

  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#areaGrad)" />
      <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3" fill={color} opacity="0.8" />
      ))}
    </svg>
  );
}

// ─── Donut chart ──────────────────────────────────────────────
function DonutChart({ completed, inProgress, pending }: { completed: number; inProgress: number; pending: number }) {
  const total = completed + inProgress + pending || 1;
  const pct = Math.round((completed / total) * 100);
  const r = 50; const cx = 70; const cy = 70;
  const circumference = 2 * Math.PI * r;

  const segments = [
    { value: completed, color: K.pink, label: "Completed" },
    { value: inProgress, color: K.purple, label: "In Progress" },
    { value: pending, color: K.surface3, label: "Pending" },
  ];

  let offset = 0;
  const arcs = segments.map(seg => {
    const dash = (seg.value / total) * circumference;
    const arc = { dash, offset, color: seg.color };
    offset += dash;
    return arc;
  });

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
      <div style={{ position: "relative", flexShrink: 0 }}>
        <svg width={140} height={140} viewBox="0 0 140 140">
          {arcs.map((arc, i) => (
            <circle key={i} cx={cx} cy={cy} r={r}
              fill="none" stroke={arc.color} strokeWidth={18}
              strokeDasharray={`${arc.dash} ${circumference - arc.dash}`}
              strokeDashoffset={-arc.offset + circumference / 4}
              strokeLinecap="round"
              style={{ transform: "rotate(-90deg)", transformOrigin: `${cx}px ${cy}px` }}
            />
          ))}
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: K.white }}>{pct}%</div>
          <div style={{ fontSize: 10, color: K.muted }}>Completed</div>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {segments.map((seg, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: seg.color, flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: K.muted }}>{seg.label}</span>
            <span style={{ fontSize: 12, color: K.white, fontWeight: 600, marginLeft: "auto" }}>
              {Math.round((seg.value / total) * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Task row ─────────────────────────────────────────────────
function TaskRow({ task, onToggle }: { task: Task; onToggle: (id: string) => void }) {
  const isDone = task.status === "done";
  const p = PRIORITY_CFG[task.priority];
  const today = new Date().toISOString().split("T")[0];

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      padding: "10px 12px", borderRadius: 12, marginBottom: 6,
      background: isDone ? K.faint : K.surface2,
      border: `1px solid ${isDone ? K.border2 : K.border}`,
      opacity: isDone ? 0.5 : 1, transition: "all 0.15s",
    }}>
      <div onClick={() => onToggle(task.id)} style={{
        width: 18, height: 18, borderRadius: "50%", flexShrink: 0, cursor: "pointer",
        border: isDone ? `2px solid ${K.green}` : `2px solid rgba(160,100,255,0.3)`,
        background: isDone ? K.green : "transparent",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 10, color: "#000", transition: "all 0.2s",
      }}>{isDone && "✓"}</div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, color: isDone ? K.muted : K.white, textDecoration: isDone ? "line-through" : "none", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginBottom: 2 }}>
          {task.title}
        </div>
        {task.due_date && (
          <div style={{ fontSize: 10.5, color: K.muted }}>
            {task.due_date === today ? "Due today" : task.due_date.slice(5)}
          </div>
        )}
      </div>

      <span style={{ padding: "2px 8px", borderRadius: 100, fontSize: 10.5, fontWeight: 700, background: p.bg, color: p.color, flexShrink: 0 }}>
        {p.label}
      </span>

      <span style={{ fontSize: 16, color: K.muted, cursor: "pointer", flexShrink: 0 }}>🔖</span>
    </div>
  );
}

// ─── Stat card ────────────────────────────────────────────────
function StatCard({ label, value, sub, color, icon, trend }: { label: string; value: string | number; sub: string; color: string; icon: string; trend?: string }) {
  return (
    <div style={{ background: K.surface, border: `1px solid ${K.border}`, borderRadius: 18, padding: "20px 22px", flex: 1, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 16, right: 16, width: 42, height: 42, borderRadius: 12, background: `${color}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{icon}</div>
      <div style={{ fontSize: 11, fontWeight: 700, color: K.muted, letterSpacing: "0.05em", marginBottom: 6 }}>{label.toUpperCase()}</div>
      <div style={{ fontSize: 30, fontWeight: 800, color: K.white, lineHeight: 1, marginBottom: 4 }}>{value}</div>
      {trend && <div style={{ fontSize: 11.5, color: K.green }}>↑ {trend}</div>}
      <div style={{ fontSize: 11, color: K.muted, marginTop: 2 }}>{sub}</div>
    </div>
  );
}

// ─── AI Assistant panel ───────────────────────────────────────
function AIAssistantPanel() {
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState([
    { role: "assistant", text: "Hey there! I'm your Kuromi AI 🖤🩷\nHow can I help you slay your day?" }
  ]);
  const [loading, setLoading] = useState(false);

  const QUICK = ["Summarize today's tasks", "Show project updates", "Draft an email", "Generate report"];

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    setInput("");
    setMsgs(m => [...m, { role: "user", text }]);
    setLoading(true);
    setTimeout(() => {
      setMsgs(m => [...m, { role: "assistant", text: "I'm your AI assistant! In the full version, I'll connect to Claude API to give real answers based on your tasks, emails, and Discord. 🖤" }]);
      setLoading(false);
    }, 1000);
  };

  return (
    <div style={{ background: K.surface, border: `1px solid ${K.border}`, borderRadius: 18, padding: 20, display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg, ${K.purple}, ${K.pink})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🖤</div>
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: K.white }}>Kuromi AI Assistant</div>
            <div style={{ fontSize: 10.5, color: K.muted }}>Powered by Claude</div>
          </div>
        </div>
        <span style={{ color: K.yellow, fontSize: 16 }}>✦</span>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", marginBottom: 12, display: "flex", flexDirection: "column", gap: 8, minHeight: 100 }}>
        {msgs.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
            <div style={{
              maxWidth: "88%", padding: "9px 13px", borderRadius: m.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
              background: m.role === "user" ? `linear-gradient(135deg, ${K.purple}, ${K.pink})` : K.surface2,
              color: K.white, fontSize: 12.5, lineHeight: 1.6,
              border: m.role === "assistant" ? `1px solid ${K.border}` : "none",
              whiteSpace: "pre-line",
            }}>{m.text}</div>
          </div>
        ))}
        {loading && <div style={{ color: K.muted, fontSize: 12, padding: "4px 0" }}>🖤 Thinking...</div>}
      </div>

      {/* Quick actions */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 10 }}>
        {QUICK.map(q => (
          <button key={q} onClick={() => send(q)} style={{ background: K.surface2, border: `1px solid ${K.border}`, borderRadius: 8, padding: "6px 8px", color: K.muted, fontSize: 11, cursor: "pointer", textAlign: "left" }}>
            {q}
          </button>
        ))}
      </div>

      {/* Input */}
      <div style={{ display: "flex", gap: 8 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send(input)}
          placeholder="Ask Kuromi anything..."
          style={{ flex: 1, background: K.surface2, border: `1px solid ${K.border}`, borderRadius: 10, padding: "9px 12px", color: K.white, fontSize: 12.5, outline: "none", fontFamily: "inherit" }}
        />
        <button onClick={() => send(input)} style={{ background: `linear-gradient(135deg, ${K.purple}, ${K.pink})`, border: "none", borderRadius: 10, padding: "9px 14px", color: "#fff", fontSize: 16, cursor: "pointer" }}>↑</button>
      </div>
    </div>
  );
}

// ─── Floating quick add ───────────────────────────────────────
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
      {open && <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 98 }} />}
      {open && (
        <div style={{ position: "fixed", bottom: 90, right: 32, width: 340, zIndex: 99, background: K.surface, border: `1px solid ${K.border}`, borderRadius: 20, padding: 22, boxShadow: `0 24px 60px rgba(155,93,229,0.3)` }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: K.lavender, marginBottom: 14 }}>🖤 Add New Task</div>
          <input
            autoFocus value={value}
            onChange={e => setValue(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") setOpen(false); }}
            placeholder="What needs to be done?"
            style={{ width: "100%", background: K.surface2, border: `1px solid ${K.border}`, borderRadius: 12, padding: "11px 14px", color: K.white, fontSize: 13.5, outline: "none", fontFamily: "inherit", marginBottom: 12, boxSizing: "border-box" }}
          />
          <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
            {(["urgent","high","medium","low"] as Priority[]).map(p => (
              <button key={p} onClick={() => setPriority(p)} style={{ flex: 1, padding: "6px 0", borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: "pointer", background: priority === p ? PRIORITY_CFG[p].bg : "transparent", border: `1px solid ${priority === p ? PRIORITY_CFG[p].color : K.border2}`, color: priority === p ? PRIORITY_CFG[p].color : K.muted }}>
                {PRIORITY_CFG[p].label}
              </button>
            ))}
          </div>
          <button onClick={handleSave} disabled={!value.trim() || saving} style={{ width: "100%", padding: "11px", borderRadius: 12, border: "none", background: saved ? K.green : `linear-gradient(135deg, ${K.purple}, ${K.pink})`, color: saved ? "#000" : "#fff", fontSize: 14, fontWeight: 700, cursor: value.trim() ? "pointer" : "default" }}>
            {saved ? "✓ Task Added!" : saving ? "Adding..." : "+ Add Task"}
          </button>
        </div>
      )}
      <button onClick={() => setOpen(o => !o)} style={{ position: "fixed", bottom: 32, right: 32, width: 56, height: 56, borderRadius: "50%", border: "none", zIndex: 100, background: `linear-gradient(135deg, ${K.purple}, ${K.pink})`, color: "#fff", fontSize: 28, cursor: "pointer", boxShadow: `0 6px 28px rgba(155,93,229,0.55)`, display: "flex", alignItems: "center", justifyContent: "center", transition: "transform 0.2s" }}>
        {open ? "×" : "+"}
      </button>
    </>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────
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
  const doneTasks      = tasks.filter(t => t.status === "done");
  const inProgressTasks = tasks.filter(t => t.status === "in_progress");

  const hour     = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  // Sparkline data — tasks completed per day (mock for now, replace with real data later)
  const chartData = [20, 35, 28, 55, 42, 68, 45, 72, 58, 80, 65, 88, 72];
  const days      = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", color: K.muted, fontSize: 14 }}>
      Loading your workspace 🖤
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        body { background: ${K.bg}; font-family: 'DM Sans', sans-serif; }
        ::-webkit-scrollbar { width: 3px; height: 3px; }
        ::-webkit-scrollbar-thumb { background: rgba(155,93,229,0.3); border-radius: 2px; }
        select option { background: #1e1830; }
        input::placeholder { color: rgba(224,210,255,0.25); }
      `}</style>

      <div style={{ fontFamily: "'DM Sans', sans-serif" }}>

        {/* ── Top header ───────────────────────────── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: K.white, margin: 0, marginBottom: 4 }}>
              {greeting}, <span style={{ background: `linear-gradient(135deg, ${K.purple2}, ${K.pink})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{userName}</span>! 🩷
            </h1>
            <p style={{ fontSize: 13, color: K.muted, margin: 0 }}>Here&apos;s what&apos;s happening with your operations today.</p>
          </div>
          {overdueTasks.length > 0 && (
            <a href="/tasks" style={{ background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.25)", borderRadius: 12, padding: "9px 18px", fontSize: 13, color: K.red, textDecoration: "none", fontWeight: 600 }}>
              ⚠️ {overdueTasks.length} overdue
            </a>
          )}
        </div>

        {/* ── Stat cards ───────────────────────────── */}
        <div style={{ display: "flex", gap: 14, marginBottom: 20 }}>
          <StatCard label="Total Tasks"    value={tasks.length}          sub="all time"        color={K.purple} icon="📋" trend={`${activeTasks.length} active`} />
          <StatCard label="Active Tasks"   value={activeTasks.length}    sub="in progress"     color={K.pink}   icon="⚡" />
          <StatCard label="Pending Tasks"  value={dueToday.length}       sub="due today"       color={K.yellow} icon="🎯" />
          <StatCard label="Focus Tasks"    value={focusTasks.length}     sub="starred"         color={K.purple2} icon="⭐" />
        </div>

        {/* ── Main 3-col grid ──────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "280px 1fr 300px", gap: 16, alignItems: "start" }}>

          {/* ── Col 1: Calendar + Gmail ──────────── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ background: K.surface, border: `1px solid ${K.border}`, borderRadius: 18, padding: 20 }}>
              <MiniCalendar />
            </div>
            <div style={{ background: K.surface, border: `1px solid ${K.border}`, borderRadius: 18, padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 16 }}>📧</span>
                  <span style={{ fontSize: 13.5, fontWeight: 700, color: K.white }}>Gmail</span>
                </div>
                <a href="#" style={{ fontSize: 12, color: K.pink, textDecoration: "none", fontWeight: 600 }}>View all →</a>
              </div>
              <div style={{ maxHeight: 280, overflowY: "auto" }}>
                <Suspense fallback={<div style={{ color: K.muted, fontSize: 12 }}>Loading...</div>}>
                  <GmailWidget />
                </Suspense>
              </div>
            </div>
          </div>

          {/* ── Col 2: Chart + Tasks ─────────────── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

            {/* Operations overview chart */}
            <div style={{ background: K.surface, border: `1px solid ${K.border}`, borderRadius: 18, padding: 22 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 16 }}>🖤</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: K.white }}>Operations Overview</span>
                </div>
                <div style={{ background: K.surface2, border: `1px solid ${K.border}`, borderRadius: 8, padding: "5px 12px", fontSize: 12, color: K.muted }}>This Week ▾</div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 20, alignItems: "center" }}>
                <div>
                  {/* Y axis labels + chart */}
                  <div style={{ display: "flex", gap: 8 }}>
                    <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", fontSize: 10, color: K.muted, paddingBottom: 16, paddingTop: 4 }}>
                      {[100,80,60,40,20,0].map(v => <span key={v}>{v}</span>)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <SparklineChart data={chartData} color={K.purple} />
                      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                        {days.map(d => <span key={d} style={{ fontSize: 10, color: K.muted }}>{d}</span>)}
                      </div>
                    </div>
                  </div>
                </div>
                <DonutChart
                  completed={doneTasks.length}
                  inProgress={inProgressTasks.length}
                  pending={dueToday.length}
                />
              </div>
            </div>

            {/* My tasks */}
            <div style={{ background: K.surface, border: `1px solid ${K.border}`, borderRadius: 18, padding: 22 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: K.white }}>🖤 My Tasks</span>
                <a href="/tasks" style={{ fontSize: 12, color: K.pink, textDecoration: "none", fontWeight: 600 }}>View all</a>
              </div>

              {/* Tabs */}
              <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
                {["All", "Due Today", "Upcoming"].map((tab, i) => (
                  <button key={tab} style={{ padding: "5px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", background: i === 0 ? `linear-gradient(135deg, ${K.purple}, ${K.pink})` : "transparent", border: i === 0 ? "none" : `1px solid ${K.border}`, color: i === 0 ? "#fff" : K.muted }}>
                    {tab}
                  </button>
                ))}
              </div>

              <div style={{ maxHeight: 240, overflowY: "auto" }}>
                {tasks.slice(0, 6).map(task => (
                  <TaskRow key={task.id} task={task} onToggle={toggleStatus} />
                ))}
                {tasks.length === 0 && (
                  <div style={{ textAlign: "center", padding: "20px 0", color: K.muted, fontSize: 13 }}>No tasks yet 🖤</div>
                )}
              </div>

              <button onClick={() => {}} style={{ width: "100%", marginTop: 10, padding: "10px", borderRadius: 12, border: `1px dashed rgba(155,93,229,0.3)`, background: "transparent", color: K.purple2, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                + Add new task
              </button>
            </div>
          </div>

          {/* ── Col 3: AI Assistant ───────────────── */}
          <div style={{ height: "100%" }}>
            <AIAssistantPanel />
          </div>
        </div>
      </div>

      <FloatingQuickAdd />
    </>
  );
}