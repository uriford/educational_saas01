import { z } from "zod";
import { loginSchema } from "./schemas/login.schema";

export type LoginFormData = z.infer<typeof loginSchema>;