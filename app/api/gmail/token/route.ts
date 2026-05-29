import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { user, supabase } = await requireUser();
    const { access_token } = await req.json();

    await supabase
      .from("profiles")
      .update({ gmail_access_token: access_token })
      .eq("id", user.id);

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error";
    return NextResponse.json({ error: msg }, { status: 401 });
  }
}