import { notFound } from "next/navigation";

import PublicHome from "@/features/public/components/PublicHome";
import { PublicRepository } from "@/features/public/repository/public.repository";
import { ReviewRepository } from "@/features/reviews/repository/review.repository";
import SaaSHome from "@/features/saas/components/SaaSHome";
import { getCurrentTenant } from "@/lib/tenant";

export default async function Home() {
  const tenant = await getCurrentTenant();

  if (!tenant) {
    return <SaaSHome />;
  }

  const data = await PublicRepository.getOrganizationBySlug(
    tenant.slug,
  );

  if (!data) {
    notFound();
  }

  const reviews = await ReviewRepository.getApprovedReviews(
    tenant.id,
    6,
  );

  return (
    <PublicHome
      data={{
        organization: {
          id: data.id,
          code: data.code,
          name: data.name,
          slug: data.slug,
          email: data.email,
          phone: data.phone,
          domain: data.domain,
          logo: data.logo,
        },

        stats: {
          students: data._count.students,
          teachers: data._count.teachers,
          courses: data._count.courses,
        },

        branches: data.branches,

        courses: data.courses,

        announcements: data.announcements,

        upcomingClasses: data.classSessions,

        reviews,
      }}
    />
  );
}
