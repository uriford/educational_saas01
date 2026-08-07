import { Prisma } from "@prisma/client";

import type { z } from "zod";
import type { createTeacherSchema } from "../schemas/create-teacher.schema";

export type CreateTeacherData =
  z.infer<typeof createTeacherSchema>;

export type CreateTeacherRepositoryData =
  CreateTeacherData & {
    teacherId: string;
  };

export type TeacherTableItem = {
  id: string;
  teacherId: string;
  firstName: string;
  lastName: string | null;
  phone: string | null;
  designation: string | null;
  status: string;
};

export type TeacherDetails =
  Prisma.TeacherGetPayload<{
    include: {
      organization: true;
      branch: true;
    };
  }>;   