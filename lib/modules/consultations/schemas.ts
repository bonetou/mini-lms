import { z } from "zod";
import { isValidDateValue } from "@/lib/dates";

const consultationStatusSchema = z.enum([
  "SCHEDULED",
  "RESCHEDULED",
  "CANCELLED",
  "COMPLETED",
]);

const optionalIntSchema = z
  .string()
  .optional()
  .transform((value) => (value ? Number(value) : undefined))
  .pipe(z.number().int().positive().optional());

const optionalDateTimeSchema = z
  .string()
  .optional()
  .refine((value) => !value || isValidDateValue(value), {
    message: "Invalid datetime value",
  });

const optionalSearchSchema = z
  .string()
  .optional()
  .transform((value) => value?.trim() || undefined);

export const consultationParamsSchema = z.object({
  id: z.uuid(),
});

export const consultationListQuerySchema = z.object({
  scope: z.enum(["own", "all"]).optional().default("own"),
  status: consultationStatusSchema.optional(),
  studentId: z.uuid().optional(),
  scheduledFrom: optionalDateTimeSchema,
  scheduledTo: optionalDateTimeSchema,
  page: optionalIntSchema.default(1),
  pageSize: optionalIntSchema.default(10),
});

export const adminConsultationListQuerySchema = z.object({
  status: consultationStatusSchema.optional(),
  studentId: z.uuid().optional(),
  search: optionalSearchSchema,
  scheduledFrom: optionalDateTimeSchema,
  scheduledTo: optionalDateTimeSchema,
  page: optionalIntSchema.default(1),
  pageSize: optionalIntSchema.default(10),
});

export const createConsultationBodySchema = z.object({
  reason: z.string().trim().min(1).max(1_000),
  scheduledAt: z.string().datetime(),
});

export const patchConsultationBodySchema = z
  .object({
    reason: z.string().trim().min(1).max(1_000).optional(),
    scheduledAt: z.string().datetime().optional(),
  })
  .refine((value) => value.reason !== undefined || value.scheduledAt !== undefined, {
    message: "At least one field must be provided",
  });

export const rescheduleConsultationBodySchema = z.object({
  scheduledAt: z.string().datetime(),
});

export const cancelConsultationBodySchema = z.object({
  cancellationReason: z.string().trim().min(1).max(1_000).optional(),
});

export const toggleCompleteBodySchema = z.object({
  isCompleted: z.boolean(),
});

export type ConsultationStatus = z.infer<typeof consultationStatusSchema>;
export type ConsultationListQuery = z.infer<typeof consultationListQuerySchema>;
export type AdminConsultationListQuery = z.infer<
  typeof adminConsultationListQuerySchema
>;
