import { db } from "@/lib/db";

export class SignupRepository {
  static async findUserByEmail(email: string) {
    return db.user.findFirst({
      where: {
        email,
        deletedAt: null,
      },
    });
  }

  /**
   * Creates the platform-level student account.
   *
   * Organization and branch are intentionally NULL here.
   * The student is assigned to an organization/course later
   * through the admin enrollment system.
   */
  static async createStudentAccount(data: {
    code: string;
    firstName: string;
    lastName?: string;
    email: string;
    phone: string;
    password: string;
  }) {
    return db.user.create({
      data: {
        code: data.code,
        firstName: data.firstName,
        lastName: data.lastName || null,
        email: data.email,
        phone: data.phone,
        password: data.password,
        role: "STUDENT",
        status: "ACTIVE",

        // Student is not assigned to an organization yet.
        organizationId: null,
        branchId: null,

        emailVerified: false,
      },
    });
  }
}
