import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { createServerClient } from "@/lib/supabase/server";

interface CleanerHistoryDetailProps {
  params: Promise<{ id: string }>;
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export default async function CleanerHistoryDetailPage({
  params,
}: CleanerHistoryDetailProps) {
  const { id } = await params;
  const supabase = await createServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  const { data: activity, error } = await supabase
    .from("checkins")
    .select(
      "id, status, checkin_time, checkout_time, remarks, location:locations(name, address)"
    )
    .eq("id", id)
    .eq("cleaner_id", user.id)
    .single();

  if (error || !activity) {
    return (
      <Card variant="danger">
        <p className="text-sm text-neutral-600">
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

  const completedTasks = tasks?.filter((task) => task.is_completed).length ?? 0;
  const totalTasks = tasks?.length ?? 0;

  const location = Array.isArray(activity.location) ? activity.location[0] : activity.location;

  return (
    <div className="flex flex-col gap-6">
      <Link className="text-sm text-accent hover:text-white transition-colors" href="/cleaner/history">
        &lt;- Back to history
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-white">Activity Detail</h1>
        <p className="text-sm text-secondary-dim">
          {location?.name || "Unknown location"}
        </p>
      </div>

      <Card>
        <div className="flex flex-col gap-2 text-sm text-secondary-muted">
          <p>
            <span className="font-semibold text-white">Location:</span>{" "}
            <span className="text-white">{location?.address || "--"}</span>
          </p>
          <p>
            <span className="font-semibold text-white">Status:</span>{" "}
            <Badge variant={activity.status === "checked_in" ? "success" : "neutral"}>
              {activity.status === "checked_in" ? "Checked In" : "Checked Out"}
            </Badge>
          </p>
          <p>
            <span className="font-semibold text-white">Check-in:</span>{" "}
            <span className="text-white">{formatDateTime(activity.checkin_time)}</span>
          </p>
          <p>
            <span className="font-semibold text-white">Check-out:</span>{" "}
            <span className="text-white">{activity.checkout_time ? formatDateTime(activity.checkout_time) : "--"}</span>
          </p>
          <p>
            <span className="font-semibold text-white">Remarks:</span>{" "}
            <span className="text-white">{activity.remarks || "--"}</span>
          </p>
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-white">
            Checklist Results
          </h2>
          <Badge variant={completedTasks === totalTasks ? "success" : "neutral"}>
            {completedTasks}/{totalTasks} completed
          </Badge>
        </div>
        <div className="mt-4 flex flex-col gap-3">
          {totalTasks === 0 ? (
            <p className="text-sm text-secondary-dim">No checklist results.</p>
          ) : (
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            tasks?.map((task: any) => (
              <div
                key={task.id}
                className="flex items-center justify-between text-sm text-secondary-muted border-b border-primary-border last:border-0 pb-2 last:pb-0"
              >
                <span className="text-white">{(Array.isArray(task.checklist_item) ? task.checklist_item[0]?.label : task.checklist_item?.label) || "Task"}</span>
                <Badge variant={task.is_completed ? "success" : "warning"}>
                  {task.is_completed ? "Done" : "Missed"}
                </Badge>
              </div>
            ))
          )}
        </div>
      </Card>

      <Card>
        <h2 className="text-base font-semibold text-white">Photos</h2>
        <div className="mt-4">
          {signedPhotos.length === 0 ? (
            <p className="text-sm text-secondary-dim">No photos uploaded.</p>
          ) : (
            <div className="grid grid-cols-3 gap-3 md:grid-cols-4 lg:grid-cols-5">
              {signedPhotos.map((photo) => (
                <div key={photo.id} className="relative aspect-square">
                  <Image
                    src={photo.url}
                    alt="Checkout photo"
                    fill
                    className="rounded-lg object-cover border border-primary-border"
                    unoptimized
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
