import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import { createServerClient } from "@/lib/supabase/server";
import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react";

interface ActivityDetailProps {
  params: Promise<{ id: string }>;
}

export default async function AdminActivityDetailPage({
  params,
}: ActivityDetailProps) {
  const { id } = await params;
  const supabase = await createServerClient();
  const { data: activity, error } = await supabase
    .from("checkins")
    .select(
      "id, status, checkin_time, checkout_time, remarks, checkin_within_geofence, checkout_within_geofence, cleaner:profiles(full_name, avatar_url), location:locations(name, address)"
    )
    .eq("id", id)
    .single();

  if (error || !activity) {
    return (
      <Card variant="danger">
        <p className="text-sm text-danger">
          Activity not found. Please go back and try again.
        </p>
      </Card>
    );
  }

  const { data: tasks } = await supabase
    .from("checkout_tasks")
    .select("id, is_completed, checklist_item:checklist_items(label)")
    .eq("checkin_id", id);

  const { data: photos } = await supabase
    .from("checkout_photos")
    .select("id, photo_url")
    .eq("checkin_id", id)
    .order("created_at", { ascending: true });

  let signedPhotos: Array<{ id: string; url: string }> = [];
  if (photos?.length) {
    const { data: signed, error: signedError } = await supabase.storage
      .from("checkout-photos")
      .createSignedUrls(
        photos.map((photo) => photo.photo_url),
        60 * 60
      );

    if (!signedError && signed) {
      signedPhotos = signed.map((item, index) => ({
        id: photos[index].id,
        url: item.signedUrl,
      }));
    }
  }

  // Type assertions for cleaner data access
  const activityData = activity as unknown as {
    id: string;
    status: "checked_in" | "checked_out";
    checkin_time: string;
    checkout_time: string | null;
    remarks: string | null;
    checkin_within_geofence: boolean | null;
    checkout_within_geofence: boolean | null;
    cleaner: { full_name: string; avatar_url: string | null } | null;
    location: { name: string; address: string } | null;
  };

  const tasksData = (tasks ?? []) as unknown as Array<{
    id: string;
    is_completed: boolean;
    checklist_item: { label: string } | null;
  }>;

  const completedTasks = tasksData.filter((task) => task.is_completed).length ?? 0;
  const totalTasks = tasksData.length ?? 0;

  return (
    <div className="flex flex-col gap-6">
      <Link className="flex items-center gap-2 text-sm text-secondary-dim hover:text-white transition-colors" href="/admin/activity">
        <ArrowLeft className="h-4 w-4" /> Back to activity
      </Link>

      <div className="flex items-center gap-4">
        <Avatar
          src={activityData.cleaner?.avatar_url}
          initials={activityData.cleaner?.full_name
            ?.split(" ")
            .filter(Boolean)
            .map((n) => n[0])
            .slice(0, 2)
            .join("")
            .toUpperCase()}
          size="lg"
        />
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-white">Activity Detail</h1>
          <p className="text-sm text-secondary-muted">
            <span className="font-semibold text-white">{activityData.cleaner?.full_name || "Unknown cleaner"}</span> at{" "}
            <span className="font-semibold text-white">{activityData.location?.name || "Unknown location"}</span>
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="h-full">
          <h2 className="text-lg font-semibold text-white mb-4">Summary</h2>
          <div className="grid gap-4 text-sm">
            <div>
              <p className="text-xs text-secondary-dim uppercase tracking-wider font-semibold">Location</p>
              <p className="mt-1 text-white">{activityData.location?.address || "--"}</p>
            </div>
            <div>
              <p className="text-xs text-secondary-dim uppercase tracking-wider font-semibold">Status</p>
              <div className="mt-1">
                <Badge variant={activityData.status === "checked_in" ? "success" : "neutral"}>
                  {activityData.status === "checked_in" ? "Checked In" : "Checked Out"}
                </Badge>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-secondary-dim uppercase tracking-wider font-semibold">Check-in</p>
                <p className="mt-1 text-white">{new Date(activityData.checkin_time).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-secondary-dim uppercase tracking-wider font-semibold">Check-out</p>
                <p className="mt-1 text-white">
                  {activityData.checkout_time
                    ? new Date(activityData.checkout_time).toLocaleString()
                    : "--"}
                </p>
              </div>
            </div>
            <div>
              <p className="text-xs text-secondary-dim uppercase tracking-wider font-semibold">Geofence</p>
              <p className="mt-1 text-white">
                {activityData.checkin_within_geofence === false ||
                activityData.checkout_within_geofence === false
                  ? "⚠ Outside range"
                  : "Within range"}
              </p>
            </div>
            <div>
              <p className="text-xs text-secondary-dim uppercase tracking-wider font-semibold">Remarks</p>
              <p className="mt-1 text-white whitespace-pre-wrap">{activityData.remarks || "No remarks provided."}</p>
            </div>
          </div>
        </Card>

        <div className="flex flex-col gap-6">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">
                Checklist Results
              </h2>
              <Badge variant={completedTasks === totalTasks ? "success" : "neutral"}>
                {completedTasks}/{totalTasks} completed
              </Badge>
            </div>
            <div className="flex flex-col gap-3">
              {totalTasks === 0 ? (
                <p className="text-sm text-secondary-muted">No checklist results.</p>
              ) : (
                tasksData.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between py-2 border-b border-primary-border last:border-0"
                  >
                    <span className="text-sm text-white">{task.checklist_item?.label || "Task"}</span>
                    {task.is_completed ? (
                      <CheckCircle2 className="h-5 w-5 text-accent" />
                    ) : (
                      <XCircle className="h-5 w-5 text-danger" />
                    )}
                  </div>
                ))
              )}
            </div>
          </Card>

          <Card>
            <h2 className="text-lg font-semibold text-white mb-4">Photos</h2>
            <div>
              {signedPhotos.length === 0 ? (
                <p className="text-sm text-secondary-muted">No photos uploaded.</p>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {signedPhotos.map((photo) => (
                    <div key={photo.id} className="relative aspect-square rounded-lg border border-primary-border overflow-hidden bg-surface-raised">
                      <Image
                        src={photo.url}
                        alt="Checkout photo"
                        fill
                        className="object-cover transition-transform hover:scale-105"
                        unoptimized
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
