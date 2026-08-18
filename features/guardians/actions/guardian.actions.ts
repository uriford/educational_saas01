"use server";

import { auth } from "@/auth";

import { GuardianService } from "../services/guardian.service";
import {
  createGuardianSchema,
  updateGuardianSchema,
  updateGuardianStatusSchema,
} from "../schemas/guardian.schema";

function getActor() {
  return auth().then((session) => {
    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    if (!session.user.organizationId) {
      throw new Error("Organization context is missing.");
    }

    return {
      userId: session.user.id,
      organizationId: session.user.organizationId,
      branchId: session.user.branchId ?? null,
      role: session.user.role,
    };
  });
}

export async function getGuardiansAction(
  search?: string,
) {
  const actor = await getActor();

  return GuardianService.getAll(
    actor.organizationId,
    actor.branchId,
    actor.role,
    search,
  );
}

export async function getGuardianAction(
  guardianId: string,
) {
  const actor = await getActor();

  return GuardianService.getById(
    actor.organizationId,
    actor.branchId,
    actor.role,
    guardianId,
  );
}

export async function createGuardianAction(
  input: unknown,
) {
  const actor = await getActor();

  const parsed =
    createGuardianSchema.safeParse(input);

  if (!parsed.success) {
    throw new Error(
      parsed.error.issues[0]?.message ??
        "Invalid guardian data.",
    );
  }

  return GuardianService.create(
    actor.organizationId,
    actor.userId,
    actor.branchId,
    actor.role,
    parsed.data,
  );
}

export async function updateGuardianAction(
  guardianId: string,
  input: unknown,
) {
  const actor = await getActor();

  const parsed =
    updateGuardianSchema.safeParse(input);

  if (!parsed.success) {
    throw new Error(
      parsed.error.issues[0]?.message ??
        "Invalid guardian data.",
    );
  }

  return GuardianService.update(
    actor.organizationId,
    actor.userId,
    actor.branchId,
    actor.role,
    guardianId,
    parsed.data,
  );
}

export async function updateGuardianStatusAction(
  input: unknown,
) {
  const actor = await getActor();

  const parsed =
    updateGuardianStatusSchema.safeParse(input);

  if (!parsed.success) {
    throw new Error(
      parsed.error.issues[0]?.message ??
        "Invalid guardian status.",
    );
  }

  return GuardianService.updateStatus(
    actor.organizationId,
    actor.userId,
    actor.branchId,
    actor.role,
    parsed.data.guardianId,
    parsed.data.status,
  );
}

export async function deleteGuardianAction(
  guardianId: string,
) {
  const actor = await getActor();

  return GuardianService.remove(
    actor.organizationId,
    actor.userId,
    actor.branchId,
    actor.role,
    guardianId,
  );
}

export async function getGuardianManagementStudentsAction() {
  const actor = await getActor();

  return GuardianService.getManagementStudents(
    actor.organizationId,
    actor.branchId,
    actor.role,
  );
}
