"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Clock, LayoutDashboard, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Home", href: "/cleaner", icon: LayoutDashboard },
  { label: "History", href: "/cleaner/history", icon: Clock },
  { label: "Profile", href: "/cleaner/profile", icon: User },
];

export function CleanerBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[50] border-t border-primary-border bg-[#0F0F0F] pb-[env(safe-area-inset-bottom)] md:block lg:hidden isolate">
      <div className="mx-auto flex h-16 max-w-md items-center justify-around px-4 relative z-10">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex min-h-[48px] w-full flex-col items-center justify-center gap-1 text-xs transition-colors duration-150",
                isActive ? "text-accent" : "text-secondary-dim hover:text-white"
              )}
            >
              {isActive && (
                <span className="absolute -top-3 left-1/2 h-1 w-8 -translate-x-1/2 rounded-b-full bg-accent" />
              )}
              <item.icon
                className={cn(
                  "h-6 w-6 transition-colors",
                  isActive ? "text-accent" : "text-secondary-dim group-hover:text-white"
                )}
                aria-hidden="true"
              />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
