"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { Checkbox } from "@/components/ui/Checkbox";

interface AdminSettingsClientProps {
  settings: {
    company_name: string;
    primary_color: string;
    secondary_color: string;
    default_geofence_radius: number;
    notify_on_checkin: boolean;
    notify_on_checkout: boolean;
  };
}

export function AdminSettingsClient({ settings }: AdminSettingsClientProps) {
  const { showToast } = useToast();
  const [notifyOnCheckin, setNotifyOnCheckin] = useState(
    settings.notify_on_checkin
  );
  const [notifyOnCheckout, setNotifyOnCheckout] = useState(
    settings.notify_on_checkout
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleToggle = async (key: "checkin" | "checkout", checked: boolean) => {
    if (isSubmitting) return;

    const nextCheckin = key === "checkin" ? checked : notifyOnCheckin;
    const nextCheckout =
      key === "checkout" ? checked : notifyOnCheckout;

    // Optimistic update
    if (key === "checkin") setNotifyOnCheckin(checked);
    else setNotifyOnCheckout(checked);

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notify_on_checkin: nextCheckin,
          notify_on_checkout: nextCheckout,
        }),
      });

      const data = await response.json().catch(() => null);
      if (!response.ok) {
        // Revert on error
        if (key === "checkin") setNotifyOnCheckin(!checked);
        else setNotifyOnCheckout(!checked);

        showToast({
          type: "error",
          message: data?.error || "Unable to update settings.",
        });
        return;
      }

      showToast({ type: "success", message: "Settings updated." });
    } catch (error) {
      console.error("Settings update error:", error);
      // Revert on error
      if (key === "checkin") setNotifyOnCheckin(!checked);
      else setNotifyOnCheckout(!checked);

      showToast({
        type: "error",
        message: "Something went wrong. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-sm text-secondary-muted">
          Company branding and notification preferences.
        </p>
      </div>

      <Card>
        <h2 className="text-lg font-semibold text-white mb-4">Branding</h2>
        <div className="grid gap-4">
          <Input label="Company Name" value={settings.company_name} disabled />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Primary Color" value={settings.primary_color} disabled />
            <Input label="Secondary Color" value={settings.secondary_color} disabled />
          </div>
          <Input
            label="Default Geofence Radius (m)"
            value={String(settings.default_geofence_radius)}
            disabled
          />
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-white mb-4">Notifications</h2>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-white">Email on Check-in</span>
              <span className="text-xs text-secondary-muted">Receive an email when a cleaner checks in.</span>
            </div>
            <Checkbox
              checked={notifyOnCheckin}
              onChange={(e) => handleToggle("checkin", e.target.checked)}
              disabled={isSubmitting}
            />
          </div>
          <div className="border-t border-primary-border" />
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-white">Email on Check-out</span>
              <span className="text-xs text-secondary-muted">Receive an email when a cleaner checks out.</span>
            </div>
            <Checkbox
              checked={notifyOnCheckout}
              onChange={(e) => handleToggle("checkout", e.target.checked)}
              disabled={isSubmitting}
            />
          </div>
        </div>
      </Card>
    </div>
  );
}
