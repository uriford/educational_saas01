import type { Metadata } from "next";

import { auth } from "@/auth";
import PublicReviews from "@/features/reviews/components/PublicReviews";
import { ReviewRepository } from "@/features/reviews/repository/review.repository";
import { getCurrentTenant } from "@/lib/tenant";

export async function generateMetadata(): Promise<Metadata> {
  const tenant = await getCurrentTenant();

  return {
    title: tenant ? `Reviews | ${tenant.name}` : "Reviews",
    description: tenant
      ? `Read reviews and testimonials from students and guardians of ${tenant.name}.`
      : "Read reviews and testimonials.",
  };
}

export default async function ReviewsPage() {
  const tenant = await getCurrentTenant();

  if (!tenant) {
    return null;
  }

  const session = await auth();

  const isAdmin =
    session?.user?.role === "SUPER_ADMIN" ||
    session?.user?.role === "ORGANIZATION_ADMIN" ||
    session?.user?.role === "BRANCH_ADMIN";

  const reviews = isAdmin
    ? await ReviewRepository.getAllReviews(tenant.id)
    : await ReviewRepository.getApprovedReviews(tenant.id);

  let eligibility = {
    eligible: false,
    authorType: null as "STUDENT" | "GUARDIAN" | null,
  };

  if (session?.user?.id && !isAdmin) {
    eligibility = await ReviewRepository.getReviewEligibility(
      session.user.id,
      tenant.id,
    );
  }

  return (
    <PublicReviews
      organizationName={tenant.name}
      reviews={reviews}
      canSubmit={eligibility.eligible}
      authorType={eligibility.authorType}
      isAdmin={isAdmin}
    />
  );
}
