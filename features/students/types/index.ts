import { z } from "zod";
import { createStudentSchema } from "../schemas/create-student.schema";
import { Prisma } from "@prisma/client";

export type CreateStudentData =
  z.infer<typeof createStudentSchema>;

export type StudentTableItem = {
  id: string;
  studentId: string;
  firstName: string;
  lastName: string | null;
  phone: string | null;
  status: string;
};


export type StudentDetails = Prisma.StudentGetPayload<{
  include: {
    organization: true;
    branch: true;
    user: true;
  };
}>;