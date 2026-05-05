// src/controllers/incident.controller.ts
import { Request, Response } from 'express';
import { IncidentService } from '../services/incident.service.js'
import { AuditLogService } from '../services/audit-log.service.js';
import { upload } from '../config/multer.js';
import { cloudinary } from '../config/cloudinary.js';
import { ApiSuccess, ApiError, JwtPayload } from '@csirs/shared/types';
import jwt from 'jsonwebtoken';
import env from '../config/index.js';
//import { authenticateJWT, requireReporterOrAdmin } from '../middleware/index.js';

export class IncidentController {
     /**
      * Create incident (anonymous OR logged-in) with optional attachments
      * Now uploads files to Cloudinary
      */
     static create = [
       upload.array('attachment', 5),
       async (req: Request, res: Response) => {
         try {
           let reporterId: string | undefined;

           const authHeader = req.headers.authorization;
           if (authHeader?.startsWith('Bearer ')) {
             try {
               const token = authHeader.split(' ')[1];
               const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
               reporterId = payload.userId;
             } catch (_err) {
               reporterId = undefined;
             }
           }

           const files = (req.files as Express.Multer.File[]) || [];
           const isAnonymous = req.body.isAnonymous === 'true' || req.body.isAnonymous === true;

           // Upload files to Cloudinary
           const attachments = await Promise.all(
             files.map(async (file) => {
               const result = await cloudinary.uploader.upload(
                 `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
                 {
                   folder: 'csirs-incidents',
                   resource_type: 'auto',
                 }
               );

               return {
                 fileName: file.originalname,
                 filePath: result.secure_url,           // ← Cloudinary URL
                 mimeType: file.mimetype,
                 size: file.size,
                 publicId: result.public_id,            // ← For future deletion
               };
             })
           );

           const incident = await IncidentService.createIncident(
             req.body,
             isAnonymous ? undefined : reporterId,
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
       /**
      * Update incident status / notes (Admin only)
      */
     static async update(req: Request, res: Response) {
       try {
         const id = String(req.params.id);                    // ← Fixed: safe cast
         if (!id) {
           return res.status(400).json({ success: false, message: 'Incident ID is required' } as ApiError);
         }

         const incident = await IncidentService.updateIncident(
           id,
           req.body,
           req.user!.userId
         );

         await AuditLogService.log('UPDATE_INCIDENT', 'INCIDENT', id, req.user!.userId, req.body);

         const response: ApiSuccess = {
           success: true,
           message: 'Incident updated successfully',
           data: incident,
         };
         res.status(200).json(response);
       } catch (error: any) {
         const response: ApiError = { success: false, message: error.message };
         res.status(400).json(response);
       }
     }

       /**
   * Reporter updates their own incident
   */
  static async updateOwnIncident(req: Request, res: Response) {
    try {
      const id = String(req.params.id);
      if (!id) {
        return res.status(400).json({ success: false, message: 'Incident ID is required' } as ApiError);
      }

      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Authentication required' } as ApiError);
      }

      const incident = await IncidentService.updateReporterIncident(
        id,
        req.body,
        req.user.userId
      );

      const response: ApiSuccess = {
        success: true,
        message: 'Incident updated successfully',
        data: incident,
      };
      res.status(200).json(response);
    } catch (error: any) {
      const response: ApiError = { success: false, message: error.message };
      res.status(400).json(response);
    }
  }

     /**
      * Add comment to an incident
      */
     static async addComment(req: Request, res: Response) {
       try {
         const id = String(req.params.id);                    // ← Fixed: safe cast
         if (!id) {
           return res.status(400).json({ success: false, message: 'Incident ID is required' } as ApiError);
         }

         const comment = await IncidentService.addComment(
           id,
           req.user!.userId,
           req.body.content
         );

         const response: ApiSuccess = {
           success: true,
           message: 'Comment added successfully',
           data: comment,
         };
         res.status(201).json(response);
       } catch (error: any) {
         const response: ApiError = { success: false, message: error.message };
         res.status(400).json(response);
       }
     }

       /**
   * Get all comments for a specific incident (Admin or Reporter who can access it)
   */
  static async getComments(req: Request, res: Response) {
    try {
      const id = String(req.params.id);
      if (!id) {
        return res.status(400).json({ success: false, message: 'Incident ID is required' } as ApiError);
      }

      const comments = await IncidentService.getIncidentComments(id);

      const response: ApiSuccess = {
        success: true,
        message: 'Incident comments retrieved successfully',
        data: comments,
      };
      res.status(200).json(response);
    } catch (error: any) {
      const response: ApiError = { success: false, message: error.message };
      res.status(400).json(response);
    }
  }

    /**
   * Get full incident details including attachments and comments
   * Used by IncidentDetailDialog
   */
  static async getIncidentDetails(req: Request, res: Response) {
    try {
      const id = String(req.params.id);
      if (!id) {
        return res.status(400).json({ success: false, message: 'Incident ID is required' } as ApiError);
      }

      const incident = await IncidentService.getIncidentDetails(id);

      if (!incident) {
        return res.status(404).json({ success: false, message: 'Incident not found' } as ApiError);
      }

      const response: ApiSuccess = {
        success: true,
        message: 'Incident details retrieved successfully',
        data: incident,
      };
      res.status(200).json(response);
    } catch (error: any) {
      const response: ApiError = { success: false, message: error.message };
      res.status(400).json(response);
    }
  }
}