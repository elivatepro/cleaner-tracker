import type { ReactNode } from "react";
import Link from "next/link";
import { AdminMobileMenu } from "@/components/AdminMobileMenu";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/AdminSidebar";
import { createServerClient } from "@/lib/supabase/server";
import { Avatar } from "@/components/ui/Avatar";

interface AdminLayoutProps {
  children: ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const supabase = await createServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name, avatar_url")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/login");
  }

  const fullName = profile?.full_name?.trim() || "Admin";
  const initials = fullName
    .split(" ")
    .filter(Boolean)
    .map((part: string) => part[0]?.toUpperCase())
    .slice(0, 2)
    .join("");

  const { data: settings } = await supabase
    .from("app_settings")
    .select("company_name")
    .single();

  const companyName = settings?.company_name || process.env.NEXT_PUBLIC_COMPANY_NAME || "CleanTrack";

  return (
    <div className="min-h-screen bg-primary">
      <header className="sticky top-0 z-header h-16 bg-[#0F0F0F] border-b border-primary-border shadow-md isolate">
        <div className="flex h-full items-center justify-between px-4 md:px-6 lg:px-8 relative z-10">
          <div className="flex items-center gap-3">
            <AdminMobileMenu />
            <Link href="/admin" className="flex items-center gap-3">
              <Avatar src="/Elivate Network Logo.svg" initials={companyName[0]} size="sm" className="rounded-lg border-primary-border" />
              <div className="flex flex-col">
                <span className="text-sm font-bold text-white leading-none">
                  {companyName}
                </span>
                <span className="text-[10px] uppercase tracking-wider text-secondary-dim font-bold mt-0.5">Admin</span>
              </div>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-secondary-muted md:inline">{fullName}</span>
            <Avatar src={profile?.avatar_url} initials={initials} size="sm" />
          </div>
        </div>
      </header>

      <AdminSidebar />

      <div className="pt-16 md:pl-16 lg:pl-60">
        <main className="min-h-[calc(100vh-64px)] bg-surface px-4 py-6 md:px-6 md:py-6 lg:px-12 lg:py-8">
          <div className="mx-auto w-full max-w-[1200px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
