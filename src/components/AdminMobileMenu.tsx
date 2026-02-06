"use client";

import Link from "next/link";
import Image from "next/image";
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
      <button
        type="button"
        className="flex h-10 w-10 items-center justify-center rounded-lg text-white hover:bg-white/10 active:scale-95 transition-all md:hidden -ml-2"
        aria-label="Open menu"
        onClick={() => setIsOpen(true)}
      >
        <Menu className="h-6 w-6" strokeWidth={2.5} />
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-[100] md:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          <div className="relative h-full w-72 bg-[#0F0F0F] p-5 shadow-2xl border-r border-primary-border flex flex-col justify-between animate-in slide-in-from-left duration-300">
            <div>
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="relative h-8 w-8 overflow-hidden rounded-lg border border-primary-border bg-primary-light">
                    <Image
                      src="/Elivate Network Logo.svg"
                      alt="Logo"
                      fill
                      className="object-contain p-1"
                    />
                  </div>
                  <p className="text-sm font-bold text-white">Menu</p>
                </div>
                <Button
                  variant="ghost"
                  className="h-10 w-10 px-0 text-secondary-dim hover:text-white hover:bg-primary-light"
                  aria-label="Close menu"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <nav className="flex flex-col gap-1.5">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "flex min-h-[48px] items-center gap-3 rounded-xl px-4 text-base transition-all duration-200",
                        isActive 
                          ? "bg-accent/10 font-semibold text-accent shadow-sm ring-1 ring-accent/20" 
                          : "text-secondary-muted hover:bg-primary-light hover:text-white"
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
              className="mt-auto flex min-h-[52px] items-center gap-3 rounded-xl px-4 text-base font-medium text-danger hover:bg-danger/10 transition-all duration-200 disabled:opacity-50 border border-transparent hover:border-danger/20"
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
