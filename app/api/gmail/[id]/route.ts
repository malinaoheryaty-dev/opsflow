import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { user, supabase } = await requireUser();

    const { data: profile } = await supabase
      .from("profiles")
      .select("gmail_access_token")
      .eq("id", user.id)
      .single();

    if (!profile?.gmail_access_token) {
      return NextResponse.json(
        { error: "Gmail not connected" },
        { status: 401 }
      );
    }

    const res = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}?format=full`,
      {
        headers: {
          Authorization: `Bearer ${profile.gmail_access_token}`,
        },
      }
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: "Gmail API error" },
        { status: res.status }
      );
    }

    const data = await res.json();

    const headers = data.payload?.headers ?? [];

    const get = (name: string) =>
      headers.find(
        (h: any) => h.name.toLowerCase() === name.toLowerCase()
      )?.value ?? "";

    return NextResponse.json({
      id: data.id,
      subject: get("Subject") || "(no subject)",
      from: get("From"),
      to: get("To"),
      date: get("Date"),
      snippet: data.snippet ?? "",
      body: "",
      threadId: data.threadId,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}