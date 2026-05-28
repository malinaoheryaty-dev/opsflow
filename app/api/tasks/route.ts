// SAVE AS: app/api/tasks/route.ts

import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import type { CreateTaskInput } from "@/types/database";

// ─── GET /api/tasks ───────────────────────────────────────────
// Query params: ?status=todo&focus=true&limit=50
export async function GET(req: NextRequest) {
  try {
    const { user, supabase } = await requireUser();
    const { searchParams } = new URL(req.url);

    const status = searchParams.get("status");
    const focus = searchParams.get("focus");
    const limit = parseInt(searchParams.get("limit") ?? "100");
    const tag = searchParams.get("tag");

    let query = supabase
      .from("tasks")
      .select("*")
      .eq("user_id", user.id)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false })
      .limit(limit);

    if (status) query = query.eq("status", status);
    if (focus === "true") query = query.eq("is_focus", true);
    if (tag) query = query.contains("tags", [tag]);

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ tasks: data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Server error";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

// ─── POST /api/tasks ──────────────────────────────────────────
// Body: CreateTaskInput
export async function POST(req: NextRequest) {
  try {
    const { user, supabase } = await requireUser();
    const body: CreateTaskInput = await req.json();

    if (!body.title?.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("tasks")
      .insert({
        user_id: user.id,
        title: body.title.trim(),
        description: body.description ?? null,
        priority: body.priority ?? "medium",
        status: body.status ?? "todo",
        due_date: body.due_date ?? null,
        due_time: body.due_time ?? null,
        is_focus: body.is_focus ?? false,
        recurrence: body.recurrence ?? "none",
        tags: body.tags ?? [],
        source: body.source ?? "manual",
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ task: data }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Server error";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

// ─── PATCH /api/tasks ─────────────────────────────────────────
// Body: { id: string, ...fields to update }
export async function PATCH(req: NextRequest) {
  try {
    const { user, supabase } = await requireUser();
    const { id, ...updates } = await req.json();

    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    // Strip fields the user shouldn't be able to set directly
    delete updates.user_id;
    delete updates.created_at;

    const { data, error } = await supabase
      .from("tasks")
      .update(updates)
      .eq("id", id)
      .eq("user_id", user.id) // RLS double-check
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ task: data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Server error";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

// ─── DELETE /api/tasks ────────────────────────────────────────
// Body: { id: string }
export async function DELETE(req: NextRequest) {
  try {
    const { user, supabase } = await requireUser();
    const { id } = await req.json();

    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Server error";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
