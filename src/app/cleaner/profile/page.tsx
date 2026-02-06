import { redirect } from "next/navigation";
import { CleanerProfileForm } from "@/components/CleanerProfileForm";
import { Card } from "@/components/ui/Card";
import { createServerClient } from "@/lib/supabase/server";

export default async function CleanerProfilePage() {
  const supabase = await createServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("full_name, email, phone, avatar_url")
    .eq("id", user.id)
    .single();

  if (error || !profile) {
    return (
      <Card variant="danger">
        <p className="text-sm text-neutral-600">
          We could not load your profile. Please refresh.
        </p>
      </Card>
    );
  }

  return (
    <div className="mx-auto w-full max-w-xl">
      <CleanerProfileForm
        fullName={profile.full_name}
        email={profile.email}
        phone={profile.phone}
        avatarUrl={profile.avatar_url}
        userId={user.id}
      />
    </div>
  );
}
