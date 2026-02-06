import { AdminChecklistClient } from "@/components/AdminChecklistClient";
import { Card } from "@/components/ui/Card";
import { createServerClient } from "@/lib/supabase/server";

export default async function AdminChecklistPage() {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("checklist_items")
    .select("id, label, is_active")
    .eq("is_default", true)
    .order("sort_order");

  if (error) {
    return (
      <Card variant="danger">
        <p className="text-sm text-neutral-600">
          We could not load checklist items. Please refresh.
        </p>
      </Card>
    );
  }

  return <AdminChecklistClient items={data ?? []} />;
}
