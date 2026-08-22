import { auth } from "@/auth";
import { redirect } from "next/navigation";

import {
  SuperAdminService,
} from "@/features/platform-admins/services/super-admin.service";


export default async function PlatformAdminsPage() {

  const session = await auth();


  if (!session?.user?.id) {
    redirect("/login");
  }


  if (session.user.role !== "SUPER_ADMIN") {
    redirect("/dashboard");
  }


  const admins =
    await SuperAdminService.getAll();


  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-2xl font-bold">
          Platform Administrators
        </h1>

        <p className="text-sm text-muted-foreground">
          Manage system-level administrators.
        </p>
      </div>


      <div className="rounded-lg border">

        <div className="grid grid-cols-5 border-b px-4 py-3 text-sm font-semibold">
          <div>Code</div>
          <div>Name</div>
          <div>Email</div>
          <div>Status</div>
          <div>Created</div>
        </div>


        {admins.map((admin) => (

          <div
            key={admin.id}
            className="grid grid-cols-5 border-b px-4 py-3 text-sm"
          >

            <div>
              {admin.code}
            </div>


            <div>
              {admin.firstName} {admin.lastName ?? ""}
            </div>


            <div>
              {admin.email}
            </div>


            <div>
              {admin.status}
            </div>


            <div>
              {admin.createdAt.toLocaleDateString()}
            </div>

          </div>

        ))}


        {admins.length === 0 && (
          <div className="p-6 text-center text-sm text-muted-foreground">
            No platform administrators found.
          </div>
        )}

      </div>


      <a
        href="/platform-admins/create"
        className="inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
      >
        Create Super Admin
      </a>

    </div>
  );
}
