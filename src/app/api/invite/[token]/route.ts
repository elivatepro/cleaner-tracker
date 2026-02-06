import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

interface Params {
  params: Promise<{ token: string }>;
}

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { token } = await params;
    if (!token) {
      return NextResponse.json({ error: "Invite token is required." }, { status: 400 });
    }

    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from("invitations")
      .select("email, expires_at, accepted_at")
      .eq("token", token)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Invite not found." }, { status: 404 });
    }

    const isExpired = new Date(data.expires_at).getTime() < Date.now();
    if (data.accepted_at || isExpired) {
      return NextResponse.json({ error: "Invite is no longer valid." }, { status: 410 });
    }

    return NextResponse.json({ data: { email: data.email, expires_at: data.expires_at } });
  } catch (error) {
    console.error("GET /api/invite/[token] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
