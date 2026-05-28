// types/database.ts
// These mirror your Supabase schema exactly

export type Priority = "urgent" | "high" | "medium" | "low";
export type TaskStatus = "todo" | "in_progress" | "done" | "blocked" | "cancelled";
export type RecurrenceType = "none" | "daily" | "weekly" | "monthly";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  timezone: string;
  onboarding_complete: boolean;
  preferences: {
    theme: "dark" | "light";
    ai_enabled: boolean;
    eod_report_time: string;
    daily_focus_limit: number;
  };
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  priority: Priority;
  status: TaskStatus;
  due_date: string | null;       // ISO date string "2026-05-20"
  due_time: string | null;       // "14:30:00"
  is_focus: boolean;
  recurrence: RecurrenceType;
  recurrence_config: Record<string, unknown> | null;
  tags: string[];
  source: "manual" | "discord" | "gmail" | "ai";
  source_ref: string | null;
  sort_order: number;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Note {
  id: string;
  user_id: string;
  title: string | null;
  content: string | null;
  content_text: string | null;
  ai_summary: string | null;
  tags: string[];
  is_pinned: boolean;
  linked_task_ids: string[];
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  id: string;
  owner_id: string;
  name: string;
  email: string | null;
  discord_username: string | null;
  role: string | null;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
}

export interface TaskAssignment {
  id: string;
  task_id: string;
  assigned_by: string;
  assigned_to: string;
  status: "assigned" | "acknowledged" | "in_progress" | "completed" | "overdue";
  notes: string | null;
  due_date: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  task?: Task;
  team_member?: TeamMember;
}

export interface EODReport {
  id: string;
  user_id: string;
  report_date: string;
  completed_tasks: string[];
  pending_tasks: string[];
  delegated_tasks: string[];
  key_conversations: unknown[];
  ai_summary: string | null;
  productivity_score: number | null;
  mood: string | null;
  highlights: string | null;
  blockers: string | null;
  next_day_focus: string[];
  exported_at: string | null;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  task_id: string | null;
  assignment_id: string | null;
  actor_type: "user" | "team_member" | "ai" | "system";
  actor_id: string;
  action: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

// ─── API response wrappers ────────────────────────────────────
export type ApiResponse<T> =
  | { data: T; error: null }
  | { data: null; error: string };

// ─── Form types ───────────────────────────────────────────────
export type CreateTaskInput = Pick<Task,
  "title" | "priority" | "status" | "due_date" | "is_focus" | "tags" | "source"
> & Partial<Pick<Task, "description" | "recurrence" | "due_time">>;

export type UpdateTaskInput = Partial<CreateTaskInput> & { id: string };
