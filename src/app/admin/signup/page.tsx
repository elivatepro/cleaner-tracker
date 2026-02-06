"use client";

import type { ChangeEvent, FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";

interface SignupErrors {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export default function AdminSignupPage() {
  const { showToast } = useToast();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<SignupErrors>({});

  const companyName = process.env.NEXT_PUBLIC_COMPANY_NAME || "Elivate";

  const validate = () => {
    const nextErrors: SignupErrors = {};

    if (!fullName.trim()) {
      nextErrors.fullName = "Full name is required.";
    }

    if (!email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      nextErrors.email = "Enter a valid email.";
    }

    if (!password.trim()) {
      nextErrors.password = "Password is required.";
    } else if (password.length < 6) {
      nextErrors.password = "Password must be at least 6 characters.";
    }

    if (!confirmPassword.trim()) {
      nextErrors.confirmPassword = "Confirm your password.";
    } else if (password.trim() !== confirmPassword.trim()) {
      nextErrors.confirmPassword = "Passwords do not match.";
    }

    return nextErrors;
  };

  const handleFieldChange =
    (key: keyof SignupErrors, setter: (value: string) => void) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      setter(event.target.value);
      if (errors[key]) {
        setErrors((prev) => ({ ...prev, [key]: undefined }));
      }
    };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    const nextErrors = validate();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      showToast({ type: "error", message: "Please fix the errors below." });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/admin/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName.trim(),
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        showToast({
          type: "error",
          message: data?.error || "Unable to create admin account.",
        });
        return;
      }

      showToast({ type: "success", message: "Admin account created successfully." });
      
      // Delay redirect slightly to ensure cookies are set
      setTimeout(() => {
        window.location.assign("/admin");
      }, 100);
    } catch (error) {
      console.error("Admin signup error:", error);
      showToast({
        type: "error",
        message: "Something went wrong. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative z-base flex min-h-screen items-center justify-center bg-primary px-4 py-6 md:px-12 md:py-8">
      <div className="relative z-base w-full max-w-[480px] rounded-2xl bg-primary-light border border-primary-border p-8 shadow-xl">
        <div className="mb-6">
          <Link className="text-sm text-secondary-dim hover:text-white transition-colors" href="/login">
            &larr; Back to sign in
          </Link>
        </div>

        <div className="flex flex-col items-center gap-4 text-center mb-8">
          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-raised border border-primary-border shadow-lg overflow-hidden">
            <Image
              src="/Elivate Network Logo.svg"
              alt={`${companyName} logo`}
              fill
              className="object-contain p-2"
              priority
            />
          </div>
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold text-white">Admin Signup</h1>
            <p className="text-sm text-secondary-muted">
              Create your {companyName} administrator account.
            </p>
          </div>
        </div>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <Input
            label="Full Name"
            value={fullName}
            onChange={handleFieldChange("fullName", setFullName)}
            error={errors.fullName}
            disabled={isSubmitting}
            required
            placeholder="Your full name"
          />
          <Input
            label="Admin Email"
            type="email"
            value={email}
            onChange={handleFieldChange("email", setEmail)}
            error={errors.email}
            disabled={isSubmitting}
            required
            placeholder="admin@example.com"
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={handleFieldChange("password", setPassword)}
            error={errors.password}
            disabled={isSubmitting}
            autoComplete="new-password"
            required
            placeholder="At least 6 characters"
          />
          <Input
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={handleFieldChange("confirmPassword", setConfirmPassword)}
            error={errors.confirmPassword}
            disabled={isSubmitting}
            autoComplete="new-password"
            required
            placeholder="Repeat your password"
          />

          <Button
            className="w-full mt-4"
            type="submit"
            isLoading={isSubmitting}
            size="large"
          >
            Create Admin Account
          </Button>
        </form>

        <p className="mt-8 text-center text-sm text-secondary-dim border-t border-primary-border pt-6">
          Already have an account?{" "}
          <Link className="text-accent hover:text-white transition-colors font-medium" href="/login">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
