import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/lib/supabase/server";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

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
    const { geofence_enabled } = body ?? {};

    if (typeof geofence_enabled !== "boolean") {
      return NextResponse.json({ error: "geofence_enabled must be a boolean." }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("locations")
      .update({ geofence_enabled })
      .eq("id", id)
      .select("id, name, address, geofence_radius, geofence_enabled, is_active")
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Unable to update location." }, { status: 400 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error(`PATCH /api/admin/locations/${id} error:`, error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
