"use client";

// SAVE AS: app/(dashboard)/page.tsx
// Kuromi-inspired dashboard page.
// Keeps your existing Supabase tasks, CalendarWidget, GmailWidget, and task toggling.

import { createClient } from "@/lib/supabase/client";
import {
  useTasks,
  selectFocusTasks,
  selectOverdueTasks,
  selectCompletedToday,
} from "@/hooks/useTasks";
import GmailWidget from "@/components/gmail/GmailWidget";
import CalendarWidget from "@/components/calendar/CalendarWidget";
import type { Task, Priority } from "@/types/database";
import React, { Suspense, useEffect, useState } from "react";

export const dynamic = "force-dynamic";

const K = {
  bg: "#0a0711",
  panel: "rgba(22,18,36,0.82)",
  panel2: "rgba(30,24,48,0.88)",
  panel3: "rgba(37,31,58,0.85)",
  border: "rgba(224,170,255,0.14)",
  borderStrong: "rgba(255,110,180,0.28)",
  pink: "#ff6eb4",
  pink2: "#ff9ed2",
  purple: "#9b5de5",
  purple2: "#c084fc",
  lavender: "#e0aaff",
  white: "#f8f1ff",
  muted: "rgba(235,220,255,0.52)",
  faint: "rgba(224,210,255,0.07)",
  green: "#4ade80",
  red: "#f87171",
  yellow: "#fbbf24",
};

const PRIORITY_CFG: Record<
  Priority,
  { label: string; color: string; bg: string }
> = {
  urgent: { label: "Urgent", color: K.red, bg: "rgba(248,113,113,0.13)" },
  high: { label: "High", color: K.pink, bg: "rgba(255,110,180,0.14)" },
  medium: {
    label: "Medium",
    color: K.purple2,
    bg: "rgba(192,132,252,0.14)",
  },
  low: { label: "Low", color: K.muted, bg: "rgba(224,210,255,0.08)" },
};

function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="kuromi-page">
      <div className="kuromi-bg-orb orb-one" />
      <div className="kuromi-bg-orb orb-two" />
      <div className="kuromi-bg-orb orb-three" />
      <div className="kuromi-sparkle sparkle-one">✦</div>
      <div className="kuromi-sparkle sparkle-two">♡</div>
      <div className="kuromi-sparkle sparkle-three">✧</div>
      {children}
    </div>
  );
}

function GlassCard({
  children,
  className = "",
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <section className={`kuromi-card ${className}`} style={style}>
      {children}
    </section>
  );
}

function SkeletonDashboard() {
  return (
    <DashboardShell>
      <div className="skeleton" style={{ height: 44, width: 360, marginBottom: 22 }} />
      <div className="stats-grid">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="skeleton" style={{ height: 126, borderRadius: 24 }} />
        ))}
      </div>
      <div className="dashboard-grid">
        <div className="left-stack">
          <div className="skeleton" style={{ height: 360, borderRadius: 24 }} />
          <div className="skeleton" style={{ height: 320, borderRadius: 24 }} />
        </div>
        <div className="center-stack">
          <div className="skeleton" style={{ height: 260, borderRadius: 24 }} />
          <div className="skeleton" style={{ height: 330, borderRadius: 24 }} />
        </div>
        <div className="right-stack">
          <div className="skeleton" style={{ height: 706, borderRadius: 24 }} />
        </div>
      </div>
    </DashboardShell>
  );
}

function StatCard({
  label,
  value,
  sub,
  icon,
  variant,
}: {
  label: string;
  value: string | number;
  sub: string;
  icon: string;
  variant: "pink" | "purple" | "violet" | "gold";
}) {
  return (
    <GlassCard className={`stat-card stat-${variant}`}>
      <div className="stat-deco">✦</div>
      <div className="stat-icon">{icon}</div>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-sub">{sub}</div>
    </GlassCard>
  );
}

function SparklineChart({ data }: { data: number[] }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 640;
  const h = 170;

  const points = data.map((v, i) => ({
    x: (i / (data.length - 1)) * w,
    y: h - ((v - min) / range) * (h - 20) - 10,
  }));

  const path = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");

  const area = `${path} L ${w} ${h} L 0 ${h} Z`;

  return (
    <svg width="100%" height={190} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id="opsArea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={K.pink} stopOpacity="0.35" />
          <stop offset="55%" stopColor={K.purple} stopOpacity="0.12" />
          <stop offset="100%" stopColor={K.purple} stopOpacity="0.01" />
        </linearGradient>
        <linearGradient id="opsStroke" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={K.purple2} />
          <stop offset="100%" stopColor={K.pink} />
        </linearGradient>
      </defs>

      {[0, 1, 2, 3].map((line) => (
        <line
          key={line}
          x1="0"
          x2={w}
          y1={(line + 1) * 34}
          y2={(line + 1) * 34}
          stroke="rgba(255,255,255,0.05)"
        />
      ))}

      <path d={area} fill="url(#opsArea)" />
      <path
        d={path}
        fill="none"
        stroke="url(#opsStroke)"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {points.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r="5"
          fill={i === points.length - 1 ? K.pink : K.purple2}
          opacity="0.9"
        />
      ))}
    </svg>
  );
}

