import { Router } from 'express';
import { HealthController } from '../controllers/health.controller.js';
import { AuthController } from '../controllers/auth.controller.js';
import { IncidentController } from '../controllers/incident.controller.js';
import { authenticateJWT, requireAdmin, requireReporterOrAdmin, reportRateLimiter } from '../middleware/index.js';

const router = Router();

// ======================
// PUBLIC ROUTES (no authentication required)
// ======================
router.get('/health', HealthController.getHealth);

// Anonymous + optional logged-in reporting (with optional file attachments)
router.post('/incidents', reportRateLimiter, IncidentController.create);

// Auth routes
router.post('/auth/register', AuthController.register);
router.post('/auth/login', AuthController.login);
router.post('/auth/refresh', AuthController.refresh);

// ======================
// PROTECTED ROUTES (require JWT)
// ======================

// Admin: View all incidents
router.get('/incidents', authenticateJWT, requireAdmin, IncidentController.getAll);

// Reporter (or Admin): View own reports
router.get('/my-reports', authenticateJWT, requireReporterOrAdmin, IncidentController.getMyReports);

// Admin: Update incident status / notes
router.put('/incidents/:id', authenticateJWT, requireAdmin, IncidentController.update); // we'll add this method next if needed

// Admin / Reporter: Add comment to incident
router.post('/incidents/:id/comments', authenticateJWT, requireReporterOrAdmin, IncidentController.addComment);

export default router;