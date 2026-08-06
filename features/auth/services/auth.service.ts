import "server-only";

import bcrypt from "bcrypt";
import { AuthRepository } from "../repository/auth.repository";
import type { LoginFormData } from "../types";
import type { User } from "@prisma/client";


type LoginResponse =
  | {
      success: true;
      message: string;
      user: User;
    }
  | {
      success: false;
      message: string;
    };


export class AuthService {

  static async login(
    data: LoginFormData
  ): Promise<LoginResponse> {

    const user =
      await AuthRepository.findUserByEmail(data.email);


    if (!user) {
      return {
        success: false,
        message: "Invalid email or password",
      };
    }


    const isPasswordCorrect =
      await bcrypt.compare(
        data.password,
        user.password
      );


    if (!isPasswordCorrect) {
      return {
        success: false,
        message: "Invalid email or password",
      };
    }


    await AuthRepository.updateLastLogin(user.id);


    return {
      success: true,
      message: "Login successful",
      user,
    };
  }
}