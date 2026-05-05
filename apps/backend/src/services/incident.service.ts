// src/services/incident.service.ts
import { incidentRepository } from '../repositories/incident.repository.js';
import { NotificationService } from './notification.service.js';
import { reportIncidentSchema, updateIncidentSchema, incidentQuerySchema, updateReporterIncidentSchema } from '@csirs/shared/schemas';
import { AuditLogService } from './audit-log.service.js';
//import { IncidentCategory, IncidentStatus } from '@csirs/shared/types';

export class IncidentService {
  /**
   * Create new incident (anonymous or logged-in)
   * Supports optional file attachments
   */
  static async createIncident(
    body: any,
    reporterId?: string,
    attachments: Array<{
      fileName: string;
      filePath: string;
      mimeType: string;
      size?: number;
    }> = []
  ) {
    const validated = reportIncidentSchema.parse(body);

    const incident = await incidentRepository.createIncident({
      ...validated,
      reporterId,
      attachments,
    });

    // Send notification to admins
    await NotificationService.sendNewIncidentNotification(incident);

    return incident;
  }

  /**
   * Get all incidents (for admin dashboard)
   */
  static async getAllIncidents(query: any) {
    const validated = incidentQuerySchema.parse(query);
    return incidentRepository.findWithFilters(validated);
  }

/**
 * Get only the reporter's own incidents (My Reports)
 */
static async getMyReports(reporterId: string, query: any) {
  if (!reporterId) {
    throw new Error('Reporter ID is required for My Reports');
  }

  const validated = incidentQuerySchema.parse(query);
  
  const filters = {
    ...validated,
    reporterId,                    // ← This must be enforced
  };

  return incidentRepository.findWithFilters(filters);
}

  /**
   * Update incident status / notes (admin only)
   */
  static async updateIncident(
    id: string,
    data: any,
    performedById: string
  ) {
    const validated = updateIncidentSchema.parse(data);

    const incident = await incidentRepository.updateStatus(
      id,
      validated.status || 'PENDING',
      performedById,
      validated.adminNotes,
      validated.assignedToId      
    );

    // Trigger status update notification to reporter (if logged-in)
       if (validated.status && incident.reporterId) {
         await NotificationService.sendStatusUpdateNotification(incident, validated.status);
       }

    return incident;
  }

    /**
   * Update own incident (Reporter only - ownership enforced)
   */
  static async updateReporterIncident(
    incidentId: string,
    data: any,
    reporterId: string
  ) {
    const validated = updateReporterIncidentSchema.parse(data);

    // Security: Verify reporter owns this incident
    const existingIncident = await incidentRepository.findWithFilters({
      id: incidentId,
      reporterId,
    });

    if (!existingIncident.data || existingIncident.data.length === 0) {
      throw new Error('Incident not found or you do not have permission to edit it');
    }

    const updated = await incidentRepository.updateReporterIncident(incidentId, validated);

    // Audit log
    await AuditLogService.log(
      'UPDATE_INCIDENT_REPORTER',
      'INCIDENT',
      incidentId,
      reporterId,
      { changes: validated }
    );

    return updated;
  }

  /**
   * Add comment to incident (admin or reporter)
   */
  static async addComment(incidentId: string, authorId: string, content: string) {
    const comment = await incidentRepository.addComment(incidentId, authorId, content);

    // Audit log via dedicated service
    await AuditLogService.log(
      'ADD_COMMENT',
      'INCIDENT',
      incidentId,
      authorId,
      { content: content.substring(0, 100) }
    );

    return comment;
  }

    /**
   * Get all comments for an incident
   */
  static async getIncidentComments(incidentId: string) {
    // Optional: You can add extra validation here if needed
    if (!incidentId) {
      throw new Error('Incident ID is required');
    }

    return incidentRepository.getCommentsByIncidentId(incidentId);
  }

    /**
   * Get full incident details with attachments and comments
   */
  static async getIncidentDetails(incidentId: string) {
    if (!incidentId) {
      throw new Error('Incident ID is required');
    }

    return incidentRepository.getIncidentById(incidentId);
  }
}