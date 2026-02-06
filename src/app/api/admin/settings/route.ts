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

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { notify_on_checkin, notify_on_checkout } = body ?? {};

    const updates: Record<string, boolean> = {};
    if (typeof notify_on_checkin === "boolean") {
      updates.notify_on_checkin = notify_on_checkin;
    }
    if (typeof notify_on_checkout === "boolean") {
      updates.notify_on_checkout = notify_on_checkout;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No valid settings provided." },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("app_settings")
      .update(updates)
      .select(
        "company_name, primary_color, secondary_color, default_geofence_radius, notify_on_checkin, notify_on_checkout"
      )
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Unable to update settings." }, { status: 400 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("PATCH /api/admin/settings error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
