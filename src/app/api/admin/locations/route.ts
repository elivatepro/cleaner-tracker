import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/lib/supabase/server";
import { geocodeAddress } from "@/lib/geocode";

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
    const { name, address, geofence_radius, geofence_enabled } = body ?? {};

    if (!name || !address) {
      return NextResponse.json(
        { error: "Name and address are required." },
        { status: 400 }
      );
    }

    let radius = typeof geofence_radius === "number" ? geofence_radius : null;
    if (radius !== null && (radius < 50 || radius > 500)) {
      return NextResponse.json(
        { error: "Geofence radius must be between 50 and 500 meters." },
        { status: 400 }
      );
    }

    if (radius === null) {
      const { data: settings } = await supabase
        .from("app_settings")
        .select("default_geofence_radius")
        .single();
      radius = settings?.default_geofence_radius ?? 200;
    }

    const geocodeResult = await geocodeAddress(address);
    if (!geocodeResult) {
      return NextResponse.json(
        { error: "Unable to geocode this address." },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("locations")
      .insert({
        name: String(name).trim(),
        address: geocodeResult.formatted_address,
        latitude: geocodeResult.lat,
        longitude: geocodeResult.lng,
        geofence_radius: radius,
        geofence_enabled: typeof geofence_enabled === "boolean" ? geofence_enabled : true,
      })
      .select("id, name, address, geofence_radius, geofence_enabled, is_active")
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Unable to create location." }, { status: 400 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("POST /api/admin/locations error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
