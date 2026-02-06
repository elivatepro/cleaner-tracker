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
    const { invite_id } = body ?? {};

    if (!invite_id) {
      return NextResponse.json({ error: "Invitation ID is required." }, { status: 400 });
    }

    const { data: invitation, error: inviteError } = await supabase
      .from("invitations")
      .select("id, email, token, expires_at, accepted_at")
      .eq("id", invite_id)
      .single();

    if (inviteError || !invitation) {
      return NextResponse.json({ error: "Invitation not found." }, { status: 404 });
    }

    if (invitation.accepted_at) {
      return NextResponse.json({ error: "Invitation already accepted." }, { status: 400 });
    }

    // Update expiration
    const newExpiresAt = new Date();
    newExpiresAt.setHours(newExpiresAt.getHours() + 72);

    const { data: updated, error: updateError } = await supabase
      .from("invitations")
      .update({ expires_at: newExpiresAt.toISOString() })
      .eq("id", invite_id)
      .select("id, email, token, expires_at")
      .single();

    if (updateError || !updated) {
      return NextResponse.json({ error: "Unable to refresh invitation." }, { status: 400 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;
    const inviteLink = `${appUrl}/signup?token=${updated.token}`;

    const { data: settings } = await supabase
      .from("app_settings")
      .select("company_name, logo_url")
      .single();

    const companyName = settings?.company_name || "Elivate";
    const logoUrl = settings?.logo_url || undefined;

    try {
      await sendInviteEmail({
        to: updated.email,
        inviteLink,
        companyName,
        logoUrl,
      });
    } catch (error) {
      console.error("Resend invite email error:", error);
      return NextResponse.json({ error: "Unable to send invitation email." }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST /api/admin/invite/resend error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
