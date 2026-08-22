import { auth } from "@/auth";
import { redirect } from "next/navigation";

import CreateSuperAdminForm from "@/features/platform-admins/components/CreateSuperAdminForm";


export default async function CreateSuperAdminPage() {

  const session = await auth();


  if (!session?.user?.id) {
    redirect("/login");
  }


  if (session.user.role !== "SUPER_ADMIN") {
    redirect("/dashboard");
  }


  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-2xl font-bold">
          Create Super Admin
        </h1>

        <p className="text-sm text-muted-foreground">
          Create a new platform-level administrator.
        </p>
      </div>


      <CreateSuperAdminForm />

    </div>
  );
}
