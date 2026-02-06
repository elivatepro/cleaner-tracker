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

    const normalizedEmail = email.trim().toLowerCase();

    // 1. Check if email already exists in profiles
    const { data: existingUser } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 400 }
      );
    }

    // 2. Check if there is already a pending invitation for this email
    const { data: existingInvite } = await supabase
      .from("invitations")
      .select("id, expires_at")
      .eq("email", normalizedEmail)
      .is("accepted_at", null)
      .maybeSingle();

    if (existingInvite) {
      const isExpired = new Date(existingInvite.expires_at).getTime() < Date.now();
      if (!isExpired) {
        return NextResponse.json(
          { error: "A pending invitation already exists for this email." },
          { status: 400 }
        );
      }
      // If it is expired, we can just delete it or ignore it and let the new insert happen
      // (Supabase schema might have a unique constraint on email for invitations though)
      await supabase.from("invitations").delete().eq("id", existingInvite.id);
    }

    const { data, error } = await supabase
      .from("invitations")
      .insert({ email: normalizedEmail, invited_by: user.id })
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
      .select("company_name, logo_url")
      .single();

    const companyName = settings?.company_name || "Elivate";
    const logoUrl = settings?.logo_url || undefined;

    void sendInviteEmail({
      to: data.email,
      inviteLink,
      companyName,
      logoUrl,
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
