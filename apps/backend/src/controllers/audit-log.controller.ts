import { Request, Response } from "express";
import { AuditLogService } from "../services/audit-log.service.js";
type Params = {
  id: string;
};
export class AuditLogController {
  
  static async getAllLogs(req: Request, res: Response) {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;

      const logs = await AuditLogService.getAllLogs(page, limit);

      return res.status(200).json({
        success: true,
        ...logs,
      });
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch audit logs",
      });
    }
  }

  static async getLogById(req: Request<Params>, res: Response) {
    try {
      const { id } = req.params;

      const log = await AuditLogService.getLogById(id);

      if (!log) {
        return res.status(404).json({
          success: false,
          message: "Log not found",
        });
      }

      return res.status(200).json({
        success: true,
        data: log,
      });
    } catch (error) {
      console.error("Error fetching audit log:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch audit log",
      });
    }
  }
}