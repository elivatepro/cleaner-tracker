import { CleanerHomeClient } from "@/components/CleanerHomeClient";
import { Card } from "@/components/ui/Card";
import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function CleanerHomePage() {
  const supabase = await createServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  const { data: activeCheckin, error: activeError } = await supabase
    .from("checkins")
    .select(
      "id, checkin_time, location:locations(id, name, address, geofence_radius, latitude, longitude)"
    )
    .eq("cleaner_id", user.id)
    .eq("status", "checked_in")
    .order("checkin_time", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: assignments, error: assignmentsError } = await supabase
    .from("assignments")
    .select(
      "id, location:locations(id, name, address, geofence_radius, latitude, longitude)"
    )
    .eq("cleaner_id", user.id)
    .eq("is_active", true);

  if (activeError || assignmentsError) {
    return (
      <Card variant="danger">
        <p className="text-sm text-neutral-600">
          We could not load your assignments right now. Please refresh the page.
        </p>
      </Card>
    );
  }

  return (
    <CleanerHomeClient
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      assignments={(assignments ?? []).map((assignment: any) => ({
        ...assignment,
        location: Array.isArray(assignment.location) ? assignment.location[0] : assignment.location,
      }))}
      initialActiveCheckin={activeCheckin ? {
        ...activeCheckin,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        location: Array.isArray((activeCheckin as any).location) ? (activeCheckin as any).location[0] : (activeCheckin as any).location,
      } : null}
    />
  );
}
