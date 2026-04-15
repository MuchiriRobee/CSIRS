import { BaseRepository } from './base.repository.js';
import prisma from '../config/prisma.js';

class AuditLogRepository extends BaseRepository<any> {
  constructor() {
    super(prisma.auditLog); // Note: model name is audit_logs in DB, but Prisma uses camelCase
  }

  async logAction(
    action: string,
    entity: string,
    entityId: string,
    performedById: string,
    details?: any
  ) {
    return this.model.create({
      data: {
        action,
        entity,
        entityId,
        performedById,
        details: details ? JSON.stringify(details) : null,
      },
    });
  }
}

export const auditLogRepository = new AuditLogRepository();
export default auditLogRepository;