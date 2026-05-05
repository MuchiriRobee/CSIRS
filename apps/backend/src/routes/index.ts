import { Router } from "express";
import { HealthController } from "../controllers/health.controller.js";
import { AuthController } from "../controllers/auth.controller.js";
import { IncidentController } from "../controllers/incident.controller.js";
import { UserController } from "../controllers/user.controller.js";
import { AuditLogController } from "../controllers/audit-log.controller.js";
import {
  authenticateJWT,
  requireAdmin,
  requireReporterOrAdmin,
  reportRateLimiter,
} from "../middleware/index.js";

const router = Router();

// ======================
// PUBLIC ROUTES (no authentication required)
// ======================
router.get("/health", HealthController.getHealth);

// Anonymous + optional logged-in reporting (with optional file attachments)
router.post("/incidents", IncidentController.create); // add reportRateLimiter, later after testing

// Auth routes
router.post("/auth/register", AuthController.register);
router.post("/auth/login", AuthController.login);
router.post("/auth/refresh", AuthController.refresh);

// ======================
// PROTECTED ROUTES (require JWT)
// ======================

// Admin: View all incidents
router.get(
  "/incidents",
  authenticateJWT,
  requireAdmin,
  IncidentController.getAll,
);

// Get full incident details (with attachments + comments)
router.get(
  "/incidents/:id",
  authenticateJWT,
  requireReporterOrAdmin,
  IncidentController.getIncidentDetails,
);

// Reporter (or Admin): View own reports
router.get(
  "/my-reports",
  authenticateJWT,
  requireReporterOrAdmin,
  IncidentController.getMyReports,
);

// Reporter: Update their own incident
router.patch(
  "/my-reports/:id",
  authenticateJWT,
  requireReporterOrAdmin,
  IncidentController.updateOwnIncident,
);

// Admin: Update incident status / notes
router.put(
  "/incidents/:id",
  authenticateJWT,
  requireAdmin,
  IncidentController.update,
); // we'll add this method next if needed

// Admin / Reporter: Add comment to incident
router.post(
  "/incidents/:id/comments",
  authenticateJWT,
  requireReporterOrAdmin,
  IncidentController.addComment,
);

// Admin / Reporter: Get all comments for an incident
router.get(
  "/incidents/:id/comments",
  authenticateJWT,
  requireReporterOrAdmin,
  IncidentController.getComments,
);

// ==================== NEW USER MANAGEMENT ROUTES (Admin Only) ====================
router.get("/users", authenticateJWT, requireAdmin, UserController.getAllUsers);
router.patch(
  "/users/:id/role",
  authenticateJWT,
  requireAdmin,
  UserController.updateUserRole,
);
// Fetchning audit logs
router.get("/audit-logs", authenticateJWT, requireAdmin, AuditLogController.getAllLogs);
router.get("/audit-logs/:id", authenticateJWT, requireAdmin, AuditLogController.getLogById);

// Profile & Password management (authenticated users)
router.patch("/auth/profile", authenticateJWT, UserController.updateProfile);
router.post(
  "/auth/change-password",
  authenticateJWT,
  UserController.changePassword,
);
export default router;
