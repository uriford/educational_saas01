import {
  CheckCircle2,
  Clock3,
  KeyRound,
  Mail,
  ShieldCheck,
  XCircle,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Separator } from "@/components/ui/separator";

import type { StudentDetails } from "../../types";

type Props = {
  student: StudentDetails;
};

export default function StudentAccountCard({
  student,
}: Props) {
  const user = student.user;

  return (
    <Card className="rounded-xl border shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          Account Access
        </CardTitle>

        <p className="text-sm text-muted-foreground">
          Student portal login and account status
        </p>
      </CardHeader>

      <Separator />

      <CardContent className="space-y-5 pt-6">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <KeyRound className="size-5 text-primary" />
          </div>

          <div>
            <p className="text-xs text-muted-foreground">
              Portal Access
            </p>

            <div className="mt-1 flex items-center gap-2">
              {user ? (
                <>
                  <CheckCircle2 className="size-4 text-emerald-500" />
                  <span className="text-sm font-semibold">
                    Enabled
                  </span>
                </>
              ) : (
                <>
                  <XCircle className="size-4 text-muted-foreground" />
                  <span className="text-sm font-semibold">
                    Not enabled
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {user ? (
          <>
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <Mail className="size-5 text-primary" />
              </div>

              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">
                  Login Email
                </p>

                <p className="mt-1 break-words text-sm font-medium">
                  {user.email}
                </p>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <p className="text-xs text-muted-foreground">
                  Account Status
                </p>

                <p className="mt-1 text-sm font-semibold">
                  {user.status}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">
                  Email Verification
                </p>

                <div className="mt-1 flex items-center gap-2 text-sm font-semibold">
                  {user.emailVerified ? (
                    <>
                      <CheckCircle2 className="size-4 text-emerald-500" />
                      Verified
                    </>
                  ) : (
                    <>
                      <Clock3 className="size-4 text-amber-500" />
                      Not verified
                    </>
                  )}
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">
                Last Login
              </p>

              <p className="mt-1 text-sm font-medium">
                {user.lastLoginAt
                  ? new Date(user.lastLoginAt).toLocaleString()
                  : "Never"}
              </p>
            </div>
          </>
        ) : (
          <div className="rounded-xl border border-dashed bg-muted/30 p-4">
            <p className="text-sm font-medium">
              No portal account connected
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              This student was created without an email address,
              so they cannot sign in to the student portal yet.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
