import { z } from "zod";

export const aiEarlyInterventionSchema = z.object({
  summary: z.string().min(1),

  primaryConcern: z.string().min(1),

  recommendedIntervention: z.string().min(1),

  urgency: z.enum([
    "LOW",
    "MEDIUM",
    "HIGH",
    "URGENT",
  ]),
});
