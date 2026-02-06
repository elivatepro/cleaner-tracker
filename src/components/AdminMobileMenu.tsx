"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  CheckSquare,
  Clock,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  Navigation,
  Settings,
  Users,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";

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
  const { showToast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (response.ok) {
        window.location.assign("/login");
      } else {
        showToast({ type: "error", message: "Failed to log out." });
        setIsLoggingOut(false);
      }
    } catch (error) {
      console.error("Logout error:", error);
      showToast({ type: "error", message: "Something went wrong." });
      setIsLoggingOut(false);
    }
  };

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
          <div className="relative h-full w-64 bg-primary p-4 shadow-lg border-r border-primary-border flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-white">Menu</p>
                <Button
                  variant="ghost"
                  className="h-10 w-10 px-0 text-secondary-dim hover:text-white"
                  aria-label="Close menu"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-5 w-5" />
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
                        "flex min-h-[44px] items-center gap-3 rounded-lg px-3 text-base text-secondary-muted hover:bg-primary-light hover:text-white transition-colors",
                        isActive && "bg-primary-lighter font-semibold text-white"
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-5 w-5",
                          isActive ? "text-accent" : "text-secondary-dim"
                        )}
                      />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="mt-auto flex min-h-[44px] items-center gap-3 rounded-lg px-3 text-base text-secondary-dim hover:bg-danger-soft hover:text-danger transition-colors duration-150 disabled:opacity-50"
            >
              <LogOut className="h-5 w-5" />
              <span>{isLoggingOut ? "Logging out..." : "Log Out"}</span>
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
