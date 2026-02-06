import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/lib/supabase/server";
import { sendAssignmentEmail } from "@/lib/email";

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
    const { cleaner_id, location_id } = body ?? {};

    if (!cleaner_id || !location_id) {
      return NextResponse.json(
        { error: "Cleaner and location are required." },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("assignments")
      .insert({
        cleaner_id,
        location_id,
        is_active: true,
      })
      .select("id")
      .single();

    if (error) {
      const message =
        error.code === "23505"
          ? "Assignment already exists."
          : "Unable to create assignment.";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    // fetch cleaner email/name and location name
    const [{ data: cleanerProfile }, { data: location }] = await Promise.all([
      supabase
        .from("profiles")
        .select("full_name, email")
        .eq("id", cleaner_id)
        .single(),
      supabase
        .from("locations")
        .select("name, address")
        .eq("id", location_id)
        .single(),
    ]);

    if (cleanerProfile?.email && location?.name) {
      const { data: settings } = await supabase
        .from("app_settings")
        .select("company_name")
        .single();

      const companyName = settings?.company_name || "Elivate";
      const cleanerName = cleanerProfile.full_name || null;
      const address = location.address || null;

      void sendAssignmentEmail({
        to: cleanerProfile.email,
        companyName,
        locationName: location.name,
        address,
        cleanerName,
      }).catch((emailError) => {
        console.error("Assignment email error:", emailError);
      });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("POST /api/admin/assignments error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
