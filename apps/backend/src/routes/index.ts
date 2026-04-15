import { Router } from 'express';
import { HealthController } from '../controllers/health.controller.js';
import { AuthController } from '../controllers/auth.controller.js';
import { IncidentController } from '../controllers/incident.controller.js';
import { authenticateJWT, requireAdmin, requireReporterOrAdmin, reportRateLimiter } from '../middleware/index.js';

const router = Router();

// ======================
// PUBLIC ROUTES (no auth required)
// ======================
router.get('/health', HealthController.getHealth);

// Anonymous + logged-in reporting (core proposal feature)
router.post('/incidents', reportRateLimiter, IncidentController.create);

// Auth (public)
router.post('/auth/register', AuthController.register);
router.post('/auth/login', AuthController.login);
router.post('/auth/refresh', AuthController.refresh);

// ======================
// PROTECTED ROUTES (require JWT + role)
// ======================
router.get('/incidents', authenticateJWT, requireAdmin, IncidentController.getAll);

// Future: My Reports for logged-in reporters
router.get('/my-reports', authenticateJWT, requireReporterOrAdmin, IncidentController.getMyReports);

export default router;