import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createServerClient();
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

    if (profile?.role !== "cleaner") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { full_name, phone, avatar_url } = body ?? {};

    if (!full_name || typeof full_name !== "string") {
      return NextResponse.json({ error: "Full name is required." }, { status: 400 });
    }

    const updatePayload: Record<string, string | null> = {
      full_name: full_name.trim(),
      phone: typeof phone === "string" ? phone.trim() : null,
      updated_at: new Date().toISOString(),
    };

    if (typeof avatar_url === "string") {
      updatePayload.avatar_url = avatar_url.trim();
    }

    const { data, error } = await supabase
      .from("profiles")
      .update(updatePayload)
      .eq("id", user.id)
      .select("full_name, email, phone, avatar_url")
      .single();

    if (error) {
      return NextResponse.json({ error: "Unable to update profile." }, { status: 400 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("PATCH /api/cleaner/profile error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
