"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  CheckSquare,
  Clock,
  LayoutDashboard,
  MapPin,
  Menu,
  Navigation,
  Settings,
  Users,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
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

export function AdminMobileMenu() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        className="h-10 w-10 px-0 text-secondary md:hidden"
        aria-label="Open menu"
        onClick={() => setIsOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {isOpen ? (
        <div className="fixed inset-0 z-modal md:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsOpen(false)}
          />
          <div className="relative h-full w-64 bg-secondary p-4 shadow-lg">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-neutral-900">Menu</p>
              <Button
                variant="ghost"
                className="h-10 w-10 px-0"
                aria-label="Close menu"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-5 w-5 text-neutral-600" />
              </Button>
            </div>

            <nav className="mt-4 flex flex-col gap-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex min-h-[44px] items-center gap-3 rounded-lg px-3 text-base text-neutral-600 hover:bg-neutral-50",
                      isActive && "bg-neutral-100 font-semibold text-primary"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-5 w-5",
                        isActive ? "text-primary" : "text-neutral-400"
                      )}
                    />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      ) : null}
    </>
  );
}
