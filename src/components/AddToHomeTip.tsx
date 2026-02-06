"use client";

import { useEffect, useState } from "react";

interface AddToHomeTipProps {
  className?: string;
}

export function AddToHomeTip({ className }: AddToHomeTipProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const storageKey = "cleantrack_a2hs_tip";
    const hasShown = window.localStorage.getItem(storageKey);

    if (!hasShown) {
      setTimeout(() => setShow(true), 0);
      window.localStorage.setItem(storageKey, "shown");
    }
  }, []);

  if (!show) return null;

  return (
    <p className={className ?? "text-center text-xs text-secondary-dim"}>
      Tip: Add to your home screen for quick access
    </p>
  );
}
