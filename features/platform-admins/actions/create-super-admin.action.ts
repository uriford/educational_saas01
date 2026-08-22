"use server";

import { requireRole } from "@/features/auth/authorization";

import {
  createSuperAdminSchema,
} from "../schemas/super-admin.schema";

import {
  SuperAdminService,
} from "../services/super-admin.service";


export async function createSuperAdminAction(
  data: unknown,
) {

  await requireRole([
    "SUPER_ADMIN",
  ]);


  const parsed =
    createSuperAdminSchema.safeParse(data);


  if (!parsed.success) {
    return {
      success: false,
      message: "Invalid super admin data.",
    };
  }


  try {

    const user =
      await SuperAdminService.create(
        parsed.data,
      );


    return {
      success: true,
      message:
        "Super admin created successfully.",
      userId: user.id,
    };


  } catch (error) {

    console.error(
      "CREATE SUPER ADMIN ERROR:",
      error,
    );


    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to create super admin.",
    };

  }

}
