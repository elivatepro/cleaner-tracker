import Link from "next/link";
import { Card } from "@/components/ui/Card";

export default function CleanerCheckinPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Check In</h1>
        <p className="text-sm text-secondary-dim">
          Use the home screen to check in to your assignment.
        </p>
      </div>

      <Card>
        <p className="text-sm text-secondary-muted">
          The check-in flow will live on the home screen for quick access.
        </p>
      </Card>

      <Link className="text-sm text-accent hover:text-white transition-colors" href="/cleaner">
        Back to Home
      </Link>
    </div>
  );
}
