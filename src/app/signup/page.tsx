"use client";

import type { ChangeEvent, FormEvent } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { Camera } from "lucide-react";

interface SignupErrors {
  fullName?: string;
  password?: string;
  confirmPassword?: string;
}

function SignupContent() {
  const { showToast } = useToast();
  const searchParams = useSearchParams();
  const inviteToken = searchParams.get("token") || "";
  const isInviteMissing = inviteToken.length === 0;

  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<SignupErrors>({});
  const [inviteEmail, setInviteEmail] = useState("");
  const [isLoadingInvite, setIsLoadingInvite] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);

  const companyName = process.env.NEXT_PUBLIC_COMPANY_NAME || "Elivate";

  useEffect(() => {
    if (isInviteMissing) return;
    let isCancelled = false;
    const fetchInvite = async () => {
      try {
        setIsLoadingInvite(true);
        setInviteError(null);
        const response = await fetch(`/api/invite/${inviteToken}`);
        const data = await response.json().catch(() => null);
        if (!response.ok || !data?.data?.email) {
          if (!isCancelled) setInviteError(data?.error || "Invitation is invalid or expired.");
          return;
        }
        if (!isCancelled) setInviteEmail(data.data.email);
      } catch (error) {
        console.error("Fetch invite error:", error);
        if (!isCancelled) setInviteError("Unable to load invitation. Please retry.");
      } finally {
        if (!isCancelled) setIsLoadingInvite(false);
      }
    };
    void fetchInvite();
    return () => {
      isCancelled = true;
    };
  }, [inviteToken, isInviteMissing]);

  const validate = () => {
    const nextErrors: SignupErrors = {};

    if (!fullName.trim()) {
      nextErrors.fullName = "Full name is required.";
    }

    if (!password.trim()) {
      nextErrors.password = "Password is required.";
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
    if (isSubmitting || isInviteMissing || inviteError || !inviteEmail) return;

    const nextErrors = validate();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      showToast({ type: "error", message: "Please fix the errors below." });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName.trim(),
          password,
          invite_token: inviteToken,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        showToast({
          type: "error",
          message: data?.error || "Unable to create account.",
        });
        return;
      }

      showToast({ type: "success", message: "Account created successfully." });
      window.location.assign("/cleaner");
    } catch (error) {
      console.error("Signup error:", error);
      showToast({
        type: "error",
        message: "Something went wrong. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-primary px-4 py-6 md:px-12 md:py-8">
      <div className="w-full max-w-[480px] rounded-2xl bg-primary-light border border-primary-border p-8 shadow-xl">
        <div className="mb-6">
          <Link className="text-sm text-secondary-dim hover:text-white transition-colors" href="/login">
            &larr; Back to sign in
          </Link>
        </div>

        <div className="flex flex-col items-center gap-2 text-center mb-8">
          <h1 className="text-2xl font-bold text-white">Create Account</h1>
          <p className="text-sm text-secondary-muted">
            Join {companyName} with your invitation.
          </p>
        </div>

        <div className="flex justify-center mb-8">
          <div className="h-24 w-24 rounded-full bg-primary-lighter border-2 border-dashed border-primary-border flex items-center justify-center text-secondary-dim hover:text-white hover:border-white/50 transition-colors cursor-pointer">
            <Camera className="h-8 w-8" />
          </div>
        </div>

        {isInviteMissing || inviteError ? (
          <div className="mb-6">
            <Card variant="danger" className="bg-danger/10 border-danger/20">
              <p className="text-sm text-danger font-medium text-center">
                {inviteError || "An invitation token is required to sign up. Please use the link from your invitation email."}
              </p>
            </Card>
          </div>
        ) : null}

        {!isInviteMissing && !inviteError ? (
          <div className="mb-4">
            <Card className="bg-surface-raised border border-primary-border">
              <p className="text-sm text-secondary-muted">
                Signing up as <span className="text-white font-medium">{inviteEmail || "..."}</span>
              </p>
            </Card>
          </div>
        ) : null}

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <Input
            label="Full Name"
            value={fullName}
            onChange={handleFieldChange("fullName", setFullName)}
            error={errors.fullName}
            disabled={isSubmitting}
            required
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
          />

          <Button
            className="w-full mt-4"
            type="submit"
            isLoading={isSubmitting}
            disabled={isInviteMissing || !!inviteError || isLoadingInvite || !inviteEmail}
            size="large"
          >
            Create Account
          </Button>
        </form>

        <p className="mt-8 text-center text-sm text-secondary-dim">
          Already have an account?{" "}
          <Link className="text-accent hover:text-white transition-colors font-medium" href="/login">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignupContent />
    </Suspense>
  );
}
