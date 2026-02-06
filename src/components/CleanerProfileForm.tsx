"use client";

import type { FormEvent, ChangeEvent } from "react";
import { useRef, useState, useMemo } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { Avatar } from "@/components/ui/Avatar";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

interface CleanerProfileFormProps {
  fullName: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  userId: string;
}

export function CleanerProfileForm({
  fullName: initialFullName,
  email,
  phone: initialPhone,
  avatarUrl: initialAvatarUrl,
  userId,
}: CleanerProfileFormProps) {
  const { showToast } = useToast();
  const [fullName, setFullName] = useState(initialFullName);
  const [phone, setPhone] = useState(initialPhone ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl ?? "");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);

  const isDirty =
    fullName.trim() !== initialFullName.trim() ||
    phone.trim() !== (initialPhone ?? "") ||
    (avatarUrl || "") !== (initialAvatarUrl || "");

  const initials = initialFullName
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase())
    .slice(0, 2)
    .join("");

  const handleSelectPhoto = () => {
    fileInputRef.current?.click();
  };

  const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast({ type: "error", message: "Please choose an image file." });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast({ type: "error", message: "Image must be under 5MB." });
      return;
    }

    setIsUploading(true);
    try {
      const path = `avatars/${userId}/${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
      const { error: uploadError } = await supabase.storage.from("avatars").upload(path, file, {
        cacheControl: "3600",
        upsert: true,
        contentType: file.type,
      });

      if (uploadError) {
        const message = uploadError.message || "Upload failed. Please try again.";
        const lowered = message.toLowerCase();
        if (lowered.includes("bucket") || lowered.includes("not found")) {
          showToast({
            type: "error",
            message: "Upload failed: storage bucket 'avatars' is missing. Please create it in Supabase Storage.",
          });
        } else {
          showToast({ type: "error", message });
        }
        return;
      }

      const { data: publicUrlData } = supabase.storage.from("avatars").getPublicUrl(path);
      if (!publicUrlData?.publicUrl) {
        showToast({ type: "error", message: "Could not get image URL." });
        return;
      }

      setAvatarUrl(publicUrlData.publicUrl);
      showToast({ type: "success", message: "Photo uploaded. Save to apply." });
    } catch (error) {
      console.error("Avatar upload error:", error);
      showToast({ type: "error", message: "Something went wrong. Please try again." });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isDirty || isSubmitting) return;

    if (!fullName.trim()) {
      showToast({ type: "error", message: "Full name is required." });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/cleaner/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName.trim(),
          phone: phone.trim(),
          avatar_url: avatarUrl || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        showToast({
          type: "error",
          message: data?.error || "Unable to update profile.",
        });
        return;
      }

      showToast({ type: "success", message: "Profile updated." });
    } catch (error) {
      console.error("Profile update error:", error);
      showToast({
        type: "error",
        message: "Something went wrong. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) {
        showToast({ type: "error", message: "Unable to sign out." });
        return;
      }
      window.location.assign("/login");
    } catch (error) {
      console.error("Sign out error:", error);
      showToast({
        type: "error",
        message: "Something went wrong. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col items-center gap-3">
        <Avatar src={avatarUrl} initials={initials} size="xl" />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleUpload}
        />
        <Button
          type="button"
          variant="ghost"
          className="h-auto px-0 text-sm text-accent hover:text-white"
          onClick={handleSelectPhoto}
          isLoading={isUploading}
          disabled={isUploading}
        >
          Change Photo
        </Button>
      </div>

      <form className="w-full flex flex-col gap-4" onSubmit={handleSubmit}>
        <Input
          label="Full Name"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          disabled={isSubmitting}
          required
        />
        <Input label="Email" value={email} disabled />
        <Input
          label="Phone Number"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          disabled={isSubmitting}
          required
        />
        
        <div className="flex flex-col gap-3 mt-4">
          <Button
            type="submit"
            size="large"
            className="w-full"
            isLoading={isSubmitting}
            disabled={!isDirty}
          >
            Save Changes
          </Button>
          <Button
            type="button"
            variant="outline"
            size="large"
            className="w-full border-danger text-danger hover:bg-danger/10 hover:text-danger hover:border-danger"
            onClick={handleSignOut}
            disabled={isSubmitting}
          >
            Sign Out
          </Button>
        </div>
      </form>
    </div>
  );
}
