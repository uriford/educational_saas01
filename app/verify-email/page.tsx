import { EmailVerificationService } from "@/features/auth/services/email-verification.service";
import Link from "next/link";

type Props = {
  searchParams: Promise<{
    token?: string;
  }>;
};

export default async function VerifyEmailPage({
  searchParams,
}: Props) {
  const { token } = await searchParams;

  let result = {
    success: false,
    message: "Verification token is missing.",
  };

  if (token) {
    result = await EmailVerificationService.verify(token);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-xl border bg-card p-8 text-center shadow-sm">
        {result.success ? (
          <>
            <h1 className="text-2xl font-semibold text-green-600">
              Email Verified Successfully
            </h1>

            <p className="mt-4 text-muted-foreground">
              Your American Council account has been verified.
              You can now sign in.
            </p>

            <Link
              href="/login"
              className="mt-6 inline-flex rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground"
            >
              Go to Login
            </Link>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-semibold text-destructive">
              Verification Failed
            </h1>

            <p className="mt-4 text-muted-foreground">
              {result.message}
            </p>

            <Link
              href="/login"
              className="mt-6 inline-flex rounded-md border px-5 py-2 text-sm font-medium"
            >
              Back to Login
            </Link>
          </>
        )}
      </div>
    </main>
  );
}
