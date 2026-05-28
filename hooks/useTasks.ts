// hooks/useTasks.ts
// Full task management hook with optimistic UI updates

"use client";

import { useState, useEffect, useCallback } from "react";
import type { Task, CreateTaskInput, TaskStatus, Priority } from "@/types/database";

interface UseTasksOptions {
  status?: TaskStatus;
  focusOnly?: boolean;
  tag?: string;
}

interface UseTasksReturn {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  createTask: (input: Partial<CreateTaskInput>) => Promise<Task>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<Task>;
  deleteTask: (id: string) => Promise<void>;
  toggleStatus: (id: string) => Promise<void>;
  toggleFocus: (id: string) => Promise<void>;
  reorderTasks: (taskId: string, newIndex: number) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useTasks(options: UseTasksOptions = {}): UseTasksReturn {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const buildUrl = useCallback(() => {
    const params = new URLSearchParams();
    if (options.status) params.set("status", options.status);
    if (options.focusOnly) params.set("focus", "true");
    if (options.tag) params.set("tag", options.tag);
    return `/api/tasks${params.toString() ? `?${params}` : ""}`;
  }, [options.status, options.focusOnly, options.tag]);

  const fetchTasks = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch(buildUrl());
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setTasks(data.tasks ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }, [buildUrl]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  // ─── Create ─────────────────────────────────────────────────
  const createTask = async (input: Partial<CreateTaskInput>): Promise<Task> => {
    // Optimistic: add placeholder immediately
    const tempId = `temp-${Date.now()}`;
    const optimistic: Task = {
      id: tempId,
      user_id: "",
      title: input.title ?? "New Task",
      description: null,
      priority: (input.priority as Priority) ?? "medium",
      status: (input.status as TaskStatus) ?? "todo",
      due_date: input.due_date ?? null,
      due_time: null,
      is_focus: input.is_focus ?? false,
      recurrence: "none",
      recurrence_config: null,
      tags: input.tags ?? [],
      source: "manual",
      source_ref: null,
      sort_order: tasks.length,
      completed_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setTasks(prev => [optimistic, ...prev]);

    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      // Replace optimistic with real record
      setTasks(prev => prev.map(t => t.id === tempId ? data.task : t));
      return data.task;
    } catch (e) {
      // Rollback
      setTasks(prev => prev.filter(t => t.id !== tempId));
      throw e;
    }
  };

  // ─── Update ─────────────────────────────────────────────────
  const updateTask = async (id: string, updates: Partial<Task>): Promise<Task> => {
    // Optimistic update
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));

    try {
      const res = await fetch("/api/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...updates }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setTasks(prev => prev.map(t => t.id === id ? data.task : t));
      return data.task;
    } catch (e) {
      // Rollback by refetching
      await fetchTasks();
      throw e;
    }
  };

  // ─── Delete ─────────────────────────────────────────────────
  const deleteTask = async (id: string): Promise<void> => {
    const deleted = tasks.find(t => t.id === id);
    setTasks(prev => prev.filter(t => t.id !== id)); // optimistic

    try {
      const res = await fetch("/api/tasks", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error("Delete failed");
    } catch (e) {
      if (deleted) setTasks(prev => [...prev, deleted]); // rollback
      throw e;
    }
  };

  // ─── Toggle done/todo ────────────────────────────────────────
  const toggleStatus = async (id: string): Promise<void> => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    const newStatus: TaskStatus = task.status === "done" ? "todo" : "done";
    await updateTask(id, { status: newStatus });
  };

  // ─── Toggle focus ────────────────────────────────────────────
  const toggleFocus = async (id: string): Promise<void> => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    await updateTask(id, { is_focus: !task.is_focus });
  };

  // ─── Reorder (after drag-and-drop) ──────────────────────────
  const reorderTasks = async (taskId: string, newIndex: number): Promise<void> => {
    const reordered = [...tasks];
    const oldIndex = reordered.findIndex(t => t.id === taskId);
    if (oldIndex === -1) return;

    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);

    // Update sort_order for all affected tasks
    const withNewOrder = reordered.map((t, i) => ({ ...t, sort_order: i }));
    setTasks(withNewOrder); // optimistic

    // Persist all reordered tasks (batch update)
    await Promise.all(
      withNewOrder.map(t =>
        fetch("/api/tasks", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: t.id, sort_order: t.sort_order }),
        })
      )
    );
  };

  return {
    tasks,
    loading,
    error,
    createTask,
    updateTask,
    deleteTask,
    toggleStatus,
    toggleFocus,
    reorderTasks,
    refresh: fetchTasks,
  };
}

// ─── Derived selectors (use with your tasks array) ────────────
export const selectFocusTasks = (tasks: Task[]) =>
  tasks.filter(t => t.is_focus && t.status !== "done" && t.status !== "cancelled");

export const selectTodayTasks = (tasks: Task[]) => {
  const today = new Date().toISOString().split("T")[0];
  return tasks.filter(t => t.due_date === today && t.status !== "done");
};

export const selectOverdueTasks = (tasks: Task[]) => {
  const today = new Date().toISOString().split("T")[0];
  return tasks.filter(t =>
    t.due_date && t.due_date < today &&
    t.status !== "done" && t.status !== "cancelled"
  );
};

export const selectCompletedToday = (tasks: Task[]) => {
  const today = new Date().toISOString().split("T")[0];
  return tasks.filter(t =>
    t.completed_at && t.completed_at.startsWith(today)
  );
};
