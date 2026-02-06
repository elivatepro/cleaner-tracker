import Link from "next/link";
import { redirect } from "next/navigation";
import { CleanerCheckoutClient } from "@/components/CleanerCheckoutClient";
import { Card } from "@/components/ui/Card";
import { createServerClient } from "@/lib/supabase/server";

interface CleanerCheckoutPageProps {
  searchParams: Promise<{ checkin?: string }>;
}

export default async function CleanerCheckoutPage({
  searchParams,
}: CleanerCheckoutPageProps) {
  const { checkin: checkinId } = await searchParams;

  if (!checkinId) {
    return (
      <Card variant="danger">
        <p className="text-sm text-danger">
          Missing check-in reference. Please return to the home screen.
        </p>
      </Card>
    );
  }

  const supabase = await createServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  const { data: checkin, error } = await supabase
    .from("checkins")
    .select(
      "id, checkin_time, status, location:locations(id, name)"
    )
    .eq("id", checkinId)
    .eq("cleaner_id", user.id)
    .single();

  if (error || !checkin) {
    return (
      <Card variant="danger">
        <p className="text-sm text-danger">
          Check-in not found. Please return to the home screen.
        </p>
      </Card>
    );
  }

  if (checkin.status !== "checked_in") {
    return (
      <Card>
        <p className="text-sm text-secondary-muted">
          This check-in is already checked out.
        </p>
        <div className="mt-3">
          <Link className="text-sm text-accent hover:text-white transition-colors" href="/cleaner">
            Back to Home
          </Link>
        </div>
      </Card>
    );
  }

  const location = Array.isArray(checkin.location) ? checkin.location[0] : checkin.location;

  const { data: defaultItems } = await supabase
    .from("checklist_items")
    .select("id, label")
    .eq("is_default", true)
    .eq("is_active", true)
    .order("sort_order");

  const { data: locationItems } = await supabase
    .from("checklist_items")
    .select("id, label")
    .eq("location_id", location?.id ?? "")
    .eq("is_active", true)
    .order("sort_order");

  return (
    <div className="flex flex-col gap-6">
      <Link className="text-sm text-accent hover:text-white transition-colors" href="/cleaner">
        &lt;- Back to Home
      </Link>
      <CleanerCheckoutClient
        checkinId={checkin.id}
        locationName={location?.name || "Unknown location"}
        checkinTime={checkin.checkin_time}
        defaultItems={defaultItems ?? []}
        locationItems={locationItems ?? []}
      />
    </div>
  );
}
