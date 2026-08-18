import { Suspense } from "react";

import AuthCard from "@/features/auth/components/AuthCard";
import ResetPasswordForm from "@/features/auth/components/ResetPasswordForm";
import { AUTH_TEXT } from "@/features/auth/constants/auth-text";

function ResetPasswordFormFallback() {
  return (
    <div className="space-y-5">
      <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
      <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
      <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <AuthCard
      title={AUTH_TEXT.RESET_PASSWORD.TITLE}
      description={AUTH_TEXT.RESET_PASSWORD.DESCRIPTION}
    >
      <Suspense fallback={<ResetPasswordFormFallback />}>
        <ResetPasswordForm />
      </Suspense>
    </AuthCard>
  );
}
