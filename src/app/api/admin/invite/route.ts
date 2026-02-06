import { NextRequest, NextResponse } from "next/server";
import { sendInviteEmail } from "@/lib/email";
import { createRouteHandlerClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { email } = body ?? {};

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("invitations")
      .insert({ email: email.trim(), invited_by: user.id })
      .select("id, email, token, created_at, expires_at")
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Unable to create invitation." }, { status: 400 });
    }

    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;
    const inviteLink = `${appUrl}/signup?token=${data.token}`;

    const { data: settings } = await supabase
      .from("app_settings")
      .select("company_name")
      .single();

    const companyName = settings?.company_name || "Elivate";

    void sendInviteEmail({
      to: data.email,
      inviteLink,
      companyName,
      expiresAt: data.expires_at,
    }).catch((error) => {
      console.error("Invite email error:", error);
    });

    return NextResponse.json({
      data: {
        id: data.id,
        email: data.email,
        token: data.token,
        invite_link: inviteLink,
        created_at: data.created_at,
        expires_at: data.expires_at,
      },
    });
  } catch (error) {
    console.error("POST /api/admin/invite error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
