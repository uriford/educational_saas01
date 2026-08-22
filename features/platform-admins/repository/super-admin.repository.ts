import { db } from "@/lib/db";

export class SuperAdminRepository {

  static findByEmail(email: string) {
    return db.user.findFirst({
      where: {
        email,
        deletedAt: null,
      },
    });
  }


  static findAll() {
    return db.user.findMany({
      where: {
        role: "SUPER_ADMIN",
        deletedAt: null,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        code: true,
        firstName: true,
        lastName: true,
        email: true,
        status: true,
        createdAt: true,
      },
    });
  }


  static create(data: {
    code: string;
    firstName: string;
    lastName?: string;
    email: string;
    password: string;
  }) {

    return db.user.create({
      data: {
        code: data.code,
        firstName: data.firstName,
        lastName: data.lastName ?? null,
        email: data.email,
        password: data.password,

        role: "SUPER_ADMIN",
        status: "ACTIVE",

        organizationId: null,
        branchId: null,

        emailVerified: true,
      },
    });
  }

}
