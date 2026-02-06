import { AdminCleanersClient } from "@/components/AdminCleanersClient";
import { Card } from "@/components/ui/Card";
import { createServerClient } from "@/lib/supabase/server";

export default async function AdminCleanersPage() {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, phone, is_active")
    .eq("role", "cleaner")
    .order("full_name");

  const { data: invitations } = await supabase
    .from("invitations")
    .select("id, email, created_at, expires_at")
    .is("accepted_at", null)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <Card variant="danger">
        <p className="text-sm text-neutral-600">
          We could not load cleaners. Please refresh.
        </p>
      </Card>
    );
  }

  return (
    <AdminCleanersClient
      cleaners={data ?? []}
      invitations={invitations ?? []}
    />
  );
}
