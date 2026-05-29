// SAVE AS: app/api/gmail/send/route.ts
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function makeRaw({
  to,
  from,
  subject,
  body,
  threadId,
  inReplyTo,
}: {
  to: string;
  from: string;
  subject: string;
  body: string;
  threadId?: string;
  inReplyTo?: string;
}) {
  const lines = [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    `Content-Type: text/plain; charset=utf-8`,
  ];
  if (inReplyTo) {
    lines.push(`In-Reply-To: ${inReplyTo}`);
    lines.push(`References: ${inReplyTo}`);
  }
  lines.push("", body);
  const raw = lines.join("\r\n");
  return Buffer.from(raw)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export async function POST(req: Request) {
  try {
    const { user, supabase } = await requireUser();

    const { data: profile } = await supabase
      .from("profiles")
      .select("gmail_access_token, gmail_email")
      .eq("id", user.id)
      .single();

    if (!profile?.gmail_access_token) {
      return NextResponse.json({ error: "Gmail not connected" }, { status: 401 });
    }

    const { to, subject, body, threadId, inReplyTo } = await req.json();

    const raw = makeRaw({
      to,
      from: profile.gmail_email ?? "me",
      subject,
      body,
      threadId,
      inReplyTo,
    });

    const payload: any = { raw };
    if (threadId) payload.threadId = threadId;

    const res = await fetch(
      "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${profile.gmail_access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    if (!res.ok) {
      const err = await res.json();
      return NextResponse.json({ error: err?.error?.message ?? "Send failed" }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json({ success: true, id: data.id });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}