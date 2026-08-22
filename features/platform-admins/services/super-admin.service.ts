import "server-only";

import bcrypt from "bcrypt";
import crypto from "node:crypto";

import { SuperAdminRepository } from "../repository/super-admin.repository";
import type { CreateSuperAdminInput } from "../schemas/super-admin.schema";


function generateSuperAdminCode() {
  return `SUPER-${crypto
    .randomBytes(4)
    .toString("hex")
    .toUpperCase()}`;
}


export class SuperAdminService {


  static async getAll() {

    return SuperAdminRepository.findAll();

  }


  static async create(
    data: CreateSuperAdminInput,
  ) {

    const email =
      data.email.trim().toLowerCase();


    const existing =
      await SuperAdminRepository.findByEmail(
        email,
      );


    if (existing) {
      throw new Error(
        "A user with this email already exists.",
      );
    }


    const password =
      await bcrypt.hash(
        data.password,
        12,
      );


    return SuperAdminRepository.create({
      code: generateSuperAdminCode(),

      firstName:
        data.firstName.trim(),

      lastName:
        data.lastName?.trim(),

      email,

      password,
    });
  }

}
