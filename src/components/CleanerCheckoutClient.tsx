"use client";

import type { FormEvent } from "react";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { X, Upload, Camera } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { getCurrentPosition } from "@/lib/geolocation";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

interface ChecklistItem {
  id: string;
  label: string;
}

interface CleanerCheckoutClientProps {
  checkinId: string;
  locationName: string;
  checkinTime: string;
  defaultItems: ChecklistItem[];
  locationItems: ChecklistItem[];
}

const MAX_PHOTOS = 5;
const MAX_PHOTO_SIZE = 5 * 1024 * 1024;

export function CleanerCheckoutClient({
  checkinId,
  locationName,
  checkinTime,
  defaultItems,
  locationItems,
}: CleanerCheckoutClientProps) {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [remarks, setRemarks] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const allItems = useMemo(
    () => [...defaultItems, ...locationItems],
    [defaultItems, locationItems]
  );

  const allComplete = allItems.length
    ? allItems.every((item) => checkedItems[item.id])
    : true;

  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  const handleToggleItem = (id: string, value: boolean) => {
    setCheckedItems((prev) => ({ ...prev, [id]: value }));
  };

  const handleAddPhotos = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;

    const remaining = MAX_PHOTOS - selectedFiles.length;
    const nextFiles = files.slice(0, remaining);

    const validFiles: File[] = [];
    nextFiles.forEach((file) => {
      if (file.size > MAX_PHOTO_SIZE) {
        showToast({
          type: "error",
          message: `${file.name} exceeds 5MB.`,
        });
        return;
      }
      validFiles.push(file);
    });

    const newPreviews = validFiles.map((file) => URL.createObjectURL(file));
    setSelectedFiles((prev) => [...prev, ...validFiles]);
    setPreviewUrls((prev) => [...prev, ...newPreviews]);
    event.target.value = "";
  };

  const handleRemovePhoto = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, idx) => idx !== index));
    setPreviewUrls((prev) => {
      const next = [...prev];
      const [removed] = next.splice(index, 1);
      if (removed) URL.revokeObjectURL(removed);
      return next;
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    if (!allComplete) {
      showToast({
        type: "error",
        message: "Complete all required tasks before checking out.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const position = await getCurrentPosition();
      const { latitude, longitude } = position.coords;

      const supabase = createBrowserSupabaseClient();
      const photoUrls: string[] = [];

      for (const file of selectedFiles) {
        const ext = file.name.split(".").pop() || "jpg";
        const fileName = `${crypto.randomUUID()}.${ext}`;
        const path = `${checkinId}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("checkout-photos")
          .upload(path, file, {
            upsert: false,
            contentType: file.type,
          });

        if (uploadError) {
          showToast({
            type: "error",
            message: "Unable to upload photos. Please try again.",
          });
          return;
        }

        photoUrls.push(path);
      }

      const tasksPayload = allItems.map((item) => ({
        item_id: item.id,
        completed: Boolean(checkedItems[item.id]),
      }));

      const response = await fetch("/api/cleaner/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          checkin_id: checkinId,
          lat: latitude,
          lng: longitude,
          tasks: tasksPayload,
          remarks: remarks.trim(),
          photo_urls: photoUrls,
        }),
      });

      const data = await response.json().catch(() => null);
      if (!response.ok) {
        showToast({
          type: "error",
          message: data?.error || "Unable to check out.",
        });
        return;
      }

      showToast({ type: "success", message: "Checkout complete." });
      window.location.assign("/cleaner");
    } catch (error) {
      console.error("Checkout error:", error);
      showToast({
        type: "error",
        message: "Something went wrong. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="flex flex-col gap-8" onSubmit={handleSubmit}>
      <div>
        <h1 className="text-2xl font-bold text-white">Check Out</h1>
        <p className="text-sm text-secondary-muted">
          Complete your checklist and submit checkout.
        </p>
      </div>

      <Card>
        <p className="text-base font-semibold text-white">{locationName}</p>
        <p className="text-sm text-secondary-muted">
          Checked in at {new Date(checkinTime).toLocaleString()}
        </p>
      </Card>

      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold text-white">Task Checklist</h2>
        <Card className="flex flex-col gap-4">
          {defaultItems.length > 0 ? (
            <div className="flex flex-col gap-2">
              <p className="text-xs font-semibold uppercase text-secondary-dim">
                Default Tasks
              </p>
              <div className="flex flex-col gap-2">
                {defaultItems.map((item) => (
                  <Checkbox
                    key={item.id}
                    label={item.label}
                    checked={Boolean(checkedItems[item.id])}
                    onChange={(event) => handleToggleItem(item.id, event.target.checked)}
                    disabled={isSubmitting}
                  />
                ))}
              </div>
            </div>
          ) : null}

          {locationItems.length > 0 ? (
            <div className="flex flex-col gap-2">
              <p className="text-xs font-semibold uppercase text-secondary-dim">
                Location Tasks
              </p>
              <div className="flex flex-col gap-2">
                {locationItems.map((item) => (
                  <Checkbox
                    key={item.id}
                    label={item.label}
                    checked={Boolean(checkedItems[item.id])}
                    onChange={(event) => handleToggleItem(item.id, event.target.checked)}
                    disabled={isSubmitting}
                  />
                ))}
              </div>
            </div>
          ) : null}
        </Card>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold text-white">
          Add Photos <span className="text-sm font-normal text-secondary-muted">(optional)</span>
        </h2>
        <div className="grid grid-cols-3 gap-3 md:grid-cols-4 lg:grid-cols-5">
          {previewUrls.map((url, index) => (
            <div key={url} className="relative h-20 w-20">
              <Image
                src={url}
                alt="Uploaded photo"
                fill
                className="rounded-lg object-cover border border-primary-border"
                unoptimized
              />
              <Button
                type="button"
                variant="danger"
                size="small"
                className="absolute -right-2 -top-2 h-6 w-6 px-0 rounded-full"
                onClick={() => handleRemovePhoto(index)}
                disabled={isSubmitting}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
          {selectedFiles.length < MAX_PHOTOS ? (
            <button
              type="button"
              className="h-20 w-20 flex items-center justify-center rounded-lg border-2 border-dashed border-primary-border bg-primary-lighter text-secondary-dim hover:text-white hover:border-secondary-dim transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => fileInputRef.current?.click()}
              disabled={isSubmitting}
            >
              <Camera className="h-6 w-6" />
            </button>
          ) : null}
        </div>
        <p className="text-xs text-secondary-dim">
          {selectedFiles.length}/{MAX_PHOTOS} photos
        </p>
        <Input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleAddPhotos}
          disabled={isSubmitting}
        />
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold text-white">
          Remarks <span className="text-sm font-normal text-secondary-muted">(optional)</span>
        </h2>
        <textarea
          className={cn(
            "min-h-[80px] w-full rounded-lg border border-primary-border bg-surface-raised p-3 text-base text-white placeholder:text-secondary-dim focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30 disabled:cursor-not-allowed disabled:opacity-40 transition-colors duration-150"
          )}
          maxLength={500}
          value={remarks}
          onChange={(event) => setRemarks(event.target.value)}
          disabled={isSubmitting}
          placeholder="Any issues or notes..."
        />
        <div className="text-right text-xs text-secondary-dim">
          {remarks.length}/500
        </div>
      </div>

      <Button
        type="submit"
        size="large"
        className="w-full h-14 text-lg"
        isLoading={isSubmitting}
        disabled={!allComplete}
      >
        Complete Checkout
      </Button>
    </form>
  );
}
