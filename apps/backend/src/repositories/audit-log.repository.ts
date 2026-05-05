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

  async findAllLogs(page = 1, limit = 10) {
  const skip = (page - 1) * limit;

  const [logs, total] = await Promise.all([
    this.model.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    this.model.count(),
  ]);

  return {
    data: logs,
    meta: {
      total,
      page,
      lastPage: Math.ceil(total / limit),
    },
  };
}

async findLogById(id: string) {
  return this.model.findUnique({
    where: { id },
  });
}
}

export const auditLogRepository = new AuditLogRepository();
export default auditLogRepository;