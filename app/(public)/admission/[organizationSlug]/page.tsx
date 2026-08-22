import { notFound } from "next/navigation";

import { db } from "@/lib/db";
import PublicAdmissionForm from "@/features/admissions/components/AdmissionApplicationForm";


export default async function AdmissionPage({
  params,
}: {
  params: Promise<{
    organizationSlug: string;
  }>;
}) {
  const { organizationSlug } = await params;


  const organization =
    await db.organization.findFirst({
      where: {
        slug: organizationSlug,
        status: "ACTIVE",
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        logo: true,
      },
    });


  if (!organization) {
    notFound();
  }


  const courses =
    await db.course.findMany({
      where: {
        organizationId: organization.id,
        status: "ACTIVE",
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        code: true,
        branch: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });


  return (
    <div className="mx-auto max-w-4xl space-y-8 p-6">

      <div className="text-center space-y-3">

        {organization.logo && (
          <img
            src={organization.logo}
            alt={organization.name}
            className="mx-auto h-20 object-contain"
          />
        )}

        <h1 className="text-3xl font-bold">
          {organization.name}
        </h1>

        <p className="text-muted-foreground">
          Online Admission Form
        </p>

      </div>


      <PublicAdmissionForm
        organizationSlug={organizationSlug}
        courses={courses}
      />

    </div>
  );
}
