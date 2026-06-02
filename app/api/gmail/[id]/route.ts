// SAVE AS: app/api/gmail/[id]/route.ts

import { NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function decodeBody(data: string) {
  return Buffer.from(
    data.replace(/-/g, "+").replace(/_/g, "/"),
    "base64"
  ).toString("utf-8");
}

function extractBody(payload: any): string {
  if (!payload) return "";

  if (payload.mimeType === "text/plain" && payload.body?.data) {
    return decodeBody(payload.body.data);
  }

  if (payload.mimeType === "text/html" && payload.body?.data) {
    return decodeBody(payload.body.data);
  }

  if (payload.parts) {
    const plain = payload.parts.find(
      (p: any) => p.mimeType === "text/plain"
    );
    if (plain?.body?.data) return decodeBody(plain.body.data);

    const html = payload.parts.find(
      (p: any) => p.mimeType === "text/html"
    );
    if (html?.body?.data) return decodeBody(html.body.data);

    for (const part of payload.parts) {
      const result = extractBody(part);
      if (result) return result;
    }
  }

  return "";
}

export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const { params } = context;

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
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${params.id}?format=full`,
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

    const body = extractBody(data.payload);

    return NextResponse.json({
      id: data.id,
      subject: get("Subject") || "(no subject)",
      from: get("From"),
      to: get("To"),
      date: get("Date"),
      snippet: data.snippet ?? "",
      body,
      threadId: data.threadId,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}