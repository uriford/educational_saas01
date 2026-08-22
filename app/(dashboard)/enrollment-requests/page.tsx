import { getEnrollmentRequestsAction } from "@/features/enrollments/actions/get-enrollment-requests.action";
import EnrollmentRequestTable from "@/features/enrollments/components/EnrollmentRequestTable";

export default async function EnrollmentRequestsPage() {
  const requests = await getEnrollmentRequestsAction();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          Enrollment Requests
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Review student course enrollment applications.
        </p>
      </div>

      <EnrollmentRequestTable
        requests={requests.map((request) => ({
          ...request,
          firstName: request.firstName ?? "Unknown",
          lastName: request.lastName,
          email: request.email ?? "",
          student: request.student ?? {
            firstName: request.firstName ?? "Unknown",
            lastName: request.lastName ?? null,
          },
        }))}
      />
    </div>
  );
}
