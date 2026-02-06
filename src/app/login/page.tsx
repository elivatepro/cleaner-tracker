"use client";

import type { FormEvent } from "react";
import Link from "next/link";
import { useState } from "react";
import { AddToHomeTip } from "@/components/AddToHomeTip";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";

interface LoginErrors {
  email?: string;
  password?: string;
}

export default function LoginPage() {
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<LoginErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const companyName = process.env.NEXT_PUBLIC_COMPANY_NAME || "Elivate";
  const companyInitial =
    companyName.trim().length > 0 ? companyName.trim().charAt(0).toUpperCase() : "C";

  const validate = () => {
    const nextErrors: LoginErrors = {};
    const normalizedEmail = email.trim();

    if (!normalizedEmail) {
      nextErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      nextErrors.email = "Enter a valid email.";
    }

    if (!password.trim()) {
      nextErrors.password = "Password is required.";
    }

    return nextErrors;
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (errors.email) {
      setErrors((prev) => ({ ...prev, email: undefined }));
    }
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (errors.password) {
      setErrors((prev) => ({ ...prev, password: undefined }));
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
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      let data;
      try {
        data = await response.json();
      } catch (e) {
        data = { error: "Server error. Please try again." };
      }
      
      if (!response.ok) {
        showToast({
          type: "error",
          message: data?.error || "Invalid email or password.",
        });
        return;
      }

      showToast({ type: "success", message: "Signed in successfully." });
      
      // Delay redirect slightly to allow toast to be seen and cookies to settle
      setTimeout(() => {
        window.location.href = data.redirectUrl || "/cleaner";
      }, 100);
    } catch (error) {
      console.error("Login error:", error);
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
      <div className="relative z-base w-full max-w-[420px] rounded-2xl bg-primary-light border border-primary-border p-10 shadow-xl">
        <div className="mb-8 flex flex-col items-center gap-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-raised border border-primary-border text-2xl font-bold text-white shadow-lg">
            {companyInitial}
          </div>
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold text-white">Welcome back</h1>
            <p className="text-sm text-secondary-muted">Sign in to {companyName}</p>
          </div>
        </div>

        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(event) => handleEmailChange(event.target.value)}
            error={errors.email}
            disabled={isSubmitting}
            autoComplete="email"
            placeholder="name@example.com"
            required
          />
          <div className="flex flex-col gap-1">
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(event) => handlePasswordChange(event.target.value)}
              error={errors.password}
              disabled={isSubmitting}
              autoComplete="current-password"
              placeholder="••••••••"
              required
            />
          </div>
          
          <Button className="w-full mt-2" type="submit" isLoading={isSubmitting} size="large">
            Sign In
          </Button>
        </form>

        <p className="mt-8 text-center text-sm text-secondary-dim">
          Don&apos;t have an account?{" "}
          <Link className="text-accent hover:text-white transition-colors font-medium" href="/signup">
            Sign up with invitation
          </Link>
        </p>
        <div className="mt-6 pt-6 border-t border-primary-border">
          <AddToHomeTip className="text-center text-xs text-secondary-dim" />
        </div>
      </div>
    </div>
  );
}
