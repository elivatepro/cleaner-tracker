import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import { createServerClient } from "@/lib/supabase/server";

interface CleanerDetailProps {
  params: Promise<{ id: string }>;
}

export default async function AdminCleanerDetailPage({ params }: CleanerDetailProps) {
  const { id } = await params;
  const supabase = await createServerClient();
  const { data: cleaner, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, phone, avatar_url, is_active")
    .eq("id", id)
    .single();

  if (error || !cleaner) {
    return (
      <Card variant="danger">
        <p className="text-sm text-neutral-600">
          Cleaner not found. Please go back and try again.
        </p>
      </Card>
    );
  }

  const { data: activity } = await supabase
    .from("checkins")
    .select("id, checkin_time, checkout_time, status, location:locations(name)")
    .eq("cleaner_id", id)
    .order("checkin_time", { ascending: false })
    .limit(5);

  return (
    <div className="flex flex-col gap-6">
      <Link className="text-sm text-accent hover:text-white transition-colors" href="/admin/cleaners">
        &lt;- Back to cleaners
      </Link>

      <div className="flex items-center gap-4">
        <Avatar
          src={cleaner.avatar_url}
          initials={cleaner.full_name
            .split(" ")
            .filter(Boolean)
            .map((n: string) => n[0])
            .slice(0, 2)
            .join("")
            .toUpperCase()}
          size="lg"
        />
        <div>
          <h1 className="text-2xl font-bold text-white">{cleaner.full_name}</h1>
          <p className="text-sm text-secondary-muted">Cleaner profile overview.</p>
        </div>
      </div>

      <Card>
        <div className="grid gap-2 text-sm text-secondary-muted">
          <p>
            <span className="font-semibold text-white">Email:</span>{" "}
            <span className="text-white">{cleaner.email}</span>
          </p>
          <p>
            <span className="font-semibold text-white">Phone:</span>{" "}
            <span className="text-white">{cleaner.phone || "--"}</span>
          </p>
          <p>
            <span className="font-semibold text-white">Status:</span>{" "}
            <Badge variant={cleaner.is_active ? "success" : "danger"}>
              {cleaner.is_active ? "Active" : "Inactive"}
            </Badge>
          </p>
        </div>
      </Card>

      <div className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold text-white">Recent Activity</h2>
        {activity && activity.length > 0 ? (
          <Card>
            <div className="flex flex-col gap-3">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {activity.map((item: any) => (
                <div key={item.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {(Array.isArray(item.location) ? item.location[0]?.name : item.location?.name) || "Unknown location"}
                    </p>
                    <p className="text-xs text-secondary-muted">
                      {new Date(item.checkin_time).toLocaleString()}
                    </p>
                  </div>
                  <Badge variant={item.status === "checked_in" ? "success" : "neutral"}>
                    {item.status === "checked_in" ? "Checked In" : "Checked Out"}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        ) : (
          <Card>
            <p className="text-sm text-secondary-muted">No activity yet.</p>
          </Card>
        )}
      </div>
    </div>
  );
}
