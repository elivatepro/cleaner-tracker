import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { createServerClient } from "@/lib/supabase/server";
import { ArrowLeft } from "lucide-react";

interface LocationDetailProps {
  params: Promise<{ id: string }>;
}

export default async function AdminLocationDetailPage({
  params,
}: LocationDetailProps) {
  const { id } = await params;
  const supabase = await createServerClient();
  const { data: location, error } = await supabase
    .from("locations")
    .select("id, name, address, geofence_radius, geofence_enabled, is_active")
    .eq("id", id)
    .single();

  if (error || !location) {
    return (
      <Card variant="danger">
        <p className="text-sm text-danger">
          Location not found. Please go back and try again.
        </p>
      </Card>
    );
  }

  const { data: checklist } = await supabase
    .from("checklist_items")
    .select("id, label, is_active, is_default")
    .eq("location_id", id)
    .order("sort_order");

  return (
    <div className="flex flex-col gap-6">
      <Link className="flex items-center gap-2 text-sm text-secondary-dim hover:text-white transition-colors" href="/admin/locations">
        <ArrowLeft className="h-4 w-4" /> Back to locations
      </Link>

      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-white">{location.name}</h1>
          <Badge variant={location.is_active ? "success" : "danger"}>
            {location.is_active ? "Active" : "Inactive"}
          </Badge>
        </div>
        <p className="text-sm text-secondary-muted">{location.address}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-white">Details</h2>
          <Card>
            <div className="grid gap-4 text-sm">
              <div>
                <p className="text-xs text-secondary-dim uppercase tracking-wider font-semibold">Geofence Radius</p>
                <p className="mt-1 text-white">{location.geofence_radius} meters</p>
              </div>
              <div>
                <p className="text-xs text-secondary-dim uppercase tracking-wider font-semibold">Geofence Enforcement</p>
                <p className="mt-1 text-white">{location.geofence_enabled ? "On" : "Off"}</p>
              </div>
              <div>
                <p className="text-xs text-secondary-dim uppercase tracking-wider font-semibold">Address</p>
                <p className="mt-1 text-white">{location.address}</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-white">Custom Checklist</h2>
          {checklist && checklist.length > 0 ? (
            <Card>
              <div className="flex flex-col gap-3">
                {checklist.map((item) => (
                  <div key={item.id} className="flex items-center justify-between py-2 border-b border-primary-border last:border-0">
                    <span className="text-sm text-white">{item.label}</span>
                    <Badge variant={item.is_active ? "success" : "neutral"}>
                      {item.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
          ) : (
            <Card>
              <p className="text-sm text-secondary-muted">No custom checklist items defined for this location.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
