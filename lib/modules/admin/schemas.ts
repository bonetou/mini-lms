import { z } from "zod";
import { adminConsultationListQuerySchema } from "@/lib/modules/consultations/schemas";

const optionalIntSchema = z
  .string()
  .optional()
  .transform((value) => (value ? Number(value) : undefined))
  .pipe(z.number().int().positive().optional());

export const adminConsultationParamsSchema = z.object({
  id: z.uuid(),
});

export const adminUserParamsSchema = z.object({
  id: z.uuid(),
});

export const adminUsersListQuerySchema = z.object({
  page: optionalIntSchema.default(1),
  pageSize: optionalIntSchema.default(10),
});

export { adminConsultationListQuerySchema };
