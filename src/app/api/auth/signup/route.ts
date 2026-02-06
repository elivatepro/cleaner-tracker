import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createRouteHandlerClient } from "@/lib/supabase/server";
import { sendWelcomeEmail } from "@/lib/email";
import { getAppUrl } from "@/lib/utils";

interface SignupPayload {
  full_name?: string;
  password?: string;
  invite_token?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: SignupPayload = await request.json();
    const { full_name, password, invite_token } = body ?? {};

    if (!full_name || !password || !invite_token) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    const supabase = await createRouteHandlerClient();
    const { data: authData } = await supabase.auth.getUser();
    if (authData.user) {
      return NextResponse.json({ error: "Already signed in." }, { status: 400 });
    }

    const adminSupabase = createAdminSupabaseClient();
    const { data: invitation, error: inviteError } = await adminSupabase
      .from("invitations")
      .select("id, email, expires_at, accepted_at")
      .eq("token", invite_token)
      .single();

    if (inviteError || !invitation) {
      return NextResponse.json({ error: "Invalid invitation token." }, { status: 400 });
    }

    const isExpired = new Date(invitation.expires_at).getTime() < Date.now();
    if (invitation.accepted_at || isExpired) {
      return NextResponse.json({ error: "Invitation has expired." }, { status: 400 });
    }

    const { data: createdUser, error: createError } =
      await adminSupabase.auth.admin.createUser({
        email: invitation.email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name,
          phone: "",
          role: "cleaner",
        },
      });

    if (createError || !createdUser.user) {
      return NextResponse.json({ error: "Unable to create account." }, { status: 400 });
    }

    await adminSupabase
      .from("invitations")
      .update({ accepted_at: new Date().toISOString() })
      .eq("id", invitation.id);

    // Send Welcome Email
    const { data: settings } = await supabase
      .from("app_settings")
      .select("company_name, logo_url")
      .single();

    void sendWelcomeEmail({
      to: invitation.email,
      companyName: settings?.company_name || "Elivate",
      logoUrl: settings?.logo_url || undefined,
      cleanerName: full_name,
      appUrl: getAppUrl(),
    }).catch((e) => console.error("Welcome email error:", e));

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: invitation.email,
      password,
    });

    if (signInError) {
      return NextResponse.json({ error: "Account created, but sign-in failed." }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST /api/auth/signup error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
