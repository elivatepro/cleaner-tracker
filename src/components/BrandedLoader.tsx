"use client";

import Image from "next/image";
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface LoaderBrand {
  companyName: string;
  logoUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
}

const MIN_DURATION_MS = 800;
const MAX_DURATION_MS = 10000;
const EXIT_DURATION_MS = 300;

export function BrandedLoader() {
  const [brand, setBrand] = useState<LoaderBrand>({
    companyName: "Elivate",
    logoUrl: "/Elivate Network Logo.svg",
    primaryColor: "#0F0F0F",
    secondaryColor: "#FFFFFF",
  });
  const [hasHydrated, setHasHydrated] = useState(false);
  const [hasMetMinimum, setHasMetMinimum] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [hasTimedOut, setHasTimedOut] = useState(false);

  useEffect(() => {
    let isMounted = true;

    fetch("/api/settings/public", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) return null;
        return (await response.json())?.data as
          | {
              company_name?: string | null;
              logo_url?: string | null;
              primary_color?: string | null;
              secondary_color?: string | null;
            }
          | null;
      })
      .then((data) => {
        if (!isMounted || !data) return;

        setBrand((current) => ({
          companyName: data.company_name?.trim() || current.companyName,
          logoUrl: data.logo_url || null,
          primaryColor: data.primary_color?.trim() || current.primaryColor,
          secondaryColor: data.secondary_color?.trim() || current.secondaryColor,
        }));
      })
      .catch(() => undefined);

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const minTimer = window.setTimeout(() => setHasMetMinimum(true), MIN_DURATION_MS);
    const timeoutTimer = window.setTimeout(() => setHasTimedOut(true), MAX_DURATION_MS);

    const markReady = () => setHasHydrated(true);

    if (document.readyState === "complete") {
      markReady();
    } else {
      window.addEventListener("load", markReady, { once: true });
    }

    return () => {
      clearTimeout(minTimer);
      clearTimeout(timeoutTimer);
      window.removeEventListener("load", markReady);
    };
  }, []);

  useEffect(() => {
    if (!hasHydrated || !hasMetMinimum || isExiting) return;

    setIsExiting(true);
    const exitTimer = window.setTimeout(() => setIsHidden(true), EXIT_DURATION_MS);

    return () => {
      clearTimeout(exitTimer);
    };
  }, [hasHydrated, hasMetMinimum, isExiting]);

  const initials = useMemo(
    () => brand.companyName.slice(0, 2).toUpperCase(),
    [brand.companyName]
  );

  if (isHidden) return null;

  const containerStyle = {
    "--loader-primary": brand.primaryColor,
    "--loader-secondary": brand.secondaryColor,
  } as CSSProperties;

  return (
    <div
      className={cn(
        "fixed inset-0 z-loader flex items-center justify-center bg-[color:var(--loader-primary)] px-8 transition-opacity duration-300",
        isExiting && "opacity-0 pointer-events-none"
      )}
      style={containerStyle}
      role="status"
      aria-live="polite"
    >
      <div className="flex w-full max-w-md flex-col items-center gap-6 text-center text-[color:var(--loader-secondary)]">
        <div className="relative flex h-[160px] w-[160px] items-center justify-center">
          <div
            className="absolute h-[160px] w-[160px] rounded-full blur-3xl"
            style={{
              backgroundColor: "var(--loader-secondary)",
              opacity: 0.05,
            }}
            aria-hidden
          />
          <div
            className="absolute h-[120px] w-[120px] rounded-full border border-white/10"
            aria-hidden
          />
          <div
            className="absolute h-[120px] w-[120px] rounded-full border-[3px] border-white/15 border-t-[3px] border-t-[color:var(--loader-secondary)] animate-[spin_1s_linear_infinite]"
            aria-hidden
          />
          <div className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-white/10 shadow-md ring-1 ring-white/15 backdrop-blur">
            {brand.logoUrl ? (
              <Image
                src={brand.logoUrl}
                alt={`${brand.companyName} logo`}
                fill
                sizes="64px"
                className="object-contain"
                unoptimized
                priority
              />
            ) : (
              <span className="text-lg font-semibold">
                {initials}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col items-center gap-2">
          <p className="text-sm font-medium tracking-wide opacity-80">
            Preparing your workspace
          </p>
          <p className="text-xs opacity-60">
            {brand.companyName}
          </p>
        </div>

        {hasTimedOut && (
          <div className="flex flex-col items-center gap-3">
            <p className="text-xs opacity-70">
              This is taking longer than expected.
            </p>
            <Button
              variant="secondary"
              size="small"
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
