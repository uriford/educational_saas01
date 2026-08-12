import { db } from "@/lib/db";

export class AuthRepository {
  static async findUserByEmail(email: string) {
    return db.user.findFirst({
      where: {
        email,
        deletedAt: null,
      },
    });
  }

  static async findUserById(id: string) {
    return db.user.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });
  }

  static async updateLastLogin(id: string) {
    return db.user.update({
      where: {
        id,
      },
      data: {
        lastLoginAt: new Date(),
      },
    });
  }
}
