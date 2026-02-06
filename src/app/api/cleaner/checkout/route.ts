import { NextRequest, NextResponse } from "next/server";
import { sendCheckoutEmail } from "@/lib/email";
import { isWithinGeofence } from "@/lib/geofence";
import { createRouteHandlerClient } from "@/lib/supabase/server";

interface CheckoutTaskPayload {
  item_id?: string;
  completed?: boolean;
}

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
      .select("role, full_name, email")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "cleaner") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { checkin_id, lat, lng, tasks, remarks, photo_urls } = body ?? {};

    if (!checkin_id || typeof lat !== "number" || typeof lng !== "number") {
      return NextResponse.json(
        { error: "Check-in and coordinates are required." },
        { status: 400 }
      );
    }

    const [{ data: checkin, error: checkinError }, { data: settings }] = await Promise.all([
      supabase
        .from("checkins")
        .select(
          "id, checkin_time, status, location:locations(id, name, address, latitude, longitude, geofence_radius, geofence_enabled)"
        )
        .eq("id", checkin_id)
        .eq("cleaner_id", user.id)
        .single(),
      supabase
        .from("app_settings")
        .select("geofence_enabled, company_name, logo_url, notify_on_checkout")
        .single(),
    ]);

    if (checkinError || !checkin) {
      return NextResponse.json({ error: "Check-in not found." }, { status: 404 });
    }

    if (checkin.status !== "checked_in") {
      return NextResponse.json({ error: "Already checked out." }, { status: 400 });
    }

    const location = Array.isArray(checkin.location) ? checkin.location[0] : checkin.location;

    const enforceGeofence = (settings?.geofence_enabled ?? true) && (location?.geofence_enabled ?? true);

    let withinGeofence = true;
    if (
      enforceGeofence &&
      location?.latitude !== null &&
      location?.latitude !== undefined &&
      location?.longitude !== null &&
      location?.longitude !== undefined &&
      typeof location?.geofence_radius === "number"
    ) {
      const { within } = isWithinGeofence(
        lat,
        lng,
        location.latitude,
        location.longitude,
        location.geofence_radius
      );
      withinGeofence = within;
    }

    const checkoutTime = new Date().toISOString();

    const { error: updateError } = await supabase
      .from("checkins")
      .update({
        checkout_time: checkoutTime,
        checkout_lat: lat,
        checkout_lng: lng,
        checkout_within_geofence: withinGeofence,
        remarks: typeof remarks === "string" ? remarks.trim() : null,
        status: "checked_out",
      })
      .eq("id", checkin_id)
      .eq("cleaner_id", user.id);

    if (updateError) {
      return NextResponse.json({ error: "Unable to check out." }, { status: 400 });
    }

    const taskPayload: CheckoutTaskPayload[] = Array.isArray(tasks) ? tasks : [];
    const taskRows = taskPayload
      .filter((task) => task?.item_id)
      .map((task) => ({
        checkin_id,
        checklist_item_id: String(task.item_id),
        is_completed: Boolean(task.completed),
      }));

    if (taskRows.length > 0) {
      const { error: taskError } = await supabase
        .from("checkout_tasks")
        .insert(taskRows);

      if (taskError) {
        return NextResponse.json(
          { error: "Unable to save checklist results." },
          { status: 400 }
        );
      }
    }

    const photoRows = (Array.isArray(photo_urls) ? photo_urls : [])
      .filter((url: unknown) => typeof url === "string" && url.length > 0)
      .map((url: string) => ({
        checkin_id,
        photo_url: url,
      }));

    if (photoRows.length > 0) {
      const { error: photoError } = await supabase
        .from("checkout_photos")
        .insert(photoRows);

      if (photoError) {
        return NextResponse.json(
          { error: "Unable to save photos." },
          { status: 400 }
        );
      }
    }

    const durationMs =
      new Date(checkoutTime).getTime() -
      new Date(checkin.checkin_time).getTime();
    const durationMinutes = Math.max(0, Math.floor(durationMs / 60000));
    const durationLabel = (() => {
      const hours = Math.floor(durationMinutes / 60);
      const minutes = durationMinutes % 60;
      if (hours > 0) return `${hours}h ${minutes}m`;
      return `${minutes}m`;
    })();

    const tasksCompleted = taskRows.filter((task) => task.is_completed).length;
    const totalTasks = taskRows.length;
    const photosCount = photoRows.length;

    const companyName = settings?.company_name || "Elivate";
    const logoUrl = settings?.logo_url || undefined;
    const notifyAdmins = settings?.notify_on_checkout ?? true;
    const cleanerEmail = user.email || profile?.email || "";
    const cleanerName = profile?.full_name || "Cleaner";

    if (cleanerEmail) {
      void sendCheckoutEmail({
        to: cleanerEmail,
        companyName,
        logoUrl,
        cleanerName,
        locationName: location?.name || "Unknown location",
        locationAddress: location?.address || "Unknown address",
        checkinTime: checkin.checkin_time,
        checkoutTime,
        durationLabel,
        tasksCompleted,
        totalTasks,
        photosCount,
        hasRemarks: Boolean(remarks),
        recipientRole: "cleaner",
      }).catch((emailError) => {
        console.error("Checkout email error:", emailError);
      });
    }

    if (notifyAdmins) {
      const { data: admins } = await supabase
        .from("profiles")
        .select("email")
        .eq("role", "admin")
        .eq("is_active", true);

      if (admins?.length) {
        void Promise.all(
          admins
            .map((admin) => admin.email)
            .filter(Boolean)
            .map((email) =>
              sendCheckoutEmail({
                to: email!,
                companyName,
                logoUrl,
                cleanerName,
                locationName: location?.name || "Unknown location",
                locationAddress: location?.address || "Unknown address",
                checkinTime: checkin.checkin_time,
                checkoutTime,
                durationLabel,
                tasksCompleted,
                totalTasks,
                photosCount,
                hasRemarks: Boolean(remarks),
                recipientRole: "admin",
              })
            )
        ).catch((emailError) => {
          console.error("Admin checkout email error:", emailError);
        });
      }
    }

    return NextResponse.json({
      data: {
        checkout_time: checkoutTime,
        duration_minutes: durationMinutes,
        tasks_completed: tasksCompleted,
        tasks_total: totalTasks,
        photos_count: photosCount,
        within_geofence: withinGeofence,
      },
    });
  } catch (error) {
    console.error("POST /api/cleaner/checkout error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
