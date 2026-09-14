import "server-only";

import { headers } from "next/headers";
import { db } from "@/lib/db";

function normalizeHostname(hostname: string): string {
  return hostname
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .split("/")[0]
    .split(":")[0]
    .replace(/\.$/, "");
}

function getPlatformHosts(): Set<string> {
  const configured = process.env.PLATFORM_DOMAINS
    ?.split(",")
    .map(normalizeHostname)
    .filter(Boolean);

  const hosts = new Set<string>([
    "localhost",
    "127.0.0.1",
    "::1",
    ...(configured ?? []),
  ]);

  return hosts;
}

export async function getCurrentHostname(): Promise<string> {
  const requestHeaders = await headers();

  const host =
    requestHeaders.get("host") ??
    requestHeaders.get("x-forwarded-host") ??
    "";

  return normalizeHostname(host);
}

export async function getCurrentTenant() {
  const hostname = await getCurrentHostname();

  if (!hostname) {
    return null;
  }

  const platformHosts = getPlatformHosts();

  if (
    platformHosts.has(hostname) ||
    (hostname.endsWith(".vercel.app") &&
      hostname !== "educational-saas01-9e5o.vercel.app")
  ) {
    return null;
  }

  const organization =
    await db.organization.findFirst({
      where: {
        domain: hostname,
        status: "ACTIVE",
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        domain: true,
        logo: true,
        status: true,
      },
    });

  return organization;
}

export async function getTenantOrganizationId(): Promise<
  string | null
> {
  const tenant = await getCurrentTenant();

  return tenant?.id ?? null;
}

export function isPlatformHostname(
  hostname: string,
): boolean {
  const normalized = normalizeHostname(hostname);

  return (
    getPlatformHosts().has(normalized) ||
    normalized.endsWith(".vercel.app")
  );
}
