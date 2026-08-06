import { db } from "@/lib/db";

export class AuthRepository {
  static async findUserByEmail(email: string) {
    return db.user.findUnique({
      where: {
        email,
      },
    });
  }

  static async findUserById(id: string) {
    return db.user.findUnique({
      where: {
        id,
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