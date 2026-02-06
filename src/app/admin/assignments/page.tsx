import { AdminAssignmentsClient } from "@/components/AdminAssignmentsClient";
import { Card } from "@/components/ui/Card";
import { createServerClient } from "@/lib/supabase/server";

export default async function AdminAssignmentsPage() {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("assignments")
    .select("id, is_active, cleaner:profiles(full_name, avatar_url), location:locations(name)")
    .order("created_at", { ascending: false });

  const { data: cleaners } = await supabase
    .from("profiles")
    .select("id, full_name")
    .eq("role", "cleaner")
    .order("full_name");

  const { data: locations } = await supabase
    .from("locations")
    .select("id, name")
    .order("name");

  if (error) {
    return (
      <Card variant="danger">
        <p className="text-sm text-danger">
          We could not load assignments. Please refresh.
        </p>
      </Card>
    );
  }

  return (
    <AdminAssignmentsClient
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      assignments={(data ?? []).map((assignment: any) => ({
        ...assignment,
        cleaner: Array.isArray(assignment.cleaner) ? assignment.cleaner[0] : assignment.cleaner,
        location: Array.isArray(assignment.location) ? assignment.location[0] : assignment.location,
      }))}
      cleaners={(cleaners ?? []).map((cleaner) => ({
        id: cleaner.id,
        label: cleaner.full_name,
      }))}
      locations={(locations ?? []).map((location) => ({
        id: location.id,
        label: location.name,
      }))}
    />
  );
}
