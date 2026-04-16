import { auditLogRepository } from '../repositories/audit-log.repository.js';

export class AuditLogService {
  static async log(
    action: string,
    entity: string,
    entityId: string,
    performedById: string,
    details?: any
  ) {
    try {
      await auditLogRepository.logAction(action, entity, entityId, performedById, details);
    } catch (error) {
      console.error('Failed to create audit log:', error);
      // Never throw — audit logging must not break the main flow
    }
  }
}