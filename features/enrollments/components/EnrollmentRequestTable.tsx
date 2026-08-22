"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { reviewEnrollmentRequestAction } from "../actions/review-enrollment-request.action";

type Request = {
  id: string;
  firstName: string;
  lastName: string | null;
  email: string;
  phone: string | null;

  paymentMethod: string | null;
  requestedAmount: unknown;
  transactionId: string | null;
  paymentPhone: string | null;
  paymentDate: Date | null;
  paymentReference: string | null;
  cardHolderName: string | null;
  cardLastFour: string | null;
  paymentNote: string | null;

  createdAt: Date;

  student: {
    firstName: string;
    lastName: string | null;
  };

  course: {
    name: string;
    code: string;
  };

  branch: {
    name: string;
  } | null;
};

type Props = {
  requests: Request[];
};

export default function EnrollmentRequestTable({
  requests,
}: Props) {
  const [isPending, startTransition] = useTransition();

  const [credentials, setCredentials] = useState<{
    email: string;
    password: string;
  } | null>(null);


  function review(
    id: string,
    decision: "APPROVE" | "REJECT",
  ) {
    startTransition(async () => {
      const result =
        await reviewEnrollmentRequestAction(
          id,
          decision,
        );

      if (!result.success) {
        toast.error(result.message);
        return;
      }


      if (
        decision === "APPROVE" &&
        result.email &&
        result.temporaryPassword
      ) {
        setCredentials({
          email: result.email,
          password: result.temporaryPassword,
        });
      }


      toast.success(result.message);
    });
  }


  async function copy(value: string) {
    await navigator.clipboard.writeText(value);
    toast.success("Copied.");
  }


  if (!requests.length) {
    return (
      <div className="rounded-lg border p-8 text-center text-muted-foreground">
        No pending enrollment requests.
      </div>
    );
  }


  return (
    <>
      <div className="space-y-4">
        {requests.map((request) => (
          <div
            key={request.id}
            className="space-y-5 rounded-xl border p-5"
          >

            <div>
              <h3 className="text-lg font-semibold">
                {`${request.firstName} ${request.lastName ?? ""}`.trim()}
              </h3>

              <p className="text-sm text-muted-foreground">
                {request.email}
              </p>

              {request.phone && (
                <p className="text-sm">
                  Phone: {request.phone}
                </p>
              )}
            </div>


            <div className="grid gap-2 text-sm sm:grid-cols-2">

              <p>
                Course:
                {" "}
                <strong>
                  {request.course.name}
                </strong>
              </p>

              <p>
                Code:
                {" "}
                {request.course.code}
              </p>

              <p>
                Branch:
                {" "}
                {request.branch?.name ?? "Online"}
              </p>

            </div>


            <div className="rounded-lg bg-muted/40 p-4 space-y-2">

              <h4 className="font-semibold">
                Payment Information
              </h4>

              <p>
                Method:
                {" "}
                {request.paymentMethod ?? "N/A"}
              </p>

              <p>
                Amount:
                {" "}
                {request.requestedAmount
                  ? String(request.requestedAmount)
                  : "N/A"}
              </p>

              {request.transactionId && (
                <p>
                  Transaction ID:
                  {" "}
                  {request.transactionId}
                </p>
              )}

              {request.paymentPhone && (
                <p>
                  Payment Phone:
                  {" "}
                  {request.paymentPhone}
                </p>
              )}

              {request.paymentReference && (
                <p>
                  Reference:
                  {" "}
                  {request.paymentReference}
                </p>
              )}

            </div>


            <div className="flex gap-3">

              <Button
                disabled={isPending}
                onClick={() =>
                  review(
                    request.id,
                    "APPROVE",
                  )
                }
              >
                Approve
              </Button>


              <Button
                variant="destructive"
                disabled={isPending}
                onClick={() =>
                  review(
                    request.id,
                    "REJECT",
                  )
                }
              >
                Reject
              </Button>

            </div>

          </div>
        ))}
      </div>


      {credentials && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">

          <div className="w-full max-w-md rounded-xl bg-background p-6 space-y-5">

            <h2 className="text-xl font-bold">
              Student Account Created
            </h2>


            <div className="space-y-3">

              <div>
                <p className="text-sm text-muted-foreground">
                  Email
                </p>

                <div className="flex gap-2">
                  <code className="flex-1 rounded bg-muted p-2">
                    {credentials.email}
                  </code>

                  <Button
                    size="sm"
                    onClick={() =>
                      copy(credentials.email)
                    }
                  >
                    Copy
                  </Button>
                </div>
              </div>


              <div>
                <p className="text-sm text-muted-foreground">
                  Temporary Password
                </p>

                <div className="flex gap-2">
                  <code className="flex-1 rounded bg-muted p-2">
                    {credentials.password}
                  </code>

                  <Button
                    size="sm"
                    onClick={() =>
                      copy(credentials.password)
                    }
                  >
                    Copy
                  </Button>
                </div>
              </div>

            </div>


            <Button
              className="w-full"
              onClick={() => {
                setCredentials(null);
                window.location.reload();
              }}
            >
              Done
            </Button>

          </div>

        </div>
      )}

    </>
  );
}
