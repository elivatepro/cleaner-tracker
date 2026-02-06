import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createRouteHandlerClient } from "@/lib/supabase/server";

interface AdminSignupPayload {
  full_name?: string;
  email?: string;
  password?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: AdminSignupPayload = await request.json();
    const { full_name, email, password } = body ?? {};

    if (!full_name || !email || !password) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    const supabase = await createRouteHandlerClient();

    const adminSupabase = createAdminSupabaseClient();

    // Check if user already exists
    const { data: existingUser } = await adminSupabase
      .from("profiles")
      .select("id")
      .eq("email", email.trim().toLowerCase())
      .maybeSingle();

    if (existingUser) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 400 });
    }

    const { data: createdUser, error: createError } =
      await adminSupabase.auth.admin.createUser({
        email: email.trim().toLowerCase(),
        password,
        email_confirm: true,
        user_metadata: {
          full_name: full_name.trim(),
          phone: "",
          role: "admin",
        },
      });

    if (createError || !createdUser.user) {
      console.error("Admin user creation error:", createError);
      return NextResponse.json({ error: createError?.message || "Unable to create admin account." }, { status: 400 });
    }

    // Sign out existing session to prevent conflicts before signing in new user
    await supabase.auth.signOut();

    // Sign in the newly created user
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (signInError) {
      return NextResponse.json({ error: "Account created, but sign-in failed." }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST /api/auth/admin/signup error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