function DonutChart({
  completed,
  total,
}: {
  completed: number;
  total: number;
}) {
  const safeTotal = total || 1;
  const pct = Math.round((completed / safeTotal) * 100);
  const circumference = 2 * Math.PI * 46;
  const dash = (pct / 100) * circumference;

  return (
    <div className="donut-wrap">
      <svg width="132" height="132" viewBox="0 0 132 132">
        <circle
          cx="66"
          cy="66"
          r="46"
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="16"
        />
        <circle
          cx="66"
          cy="66"
          r="46"
          fill="none"
          stroke={K.pink}
          strokeWidth="16"
          strokeDasharray={`${dash} ${circumference - dash}`}
          strokeLinecap="round"
          transform="rotate(-90 66 66)"
        />
      </svg>
      <div className="donut-center">
        <strong>{pct}%</strong>
        <span>Done</span>
      </div>
    </div>
  );
}

function TaskRow({ task, onToggle }: { task: Task; onToggle: (id: string) => void }) {
  const isDone = task.status === "done";
  const priority = PRIORITY_CFG[task.priority];
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className={`task-card ${isDone ? "done" : ""}`}>
      <button
        onClick={() => onToggle(task.id)}
        className={`task-check ${isDone ? "checked" : ""}`}
        aria-label="Toggle task"
      >
        {isDone ? "✓" : ""}
      </button>

      <div className="task-main">
        <div className="task-title">{task.title}</div>
        {task.due_date && (
          <div className={task.due_date < today && !isDone ? "task-date overdue" : "task-date"}>
            {task.due_date === today
              ? "Due today"
              : task.due_date < today && !isDone
                ? `Overdue · ${task.due_date.slice(5)}`
                : task.due_date.slice(5)}
          </div>
        )}
      </div>

      <span
        className="priority-pill"
        style={{ background: priority.bg, color: priority.color }}
      >
        {priority.label}
      </span>
    </div>
  );
}

function AIAssistantPanel({
  focusCount,
  overdueCount,
  completedToday,
}: {
  focusCount: number;
  overdueCount: number;
  completedToday: number;
}) {
  const [input, setInput] = useState("");

  return (
    <GlassCard className="ai-panel">
      <div className="ai-hero">
        <div className="ai-mascot">
          <span className="ear left" />
          <span className="ear right" />
          <span className="face">☠</span>
        </div>

        <div>
          <div className="panel-eyebrow">Kuromi Assistant</div>
          <h2>Ready to organize chaos?</h2>
          <p>Ask about tasks, emails, calendar items, or what to focus on next.</p>
        </div>
      </div>

      <div className="ai-summary-grid">
        <div>
          <strong>{focusCount}</strong>
          <span>Focus</span>
        </div>
        <div>
          <strong>{overdueCount}</strong>
          <span>Overdue</span>
        </div>
        <div>
          <strong>{completedToday}</strong>
          <span>Done today</span>
        </div>
      </div>

      <div className="quick-actions">
        {["Summarize today", "Draft email", "Plan tasks", "Check risks"].map((item) => (
          <button key={item}>{item}</button>
        ))}
      </div>

      <div className="activity-feed">
        <div className="panel-title-row">
          <span>Recent Activity</span>
          <span>✦</span>
        </div>

        {[
          "Calendar is synced",
          "Gmail widget is active",
          "Task board is connected",
          "Theme changed to Kuromi mode",
        ].map((item) => (
          <div className="activity-item" key={item}>
            <span className="activity-dot" />
            <span>{item}</span>
          </div>
        ))}
      </div>

      <div className="ai-input-row">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Kuromi anything..."
        />
        <button>↑</button>
      </div>
    </GlassCard>
  );
}

function FloatingQuickAdd() {
  return (
    <button className="kuromi-fab" aria-label="Add task">
      +
    </button>
  );
}

