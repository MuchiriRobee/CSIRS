//incident.schema.ts
import { z } from "zod";
import { IncidentCategory, IncidentStatus } from "../types";

export const reportIncidentSchema = z.object({
  category: z.nativeEnum(IncidentCategory),
  location: z.string().min(3, "Location must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  // attachments are handled via multer (optional)
});

// New schema for admin updates (status + notes)
export const updateIncidentSchema = z.object({
  status: z.nativeEnum(IncidentStatus), // ← Now required for updates
  adminNotes: z.string().optional(),
  assignedToId: z.string().uuid().optional(),
});

export const incidentQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(10),
  status: z.nativeEnum(IncidentStatus).optional(),
  category: z.nativeEnum(IncidentCategory).optional(),
  location: z.string().optional(),
});

export const updateReporterIncidentSchema = z.object({
  category: z.nativeEnum(IncidentCategory).optional(),
  location: z.string().min(3, "Location must be at least 3 characters").optional(),
  description: z.string().min(10, "Description must be at least 10 characters").optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: "At least one field must be provided for update",
});

// Export inferred types for frontend/backend usage
export type ReportIncidentInput = z.infer<typeof reportIncidentSchema>;
export type UpdateIncidentInput = z.infer<typeof updateIncidentSchema>;
export type IncidentQueryInput = z.infer<typeof incidentQuerySchema>;
export type UpdateReporterIncidentInput = z.infer<typeof updateReporterIncidentSchema>;