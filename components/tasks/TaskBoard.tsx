"use client";
// SAVE AS: components/tasks/TaskBoard.tsx

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useTasks, selectFocusTasks, selectOverdueTasks } from "@/hooks/useTasks";
import type { Task, TaskStatus, Priority } from "@/types/database";

// ─── Priority config ──────────────────────────────────────────
const PRIORITY: Record<Priority, { label: string; color: string; bg: string }> = {
  urgent: { label: "Urgent", color: "#FF4444", bg: "rgba(255,68,68,0.12)" },
  high:   { label: "High",   color: "#FF8C42", bg: "rgba(255,140,66,0.12)" },
  medium: { label: "Medium", color: "#4A9EFF", bg: "rgba(74,158,255,0.12)" },
  low:    { label: "Low",    color: "#6B7280", bg: "rgba(107,114,128,0.12)" },
};

const STATUS_TABS: { value: "all" | TaskStatus; label: string }[] = [
  { value: "all",         label: "All" },
  { value: "todo",        label: "To Do" },
  { value: "in_progress", label: "In Progress" },
  { value: "done",        label: "Done" },
  { value: "blocked",     label: "Blocked" },
];

// ─── Sortable task card ───────────────────────────────────────
function SortableTaskCard({
  task, onToggle, onToggleFocus, onDelete,
}: {
  task: Task;
  onToggle: (id: string) => void;
  onToggleFocus: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task.id });

  const isDone = task.status === "done";
  const p = PRIORITY[task.priority];

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        display: "flex", alignItems: "center", gap: 10,
        padding: "11px 14px", borderRadius: 10, marginBottom: 6,
       background: isDone ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.05)",
border: isDone ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(255,255,255,0.08)",
cursor: "default",
      }}
    >
      {/* Drag handle */}
      <span
        {...attributes}
        {...listeners}
        style={{ color: "rgba(255,255,255,0.15)", cursor: "grab", fontSize: 14, flexShrink: 0 }}
      >⠿</span>

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
        color: isDone ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.85)",
        textDecoration: isDone ? "line-through" : "none",
      }}>{task.title}</span>

      {/* Focus star */}
      <span
        onClick={() => onToggleFocus(task.id)}
        title={task.is_focus ? "Remove from focus" : "Add to focus"}
        style={{
          fontSize: 14, cursor: "pointer", flexShrink: 0,
          color: task.is_focus ? "#FBBF24" : "rgba(255,255,255,0.15)",
          transition: "color 0.15s",
        }}
      >★</span>

      {/* Priority badge */}
      <span style={{
        padding: "2px 8px", borderRadius: 100, fontSize: 11, fontWeight: 600,
        background: p.bg, color: p.color, flexShrink: 0,
      }}>{p.label}</span>

      {/* Due date */}
      {task.due_date && (
        <span style={{ fontSize: 11.5, color: "rgba(255,255,255,0.28)", fontFamily: "monospace", flexShrink: 0 }}>
          {task.due_date === new Date().toISOString().split("T")[0] ? "Today" : task.due_date.slice(5)}
        </span>
      )}

      {/* Source badge */}
      {task.source !== "manual" && (
        <span style={{
          fontSize: 10, padding: "1px 6px", borderRadius: 4, fontWeight: 700, flexShrink: 0,
          background: task.source === "discord" ? "rgba(88,101,242,0.2)" : "rgba(234,67,53,0.15)",
          color: task.source === "discord" ? "#7289DA" : "#EA4335",
        }}>
          {task.source === "discord" ? "Discord" : "Gmail"}
        </span>
      )}

      {/* Delete */}
      <span
        onClick={() => onDelete(task.id)}
        style={{ fontSize: 16, color: "rgba(255,255,255,0.12)", cursor: "pointer", flexShrink: 0, lineHeight: 1 }}
      >×</span>
    </div>
  );
}

