import { Suspense } from "react";

import AuthCard from "@/features/auth/components/AuthCard";
import BranchCreationPasswordResetForm from "@/features/branches/components/BranchCreationPasswordResetForm";

function ResetPasswordFallback() {
  return (
    <div className="space-y-5">
      <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
      <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
      <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
    </div>
  );
}

export default function BranchCreationPasswordResetPage() {
  return (
    <AuthCard
      title="Reset Branch Creation Password"
      description="Create a new secure password for protecting branch creation."
    >
      <Suspense fallback={<ResetPasswordFallback />}>
        <BranchCreationPasswordResetForm />
      </Suspense>
    </AuthCard>
  );
}
