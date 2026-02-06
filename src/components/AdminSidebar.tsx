"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CheckSquare,
  Clock,
  LayoutDashboard,
  MapPin,
  Navigation,
  Settings,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Cleaners", href: "/admin/cleaners", icon: Users },
  { label: "Locations", href: "/admin/locations", icon: Navigation },
  { label: "Assignments", href: "/admin/assignments", icon: MapPin },
  { label: "Checklist", href: "/admin/checklist", icon: CheckSquare },
  { label: "Activity", href: "/admin/activity", icon: Clock },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-16 z-sticky hidden h-[calc(100vh-64px)] border-r border-primary-border bg-primary md:block md:w-16 lg:w-60">
      <nav className="flex h-full flex-col gap-1 py-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex min-h-[44px] items-center gap-3 border-l-[3px] px-3 text-base font-normal transition-colors duration-150",
                isActive
                  ? "border-accent bg-primary-light text-accent"
                  : "border-transparent text-secondary-muted hover:bg-primary-light hover:text-white"
              )}
            >
              <item.icon
                className={cn(
                  "h-5 w-5 transition-colors",
                  isActive ? "text-accent" : "text-secondary-dim group-hover:text-secondary-muted"
                )}
                aria-hidden="true"
              />
              <span className="hidden lg:inline">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
