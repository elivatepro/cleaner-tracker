import { AdminLocationsClient } from "@/components/AdminLocationsClient";
import { Card } from "@/components/ui/Card";
import { createServerClient } from "@/lib/supabase/server";

export default async function AdminLocationsPage() {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("locations")
    .select("id, name, address, geofence_radius, geofence_enabled, is_active")
    .order("name");

  if (error) {
    return (
      <Card variant="danger">
        <p className="text-sm text-danger">
          We could not load locations. Please refresh.
        </p>
      </Card>
    );
  }

  return <AdminLocationsClient locations={data ?? []} />;
}
