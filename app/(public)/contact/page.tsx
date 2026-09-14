import type { Metadata } from "next";

import PublicContact from "@/features/public/components/PublicContact";
import { PublicRepository } from "@/features/public/repository/public.repository";
import SaaSContact from "@/features/saas/views/SaaSContact";
import { getCurrentTenant } from "@/lib/tenant";

export async function generateMetadata(): Promise<Metadata> {
  const tenant = await getCurrentTenant();

  if (!tenant) {
    return {
      title: "Contact",
      description:
        "Talk with Uriford about your institution, operational requirements, branches, platform capabilities, and getting started.",
    };
  }

  return {
    title: `Contact | ${tenant.name}`,
    description: `Get in touch with ${tenant.name}. Find contact information and branch locations.`,
  };
}

export default async function ContactPage() {
  const tenant = await getCurrentTenant();

  if (!tenant) {
    return <SaaSContact />;
  }

  const data = await PublicRepository.getOrganizationBySlug(tenant.slug);

  if (!data) {
    return <SaaSContact />;
  }

  return (
    <PublicContact
      organization={{
        name: data.name,
        email: data.email,
        phone: data.phone,
        logo: data.logo,
      }}
      branches={data.branches}
    />
  );
}
