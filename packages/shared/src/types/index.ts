// =============================================
// Shared Types & Runtime Enums (for Zod)
// =============================================

export const UserRole = {
  REPORTER: "REPORTER",
  ADMIN: "ADMIN",
} as const;
export type UserRole = keyof typeof UserRole;

export const IncidentStatus = {
  PENDING: "PENDING",
  IN_PROGRESS: "IN_PROGRESS",
  RESOLVED: "RESOLVED",
  CLOSED: "CLOSED",
} as const;
export type IncidentStatus = keyof typeof IncidentStatus;

export const IncidentCategory = {
  THEFT: "THEFT",
  PHYSICAL_ASSAULT: "PHYSICAL_ASSAULT",
  SEXUAL_HARASSMENT: "SEXUAL_HARASSMENT",
  FIRE_OUTBREAK: "FIRE_OUTBREAK",
  MEDICAL_EMERGENCY: "MEDICAL_EMERGENCY",
  PROPERTY_DAMAGE: "PROPERTY_DAMAGE",
  CYBER_BULLYING: "CYBER_BULLYING",
  INFRASTRUCTURE_ISSUE: "INFRASTRUCTURE_ISSUE",
  OTHER: "OTHER",
} as const;
export type IncidentCategory = keyof typeof IncidentCategory;

export interface ApiSuccess<T = any> {
  success: true;
  message?: string;
  data: T;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: any;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// =============================================
// JWT Payload (used in auth middleware)
// =============================================
export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

// Re-export input types from schemas for clean imports
export type { RegisterInput, LoginInput } from '../schemas/user.schema';