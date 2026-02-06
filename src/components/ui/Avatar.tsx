"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";
import { useState } from "react";

interface AvatarProps {
  src?: string | null;
  initials?: string;
  alt?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeClasses = {
  sm: "h-8 w-8 min-w-[32px] min-h-[32px] text-xs",
  md: "h-10 w-10 min-w-[40px] min-h-[40px] text-sm",
  lg: "h-16 w-16 min-w-[64px] min-h-[64px] text-xl",
  xl: "h-24 w-24 min-w-[96px] min-h-[96px] text-3xl",
};

export function Avatar({
  src,
  initials,
  alt = "",
  size = "md",
  className,
}: AvatarProps) {
  const [error, setError] = useState(false);

  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center rounded-full border-2 border-primary-border bg-primary-lighter font-semibold text-white overflow-hidden",
        sizeClasses[size],
        className
      )}
    >
      {src && !error ? (
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          onError={() => setError(true)}
          unoptimized
        />
      ) : (
        <span className="select-none">{initials?.slice(0, 2).toUpperCase() || "??"}</span>
      )}
    </div>
  );
}
