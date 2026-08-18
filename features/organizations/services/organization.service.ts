import "server-only";

import bcrypt from "bcrypt";
import crypto from "node:crypto";

import { OrganizationRepository } from "../repository/organization.repository";
import {
  createOrganizationSchema,
  type CreateOrganizationInput,
} from "../schemas/organization.schema";

function generateCode(prefix: string) {
  return `${prefix}-${crypto
    .randomBytes(5)
    .toString("hex")
    .toUpperCase()}`;
}



function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export class OrganizationService {
  static async getAll(
    actorRole: string,
  ) {
    if (actorRole !== "SUPER_ADMIN") {
      throw new Error("Forbidden");
    }

    return OrganizationRepository.getAll();
  }


  static async suspend(
    actorUserId: string,
    actorRole: string,
    organizationId: string,
  ) {
    if (actorRole !== "SUPER_ADMIN") {
      throw new Error("Forbidden");
    }

    if (!organizationId?.trim()) {
      throw new Error("Organization ID is required.");
    }

    const result =
      await OrganizationRepository.suspend(
        organizationId,
      );

    return {
      success: true as const,
      organization: result,
    };
  }

  static async activate(
    actorUserId: string,
    actorRole: string,
    organizationId: string,
  ) {
    if (actorRole !== "SUPER_ADMIN") {
      throw new Error("Forbidden");
    }

    if (!organizationId?.trim()) {
      throw new Error("Organization ID is required.");
    }

    const result =
      await OrganizationRepository.activate(
        organizationId,
      );

    return {
      success: true as const,
      organization: result,
    };
  }

  static async remove(
    actorUserId: string,
    actorRole: string,
    organizationId: string,
  ) {
    if (actorRole !== "SUPER_ADMIN") {
      throw new Error("Forbidden");
    }

    if (!organizationId?.trim()) {
      throw new Error("Organization ID is required.");
    }

    const result =
      await OrganizationRepository.remove(
        organizationId,
        actorUserId,
      );

    return {
      success: true as const,
      organization: result,
    };
  }

  static async create(
    actorUserId: string,
    actorRole: string,
    data: CreateOrganizationInput,
  ) {
    if (actorRole !== "SUPER_ADMIN") {
      throw new Error("Forbidden");
    }

    const parsed =
      createOrganizationSchema.safeParse(data);

    if (!parsed.success) {
      throw new Error(
        parsed.error.issues[0]?.message ??
          "Invalid organization data.",
      );
    }

    const input = parsed.data;

    const name = input.name.trim();
    const slug = slugify(name);
    const organizationEmail = input.email.trim().toLowerCase();
    const adminEmail = input.adminEmail.trim().toLowerCase();

    if (!slug) {
      throw new Error("Invalid organization name.");
    }

    const existingOrganization =
      await OrganizationRepository.findBySlug(slug);

    if (existingOrganization) {
      throw new Error(
        "An organization with this name already exists.",
      );
    }

    const existingAdmin =
      await OrganizationRepository.findUserByEmail(
        adminEmail,
      );

    if (existingAdmin) {
      throw new Error(
        "An account with this admin email already exists.",
      );
    }

    const password = await bcrypt.hash(
      input.adminPassword,
      12,
    );

    const result =
      await OrganizationRepository.createOrganizationWithAdmin(
        {
          code: generateCode("ORG"),
          name,
          slug,
          email: organizationEmail,
          phone: input.phone?.trim() || null,
          hasBranches: input.hasBranches,
          adminCode: generateCode("ADMIN"),
          adminFirstName:
            input.adminFirstName.trim(),
          adminLastName:
            input.adminLastName?.trim() || null,
          adminEmail,
          password,
          createdById: actorUserId,
        },
      );

    return {
      success: true as const,
      organization: result.organization,
      branch: result.branch,
      admin: result.admin,
    };
  }
}
