export default function StudentPendingPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="max-w-md rounded-2xl border bg-card p-8 text-center shadow-sm">
        <h1 className="text-2xl font-bold">
          Account Awaiting Assignment
        </h1>

        <p className="mt-3 text-muted-foreground">
          Your account has been created successfully.
          An administrator needs to assign you to an
          organization and branch before you can access
          courses and student services.
        </p>
      </div>
    </div>
  );
}
