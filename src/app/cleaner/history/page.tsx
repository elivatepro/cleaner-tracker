import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Clock } from "lucide-react";

interface HistoryRow {
  id: string;
  checkin_time: string;
  checkout_time: string | null;
  status: "checked_in" | "checked_out";
  location: {
    name: string;
  } | null;
}

function formatDateLabel(value: string) {
  const date = new Date(value);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const dateKey = date.toDateString();
  if (dateKey === today.toDateString()) return "Today";
  if (dateKey === yesterday.toDateString()) return "Yesterday";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatDuration(start: string, end?: string | null) {
  if (!end) return "In progress";
  const diffMs = new Date(end).getTime() - new Date(start).getTime();
  const totalMinutes = Math.max(0, Math.floor(diffMs / 60000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export default async function CleanerHistoryPage() {
  const supabase = await createServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  const { data, error } = await supabase
    .from("checkins")
    .select("id, checkin_time, checkout_time, status, location:locations(name)")
    .eq("cleaner_id", user.id)
    .order("checkin_time", { ascending: false })
    .limit(50);

  if (error) {
    return (
      <Card variant="danger">
        <p className="text-sm text-danger">
          We could not load your activity history. Please refresh.
        </p>
      </Card>
    );
  }

  const history = (data ?? []) as unknown as HistoryRow[];

  if (history.length === 0) {
    return (
      <EmptyState
        icon={Clock}
        title="No activity yet"
        description="Check in at a location to see your history here."
      />
    );
  }

  const grouped: Array<{ label: string; items: HistoryRow[] }> = [];
  history.forEach((item) => {
    const label = formatDateLabel(item.checkin_time);
    const lastGroup = grouped[grouped.length - 1];
    if (lastGroup && lastGroup.label === label) {
      lastGroup.items.push(item);
    } else {
      grouped.push({ label, items: [item] });
    }
  });

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-white">My Activity</h1>
        <p className="text-sm text-secondary-muted">
          Review your recent check-ins and check-outs.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {grouped.map((group) => (
          <div key={group.label} className="flex flex-col gap-3">
            <p className="text-xs font-semibold uppercase text-secondary-dim tracking-wider">
              {group.label}
            </p>
            {group.items.map((item) => (
              <Link
                key={item.id}
                href={`/cleaner/history/${item.id}`}
                className="block"
              >
                <Card className="hover:border-secondary-dim cursor-pointer transition-colors group">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-base font-semibold text-white group-hover:text-accent transition-colors">
                        {item.location?.name || "Unknown location"}
                      </p>
                      <p className="text-sm text-secondary-muted">
                        {formatTime(item.checkin_time)}{" "}
                        {item.checkout_time
                          ? `→ ${formatTime(item.checkout_time)}`
                          : ""}
                      </p>
                    </div>
                    <Badge
                      variant={item.status === "checked_in" ? "success" : "neutral"}
                    >
                      {item.status === "checked_in" ? "Checked In" : "Checked Out"}
                    </Badge>
                  </div>
                  <div className="mt-3 flex items-center gap-3">
                    <span className="text-xs font-medium text-secondary-dim bg-primary-lighter px-2 py-1 rounded">
                      Duration: {formatDuration(item.checkin_time, item.checkout_time)}
                    </span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        ))}
      </div>

      <div className="flex justify-center">
        <Button variant="ghost" disabled>
          Load more
        </Button>
      </div>
    </div>
  );
}
