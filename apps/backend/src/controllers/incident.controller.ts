import { Request, Response } from 'express';
import { IncidentService } from '../services/incident.service.js';
import { upload } from '../config/multer.js';
import { ApiSuccess, ApiError } from '@csirs/shared/types';
//import { authenticateJWT, requireReporterOrAdmin } from '../middleware/index.js';

export class IncidentController {
  /**
   * Create incident (anonymous or logged-in) with optional attachments
   */
  static create = [
    upload.array('attachments', 5), // max 5 files, optional
    async (req: Request, res: Response) => {
      try {
        const files = (req.files as Express.Multer.File[]) || [];

        const attachments = files.map((file) => ({
          fileName: file.originalname,
          filePath: file.path,
          mimeType: file.mimetype,
          size: file.size,
        }));

        const incident = await IncidentService.createIncident(
          req.body,
          req.user?.userId, // will be undefined for anonymous
          attachments
        );

        const response: ApiSuccess = {
          success: true,
          message: 'Incident reported successfully',
          data: incident,
        };
        res.status(201).json(response);
      } catch (error: any) {
        const response: ApiError = { success: false, message: error.message };
        res.status(400).json(response);
      }
    },
  ];

  /**
   * Get all incidents (Admin only)
   */
  static async getAll(req: Request, res: Response) {
    try {
      const result = await IncidentService.getAllIncidents(req.query);
      const response: ApiSuccess = { success: true, data: result };
      res.status(200).json(response);
    } catch (error: any) {
      const response: ApiError = { success: false, message: error.message };
      res.status(400).json(response);
    }
  }

  /**
   * Get My Reports (logged-in reporter only)
   */
  static async getMyReports(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Authentication required' } as ApiError);
      }

      const result = await IncidentService.getMyReports(req.user.userId, req.query);
      const response: ApiSuccess = { success: true, data: result };
      res.status(200).json(response);
    } catch (error: any) {
      const response: ApiError = { success: false, message: error.message };
      res.status(400).json(response);
    }
  }
}