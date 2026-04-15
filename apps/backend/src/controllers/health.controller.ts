import { Request, Response } from 'express';
import { ApiSuccess } from '@csirs/shared/types';

export class HealthController {
  static getHealth(req: Request, res: Response) {
    const response: ApiSuccess = {
      success: true,
      message: 'CSIRS Backend is healthy ✅',
      data: {
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        uptime: process.uptime(),
      },
    };
    res.status(200).json(response);
  }
}