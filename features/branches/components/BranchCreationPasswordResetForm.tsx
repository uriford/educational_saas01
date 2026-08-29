"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  ShieldAlert,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { resetBranchCreationPasswordAction } from "../actions/branch.actions";

export default function BranchCreationPasswordResetForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [success, setSuccess] = useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setMessage("");
    setSuccess(false);

    if (!token) {
      setMessage(
        "This password reset link is invalid or incomplete.",
      );
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const result =
        await resetBranchCreationPasswordAction({
          token,
          password,
          confirmPassword,
        });

      setMessage(result.message);

      if (result.success) {
        setSuccess(true);
        setPassword("");
        setConfirmPassword("");
      }
    } catch {
      setMessage(
        "Unable to reset the branch creation password. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="space-y-6 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-500/10">
          <CheckCircle2 className="h-7 w-7 text-green-600 dark:text-green-400" />
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-semibold">
            Password Reset Successfully
          </h2>

          <p className="text-sm leading-6 text-muted-foreground">
            Your branch creation password has been updated.
            You can now return to Branch Security and use the
            new password whenever you create a branch.
          </p>
        </div>

        <Button
          type="button"
          className="w-full"
          onClick={() =>
            router.push(
              "/dashboard/organizations/branches",
            )
          }
        >
          Return to Branch Security
        </Button>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="space-y-5 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
          <ShieldAlert className="h-7 w-7 text-destructive" />
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-semibold">
            Invalid Reset Link
          </h2>

          <p className="text-sm leading-6 text-muted-foreground">
            This password reset link is missing the required
            security token. Please request a new reset link.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      <div className="rounded-xl border bg-muted/30 p-4">
        <div className="flex items-start gap-3">
          <KeyRound className="mt-0.5 h-5 w-5 shrink-0 text-primary" />

          <div>
            <p className="text-sm font-medium">
              Secure password reset
            </p>

            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Choose a strong password with at least 16
              characters, including uppercase and lowercase
              letters, numbers, and a special character.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="branch-reset-password"
          className="text-sm font-medium"
        >
          New Branch Creation Password
        </label>

        <div className="relative">
          <Input
            id="branch-reset-password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            minLength={16}
            required
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
            placeholder="Minimum 16 characters"
            className="pr-11"
          />

          <button
            type="button"
            aria-label={
              showPassword
                ? "Hide password"
                : "Show password"
            }
            onClick={() =>
              setShowPassword((value) => !value)
            }
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="branch-reset-confirm-password"
          className="text-sm font-medium"
        >
          Confirm New Password
        </label>

        <div className="relative">
          <Input
            id="branch-reset-confirm-password"
            type={
              showConfirmPassword
                ? "text"
                : "password"
            }
            autoComplete="new-password"
            minLength={16}
            required
            value={confirmPassword}
            onChange={(event) =>
              setConfirmPassword(event.target.value)
            }
            placeholder="Re-enter your new password"
            className="pr-11"
          />

          <button
            type="button"
            aria-label={
              showConfirmPassword
                ? "Hide password"
                : "Show password"
            }
            onClick={() =>
              setShowConfirmPassword(
                (value) => !value,
              )
            }
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
          >
            {showConfirmPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {message && (
        <div
          className={`rounded-lg border p-3 text-sm ${
            message.includes("successfully")
              ? "border-green-500/30 bg-green-500/5 text-green-700 dark:text-green-400"
              : "border-destructive/30 bg-destructive/5 text-destructive"
          }`}
        >
          {message}
        </div>
      )}

      <Button
        type="submit"
        className="w-full"
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Resetting Password...
          </>
        ) : (
          <>
            <KeyRound className="mr-2 h-4 w-4" />
            Reset Branch Creation Password
          </>
        )}
      </Button>

      <p className="text-center text-xs leading-5 text-muted-foreground">
        For your security, this reset link can only be used
        once and expires after 30 minutes.
      </p>
    </form>
  );
}
