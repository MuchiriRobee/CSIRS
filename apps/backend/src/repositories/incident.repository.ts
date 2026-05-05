// src/repositories/incident.repository.ts
import { BaseRepository } from "./base.repository.js";
import { IncidentCategory, IncidentStatus } from "@csirs/shared/types";
import prisma from "../config/prisma.js";
import { auditLogRepository } from "./audit-log.repository.js";

class IncidentRepository extends BaseRepository<any> {
  constructor() {
    super(prisma.incident);
  }

  async createIncident(data: {
    category: IncidentCategory;
    location: string;
    description: string;
    reporterId?: string;
    attachments?: Array<{
      fileName: string;
      filePath: string;
      mimeType: string;
      size?: number;
    }>;
  }) {
    const incident = await this.model.create({
      data: {
        category: data.category,
        location: data.location,
        description: data.description,
        reporterId: data.reporterId || null,
        status: "PENDING",
      },
      include: { attachments: true },
    });

    // Save attachments if provided
    if (data.attachments && data.attachments.length > 0) {
      await prisma.incidentAttachment.createMany({
        data: data.attachments.map((att) => ({
          incidentId: incident.id,
          fileName: att.fileName,
          filePath: att.filePath,           // Now Cloudinary secure_url
          mimeType: att.mimeType,
          size: att.size,
          uploadedById: data.reporterId || null,
          publicId: (att as any).publicId || null,   // ← Add this line
        })),
      });
    }

    // === FIXED: Only log if there is a real user (skip for anonymous) ===
    if (data.reporterId) {
      await auditLogRepository.logAction(
        "CREATE_INCIDENT",
        "INCIDENT",
        incident.id,
        data.reporterId,
        { category: data.category, location: data.location },
      );
    }

    return incident;
  }

  // Existing methods remain unchanged
  async findWithFilters(query: any) {
    const { page = 1, limit = 10, ...filters } = query;
    const skip = (page - 1) * limit;

    const where = {
      ...(filters.reporterId && { reporterId: filters.reporterId }), // ← Add this line
      ...(filters.status && { status: filters.status }),
      ...(filters.category && { category: filters.category }),
      ...(filters.location && {
        location: { contains: filters.location, mode: "insensitive" },
      }),
    };

    const [data, total] = await Promise.all([
      this.model.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          reporter: { select: { name: true, email: true, phone: true } },
          attachments: true,
        },
      }),
      this.model.count({ where }),
    ]);

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async updateStatus(
    id: string,
    status: IncidentStatus,
    performedById: string,
    adminNotes?: string | undefined, // explicitly allows undefined
    assignedToId?: string | undefined,
  ) {
    const incident = await this.model.update({
      where: { id },
      data: {
        status,
        adminNotes: adminNotes ?? undefined, // safe handling
        assignedToId: assignedToId ?? undefined,
        resolvedAt:
          status === "RESOLVED" || status === "CLOSED" ? new Date() : null,
      },
      include: {
        reporter: true, // ← This was missing
      },
    });
    // Audit log
    await auditLogRepository.logAction(
      "UPDATE_STATUS",
      "INCIDENT",
      id,
      performedById,
      { newStatus: status, adminNotes },
    );

    return incident;
  }

    /**
   * Update incident details by the reporter (basic fields only)
   */
  async updateReporterIncident(
    id: string,
    data: {
      category?: IncidentCategory;
      location?: string;
      description?: string;
    }
  ) {
    return this.model.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
      include: {
        reporter: { select: { name: true, email: true, phone: true } },
        attachments: true,
      },
    });
  }

  // ← Added missing method
  async addComment(incidentId: string, authorId: string, content: string) {
    return prisma.incidentComment.create({
      data: { incidentId, authorId, content },
    });
  }

  /**
   * Fetch all comments for a specific incident with author details
   * Ordered by creation date (newest first)
   */
  async getCommentsByIncidentId(incidentId: string) {
    return prisma.incidentComment.findMany({
      where: { incidentId },
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true, // Ready for future SMS notifications
            role: true,
          },
        },
      },
    });
  }

    /**
   * Fetch full incident details including attachments and comments
   * Used by the frontend IncidentDetailDialog
   */
  async getIncidentById(incidentId: string) {
    return this.model.findUnique({
      where: { id: incidentId },
      include: {
        reporter: { 
          select: { name: true, email: true, phone: true, role: true } 
        },
        attachments: true,           // ← Attachments included
        comments: {
          orderBy: { createdAt: "desc" },
          include: {
            author: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
              },
            },
          },
        },
      },
    });
  }
}

export const incidentRepository = new IncidentRepository();
export default incidentRepository;