// ─── Quick-add form ───────────────────────────────────────────
function QuickAddForm({ onAdd }: { onAdd: (title: string, priority: Priority, dueDate: string) => void }) {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [dueDate, setDueDate] = useState("");
  const [open, setOpen] = useState(false);

  const handleSubmit = () => {
    if (!title.trim()) return;
    onAdd(title.trim(), priority, dueDate);
    setTitle(""); setPriority("medium"); setDueDate("");
    setOpen(false);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        style={{
          width: "100%", padding: "10px 14px", borderRadius: 10, marginBottom: 6,
          background: "transparent", border: "1px dashed rgba(255,255,255,0.12)",
          color: "rgba(255,255,255,0.3)", fontSize: 13.5, cursor: "pointer",
          textAlign: "left", display: "flex", alignItems: "center", gap: 8,
        }}
      >
        <span style={{ fontSize: 16 }}>+</span> Add task
      </button>
    );
  }

  return (
    <div style={{
      padding: 12, borderRadius: 10, marginBottom: 6,
      background: "rgba(74,158,255,0.07)", border: "1px solid rgba(74,158,255,0.25)",
    }}>
      <input
        autoFocus
        value={title}
        onChange={e => setTitle(e.target.value)}
        onKeyDown={e => { if (e.key === "Enter") handleSubmit(); if (e.key === "Escape") setOpen(false); }}
        placeholder="Task title... (Enter to save, Esc to cancel)"
        style={{
          width: "100%", background: "none", border: "none", outline: "none",
          color: "#fff", fontSize: 14, marginBottom: 10,
          fontFamily: "inherit",
        }}
      />
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <select
          value={priority}
          onChange={e => setPriority(e.target.value as Priority)}
          style={{
            background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 7, padding: "5px 8px", color: "#fff", fontSize: 12, cursor: "pointer",
          }}
        >
          <option value="urgent">🔴 Urgent</option>
          <option value="high">🟠 High</option>
          <option value="medium">🔵 Medium</option>
          <option value="low">⚪ Low</option>
        </select>
        <input
          type="date"
          value={dueDate}
          onChange={e => setDueDate(e.target.value)}
          style={{
            background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 7, padding: "5px 8px", color: "#fff", fontSize: 12, cursor: "pointer",
          }}
        />
        <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
          <button onClick={() => setOpen(false)} style={{
            background: "none", border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 7, padding: "5px 12px", color: "rgba(255,255,255,0.4)", fontSize: 12, cursor: "pointer",
          }}>Cancel</button>
          <button onClick={handleSubmit} style={{
            background: "#4A9EFF", border: "none",
            borderRadius: 7, padding: "5px 14px", color: "#fff", fontSize: 12,
            fontWeight: 600, cursor: "pointer",
          }}>Add Task</button>
        </div>
      </div>
    </div>
  );
}

// ─── Main TaskBoard ───────────────────────────────────────────
export default function TaskBoard() {
  const { tasks, loading, error, createTask, toggleStatus, toggleFocus, deleteTask, reorderTasks } = useTasks();
  const [activeTab, setActiveTab] = useState<"all" | TaskStatus>("all");

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const filtered = activeTab === "all" ? tasks : tasks.filter(t => t.status === activeTab);
  const overdue = selectOverdueTasks(tasks);
  const focus = selectFocusTasks(tasks);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const newIndex = filtered.findIndex(t => t.id === over.id);
      reorderTasks(active.id as string, newIndex);
    }
  };

  const handleAddTask = async (title: string, priority: Priority, dueDate: string) => {
    await createTask({ title, priority, due_date: dueDate || undefined, source: "manual" });
  };

  if (loading) return <div style={{ color: "rgba(255,255,255,0.4)", padding: 20 }}>Loading tasks...</div>;
  if (error)   return <div style={{ color: "#FF6B6B", padding: 20 }}>Error: {error}</div>;

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 3 }}>Tasks</h1>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.35)" }}>
            {tasks.filter(t => t.status === "done").length} done · {focus.length} in focus · {overdue.length > 0 && `${overdue.length} overdue`}
          </div>
        </div>
      </div>

      {/* Overdue warning */}
      {overdue.length > 0 && (
        <div style={{
          background: "rgba(255,68,68,0.08)", border: "1px solid rgba(255,68,68,0.2)",
          borderRadius: 10, padding: "10px 14px", marginBottom: 16,
          fontSize: 13, color: "#FF6B6B", display: "flex", alignItems: "center", gap: 8,
        }}>
          ⚠️ {overdue.length} overdue task{overdue.length > 1 ? "s" : ""} — check and reschedule
        </div>
      )}

      {/* Status tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
        {STATUS_TABS.map(tab => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            style={{
              padding: "6px 14px", borderRadius: 8, fontSize: 12.5, fontWeight: 500, cursor: "pointer",
              background: activeTab === tab.value ? "rgba(74,158,255,0.15)" : "rgba(255,255,255,0.05)",
              border: activeTab === tab.value ? "1px solid rgba(74,158,255,0.35)" : "1px solid rgba(255,255,255,0.07)",
              color: activeTab === tab.value ? "#4A9EFF" : "rgba(255,255,255,0.45)",
              transition: "all 0.15s",
            }}
          >
            {tab.label}
            <span style={{ marginLeft: 5, opacity: 0.6 }}>
              {tab.value === "all" ? tasks.length : tasks.filter(t => t.status === tab.value).length}
            </span>
          </button>
        ))}
      </div>

      {/* Quick add */}
      <QuickAddForm onAdd={handleAddTask} />

      {/* Sortable task list */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={filtered.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {filtered.map(task => (
            <SortableTaskCard
              key={task.id}
              task={task}
              onToggle={toggleStatus}
              onToggleFocus={toggleFocus}
              onDelete={deleteTask}
            />
          ))}
        </SortableContext>
      </DndContext>

      {filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: "40px 0", color: "rgba(255,255,255,0.2)", fontSize: 14 }}>
          {activeTab === "done" ? "Nothing completed yet today." : "No tasks here. Add one above ↑"}
        </div>
      )}
    </div>
  );
}