export default function DashboardPage() {
  const [userName, setUserName] = useState("there");
  const { tasks, loading, toggleStatus } = useTasks();

  const [loadTimeout, setLoadTimeout] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "today" | "upcoming">("all");

  useEffect(() => {
    const t = setTimeout(() => setLoadTimeout(true), 4000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();

      if (data?.full_name) setUserName(data.full_name.split(" ")[0]);
    });
  }, []);

  const focusTasks = selectFocusTasks(tasks);
  const overdueTasks = selectOverdueTasks(tasks);
  const completedToday = selectCompletedToday(tasks);
  const todayStr = new Date().toISOString().split("T")[0];

  const dueToday = tasks.filter(
    (task) => task.due_date === todayStr && task.status !== "done",
  );

  const activeTasks = tasks.filter(
    (task) => task.status !== "done" && task.status !== "cancelled",
  );

  const doneTasks = tasks.filter((task) => task.status === "done");

  const visibleTasks =
    activeTab === "today"
      ? dueToday
      : activeTab === "upcoming"
        ? tasks.filter(
            (task) => task.due_date && task.due_date > todayStr && task.status !== "done",
          )
        : tasks;

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const chartData = [22, 34, 28, 55, 42, 68, 51, 74, 62, 86, 72, 91];

  if (loading && !loadTimeout) return <SkeletonDashboard />;

  return (
    <DashboardShell>
      <header className="kuromi-topbar">
        <div>
          <div className="panel-eyebrow">OpsFlow Command Center</div>
          <h1>
            {greeting}, <span>{userName}</span> ♡
          </h1>
          <p>Mini calendar, Gmail, tasks, and AI — all in your Kuromi workspace.</p>
        </div>

        <div className="topbar-actions">
          <div className="search-pill">⌕ Search anything...</div>
          <button className="icon-btn">♡</button>
          <button className="icon-btn">✦</button>
          <div className="profile-chip">
            <span>{userName.slice(0, 1).toUpperCase()}</span>
          </div>
        </div>
      </header>

      <div className="stats-grid">
        <StatCard
          label="Total Tasks"
          value={tasks.length}
          sub={`${activeTasks.length} active`}
          icon="☑"
          variant="purple"
        />
        <StatCard
          label="Due Today"
          value={dueToday.length}
          sub="needs attention"
          icon="♡"
          variant="pink"
        />
        <StatCard
          label="Focus Tasks"
          value={focusTasks.length}
          sub="starred items"
          icon="✦"
          variant="violet"
        />
        <StatCard
          label="Completed"
          value={doneTasks.length}
          sub={`${completedToday.length} today`}
          icon="☾"
          variant="gold"
        />
      </div>

      <main className="dashboard-grid">
        <div className="left-stack">
          <GlassCard className="calendar-card">
            <div className="panel-title-row">
              <span>Mini Calendar</span>
              <span>♡</span>
            </div>
            <CalendarWidget />
          </GlassCard>

          <GlassCard className="gmail-card">
            <div className="panel-title-row">
              <span>Gmail Inbox</span>
              <a href="/inbox">View all →</a>
            </div>
            <div className="gmail-scroll">
              <Suspense fallback={<div className="soft-text">Loading emails...</div>}>
                <GmailWidget />
              </Suspense>
            </div>
          </GlassCard>
        </div>

        <div className="center-stack">
          <GlassCard className="overview-card">
            <div className="panel-title-row">
              <div>
                <span>Operations Overview</span>
                <p>Task flow and completion rhythm</p>
              </div>
              <button className="mini-select">This Week ▾</button>
            </div>

            <div className="overview-content">
              <div className="chart-wrap">
                <SparklineChart data={chartData} />
              </div>

              <DonutChart completed={doneTasks.length} total={tasks.length} />
            </div>
          </GlassCard>

          <GlassCard className="tasks-panel">
            <div className="panel-title-row">
              <span>My Tasks</span>
              <a href="/tasks">View all</a>
            </div>

            <div className="task-tabs">
              {[
                { key: "all", label: "All" },
                { key: "today", label: "Due Today" },
                { key: "upcoming", label: "Upcoming" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as typeof activeTab)}
                  className={activeTab === tab.key ? "active" : ""}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="task-list">
              {visibleTasks.length > 0 ? (
                visibleTasks
                  .slice(0, 7)
                  .map((task) => (
                    <TaskRow key={task.id} task={task} onToggle={toggleStatus} />
                  ))
              ) : (
                <div className="empty-state">
                  <strong>No tasks here ♡</strong>
                  <span>Your workspace is calm for now.</span>
                </div>
              )}
            </div>

            {overdueTasks.length > 0 && (
              <div className="overdue-warning">
                ⚠ {overdueTasks.length} overdue task{overdueTasks.length > 1 ? "s" : ""}
              </div>
            )}
          </GlassCard>
        </div>

        <div className="right-stack">
          <AIAssistantPanel
            focusCount={focusTasks.length}
            overdueCount={overdueTasks.length}
            completedToday={completedToday.length}
          />
        </div>
      </main>

      <FloatingQuickAdd />
    </DashboardShell>
  );
}
