import { AdminSettingsClient } from "@/components/AdminSettingsClient";
import { Card } from "@/components/ui/Card";
import { createServerClient } from "@/lib/supabase/server";

export default async function AdminSettingsPage() {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("app_settings")
    .select(
      "company_name, primary_color, secondary_color, default_geofence_radius, notify_on_checkin, notify_on_checkout, geofence_enabled"
    )
    .single();

  if (error || !data) {
    return (
      <Card variant="danger">
        <p className="text-sm text-neutral-600">
          We could not load settings. Please refresh.
        </p>
      </Card>
    );
  }

  return <AdminSettingsClient settings={data} />;
}
