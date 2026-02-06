import Link from "next/link";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { createServerClient } from "@/lib/supabase/server";

interface ActivityRow {
  id: string;
  status: "checked_in" | "checked_out";
  checkin_time: string;
  checkout_time: string | null;
  cleaner: {
    full_name: string;
    avatar_url: string | null;
  } | null;
  location: {
    name: string;
  } | null;
}

interface ActiveRow {
  id: string;
  checkin_time: string;
  cleaner: {
    full_name: string;
    avatar_url?: string | null;
  } | null;
  location: {
    name: string;
  } | null;
}

function getInitials(name?: string | null) {
  if (!name) return "NA";
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase())
    .slice(0, 2)
    .join("");
}

function formatTime(timestamp?: string | null) {
  if (!timestamp) return "--";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(timestamp));
}

export default async function AdminDashboardPage() {
  const supabase = await createServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 7);

  const [
    cleanersResult,
    locationsResult,
    activeResult,
    weekResult,
    activityResult,
    activeListResult,
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "cleaner"),
    supabase.from("locations").select("id", { count: "exact", head: true }),
    supabase
      .from("checkins")
      .select("id", { count: "exact", head: true })
      .eq("status", "checked_in"),
    supabase
      .from("checkins")
      .select("id", { count: "exact", head: true })
      .gte("checkin_time", weekStart.toISOString()),
    supabase
      .from("checkins")
      .select(
        "id, status, checkin_time, checkout_time, cleaner:profiles(full_name, avatar_url), location:locations(name)"
      )
      .order("checkin_time", { ascending: false })
      .limit(10),
    supabase
      .from("checkins")
      .select(
        "id, checkin_time, cleaner:profiles(full_name, avatar_url), location:locations(name)"
      )
      .eq("status", "checked_in")
      .order("checkin_time", { ascending: false })
      .limit(5),
  ]);

  const hasError =
    cleanersResult.error ||
    locationsResult.error ||
    activeResult.error ||
    weekResult.error ||
    activityResult.error ||
    activeListResult.error;

  const stats = [
    {
      label: "Cleaners",
      value: cleanersResult.count ?? 0,
    },
    {
      label: "Locations",
      value: locationsResult.count ?? 0,
    },
    {
      label: "Active Now",
      value: activeResult.count ?? 0,
      live: true,
    },
    {
      label: "This Week",
      value: weekResult.count ?? 0,
    },
  ];

  const activity = (activityResult.data ?? []) as unknown as ActivityRow[];
  const activeList = (activeListResult.data ?? []) as unknown as ActiveRow[];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-sm text-secondary-muted">
            Overview of cleaners and activity.
          </p>
        </div>
      </div>

      {hasError ? (
        <Card variant="danger">
          <p className="text-sm text-danger">
            We could not load dashboard data. Please refresh.
          </p>
        </Card>
      ) : null}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} variant={stat.live ? "active" : "default"}>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold text-white">
                {stat.value}
              </p>
              {stat.live ? (
                <span className="flex h-2 w-2 rounded-full bg-accent animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
              ) : null}
            </div>
            <p className="text-sm text-secondary-muted">{stat.label}</p>
          </Card>
        ))}
      </div>

      {activeList.length > 0 ? (
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold text-white">
            Currently Active
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {activeList.map((item) => (
              <Card key={item.id} className="min-w-[240px] flex flex-col gap-3" variant="active">
                <div className="flex items-center gap-3">
                  <Avatar
                    src={item.cleaner?.avatar_url}
                    initials={getInitials(item.cleaner?.full_name)}
                    size="md"
                  />
                  <div>
                    <p className="text-sm font-semibold text-white truncate max-w-[140px]">
                      {item.cleaner?.full_name || "Unknown"}
                    </p>
                    <p className="text-xs text-secondary-muted truncate max-w-[140px]">
                      {item.location?.name || "Unknown location"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between border-t border-primary-border pt-3 mt-1">
                  <span className="text-xs text-secondary-dim">Check-in</span>
                  <span className="text-xs font-medium text-white">{formatTime(item.checkin_time)}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ) : null}

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Recent Activity</h2>
          <Link className="text-sm text-accent hover:text-white transition-colors" href="/admin/activity">
            View All
          </Link>
        </div>
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cleaner</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activity.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-secondary-muted py-8">
                  No activity yet.
                </TableCell>
              </TableRow>
            ) : (
              activity.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar
                        src={item.cleaner?.avatar_url}
                        initials={getInitials(item.cleaner?.full_name)}
                        size="sm"
                      />
                      <span className="font-medium text-white">
                        {item.cleaner?.full_name || "Unknown"}
                      </span>
                    </div>
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
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
