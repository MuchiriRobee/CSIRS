import { z } from "zod";
import { IncidentStatus, IncidentCategory } from "../types";

export const idSchema = z.object({
  id: z.string().uuid(),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(10),
});

export const queryFilterSchema = z.object({
  status: z.nativeEnum(IncidentStatus).optional(),
  category: z.nativeEnum(IncidentCategory).optional(),
  location: z.string().optional(),
  fromDate: z.string().datetime().optional(),
  toDate: z.string().datetime().optional(),
});
