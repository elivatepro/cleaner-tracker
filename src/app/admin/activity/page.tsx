import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";
import { createServerClient } from "@/lib/supabase/server";
import { AlertTriangle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActivityRow {
  id: string;
  status: "checked_in" | "checked_out";
  checkin_time: string;
  checkout_time: string | null;
  checkin_within_geofence: boolean | null;
  checkout_within_geofence: boolean | null;
  cleaner: { full_name: string } | null;
  location: { name: string } | null;
}

function formatTime(timestamp: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(timestamp));
}

export default async function AdminActivityPage() {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("checkins")
    .select(
      "id, status, checkin_time, checkout_time, checkin_within_geofence, checkout_within_geofence, cleaner:profiles(full_name), location:locations(name)"
    )
    .order("checkin_time", { ascending: false })
    .limit(25);

  if (error) {
    return (
      <Card variant="danger">
        <p className="text-sm text-danger">
          We could not load activity. Please refresh.
        </p>
      </Card>
    );
  }

  const activity = (data ?? []) as unknown as ActivityRow[];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Activity</h1>
          <p className="text-sm text-secondary-muted">
            View check-in and check-out history.
          </p>
        </div>
        <Button variant="secondary" disabled>
          Export CSV
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Input label="Cleaner" placeholder="All cleaners" />
        <Input label="Location" placeholder="All locations" />
        <Input label="From" placeholder="Start date" />
        <Input label="To" placeholder="End date" />
      </div>

      {activity.length === 0 ? (
        <EmptyState
          icon={Clock}
          title="No activity yet"
          description="Check-ins and check-outs will appear here."
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cleaner</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activity.map((item) => {
              const geofenceWarning =
                item.checkin_within_geofence === false ||
                item.checkout_within_geofence === false;
              return (
                <TableRow
                  key={item.id}
                  className={cn(geofenceWarning && "bg-warning-soft hover:bg-warning-soft/80")}
                >
                  <TableCell className="font-medium text-white flex items-center gap-2">
                    {item.cleaner?.full_name || "Unknown"}
                    {geofenceWarning && <AlertTriangle className="h-4 w-4 text-warning" />}
                  </TableCell>
                  <TableCell className="text-secondary-muted">
                    {item.location?.name || "Unknown"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={item.status === "checked_in" ? "success" : "neutral"}>
                      {item.status === "checked_in" ? "Checked In" : "Checked Out"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-secondary-muted">
                    {formatTime(item.checkin_time)}
                  </TableCell>
                  <TableCell>
                    <Link
                      className="text-sm text-accent hover:text-white transition-colors"
                      href={`/admin/activity/${item.id}`}
                    >
                      View
                    </Link>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
