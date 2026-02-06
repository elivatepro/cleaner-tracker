import { NextRequest, NextResponse } from "next/server";
import { sendCheckinEmail } from "@/lib/email";
import { isWithinGeofence } from "@/lib/geofence";
import { createServerClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
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
      .select("role, full_name, email")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "cleaner") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { location_id, lat, lng } = body ?? {};

    if (!location_id || typeof lat !== "number" || typeof lng !== "number") {
      return NextResponse.json(
        { error: "Location and coordinates are required." },
        { status: 400 }
      );
    }

    const { data: activeCheckin } = await supabase
      .from("checkins")
      .select("id")
      .eq("cleaner_id", user.id)
      .eq("status", "checked_in")
      .maybeSingle();

    if (activeCheckin) {
      return NextResponse.json(
        { error: "Already checked in." },
        { status: 409 }
      );
    }

    const { data: assignment } = await supabase
      .from("assignments")
      .select("id")
      .eq("cleaner_id", user.id)
      .eq("location_id", location_id)
      .eq("is_active", true)
      .maybeSingle();

    if (!assignment) {
      return NextResponse.json({ error: "Not assigned to this location." }, { status: 403 });
    }

    const { data: location, error: locationError } = await supabase
      .from("locations")
      .select("id, name, latitude, longitude, geofence_radius, is_active")
      .eq("id", location_id)
      .single();

    if (locationError || !location || !location.is_active) {
      return NextResponse.json({ error: "Location not available." }, { status: 400 });
    }

    if (location.latitude === null || location.longitude === null) {
      return NextResponse.json(
        { error: "Location is missing coordinates." },
        { status: 400 }
      );
    }

    const { within, distance } = isWithinGeofence(
      lat,
      lng,
      location.latitude,
      location.longitude,
      location.geofence_radius
    );

    if (!within) {
      return NextResponse.json(
        {
          error: "outside_geofence",
          distance,
          radius: location.geofence_radius,
        },
        { status: 403 }
      );
    }

    const { data: checkin, error } = await supabase
      .from("checkins")
      .insert({
        cleaner_id: user.id,
        location_id,
        checkin_lat: lat,
        checkin_lng: lng,
        checkin_within_geofence: within,
        status: "checked_in",
      })
      .select("id, checkin_time")
      .single();

    if (error || !checkin) {
      return NextResponse.json({ error: "Unable to check in." }, { status: 400 });
    }

    const { data: settings } = await supabase
      .from("app_settings")
      .select("company_name, notify_on_checkin")
      .single();

    const companyName = settings?.company_name || "Elivate";
    const notifyAdmins = settings?.notify_on_checkin ?? true;
    const cleanerEmail = user.email || profile?.email || "";

    if (cleanerEmail) {
      void sendCheckinEmail({
        to: cleanerEmail,
        companyName,
        locationName: location.name,
        checkinTime: checkin.checkin_time,
        recipientRole: "cleaner",
      }).catch((emailError) => {
        console.error("Check-in email error:", emailError);
      });
    }

    if (notifyAdmins) {
      const { data: admins } = await supabase
        .from("profiles")
        .select("email")
        .eq("role", "admin")
        .eq("is_active", true);

      if (admins?.length) {
        const cleanerName = profile?.full_name || "Cleaner";
        void Promise.all(
          admins
            .map((admin) => admin.email)
            .filter(Boolean)
            .map((email) =>
              sendCheckinEmail({
                to: email,
                companyName,
                locationName: location.name,
                checkinTime: checkin.checkin_time,
                cleanerName,
                recipientRole: "admin",
              })
            )
        ).catch((emailError) => {
          console.error("Admin check-in email error:", emailError);
        });
      }
    }

    return NextResponse.json({
      data: {
        checkin_id: checkin.id,
        checkin_time: checkin.checkin_time,
        distance,
      },
    });
  } catch (error) {
    console.error("POST /api/cleaner/checkin error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
