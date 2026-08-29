"use client";

import { useState } from "react";
import { Mail, Loader2, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { requestBranchCreationPasswordResetAction } from "../actions/branch.actions";

export default function BranchCreationPasswordRecovery() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleRequest() {
    setLoading(true);
    setMessage("");

    try {
      const result =
        await requestBranchCreationPasswordResetAction();

      setMessage(result.message);
    } catch {
      setMessage(
        "Unable to process the password reset request. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  const success =
    message.includes("sent to your registered");

  return (
    <div className="rounded-xl border bg-muted/30 p-4">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <ShieldCheck className="h-4 w-4 text-primary" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">
            Forgot the branch creation password?
          </p>

          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            We&apos;ll send a secure password reset link to the
            registered headquarters administrator email address.
            The link expires after 30 minutes.
          </p>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={handleRequest}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending Reset Link...
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Send Reset Link
              </>
            )}
          </Button>

          {message && (
            <p
              className={`mt-3 text-xs leading-5 ${
                success
                  ? "text-green-600 dark:text-green-400"
                  : "text-destructive"
              }`}
            >
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
