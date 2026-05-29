import { NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { user, supabase } = await requireUser();

    // Get stored Google token from profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("gmail_access_token")
      .eq("id", user.id)
      .single();

    if (!profile?.gmail_access_token) {
      return NextResponse.json({ error: "Gmail not connected" }, { status: 401 });
    }

    // Fetch unread emails from Gmail API
    const listRes = await fetch(
      "https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=10&q=is:unread",
      { headers: { Authorization: `Bearer ${profile.gmail_access_token}` } }
    );

    if (!listRes.ok) {
      return NextResponse.json({ error: "Gmail API error" }, { status: 401 });
    }

    const listData = await listRes.json();
    const messages = listData.messages ?? [];

    // Fetch details for each email
    const emails = await Promise.all(
      messages.slice(0, 8).map(async (msg: { id: string }) => {
        const detailRes = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=Date`,
          { headers: { Authorization: `Bearer ${profile.gmail_access_token}` } }
        );
        const detail = await detailRes.json();
        const headers = detail.payload?.headers ?? [];
        const get = (name: string) => headers.find((h: { name: string; value: string }) => h.name === name)?.value ?? "";
        return {
          id: msg.id,
          subject: get("Subject") || "(no subject)",
          from: get("From"),
          date: get("Date"),
          snippet: detail.snippet ?? "",
        };
      })
    );

    return NextResponse.json({ emails });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error";
    return NextResponse.json({ error: msg }, { status: msg === "Unauthorized" ? 401 : 500 });
  }
}