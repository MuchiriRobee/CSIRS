import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service.js';
import { ApiSuccess, ApiError } from '@csirs/shared/types';

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const result = await AuthService.register(req.body);

      // Set refresh token as httpOnly secure cookie
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      const response: ApiSuccess = {
        success: true,
        message: 'User registered successfully',
        data: {
          user: result.user,
          accessToken: result.accessToken,
        },
      };

      res.status(201).json(response);
    } catch (error: any) {
      const response: ApiError = { success: false, message: error.message };
      res.status(400).json(response);
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const result = await AuthService.login(req.body);

      // Set refresh token as httpOnly secure cookie
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      const response: ApiSuccess = {
        success: true,
        message: 'Login successful',
        data: {
          user: result.user,
          accessToken: result.accessToken,
        },
      };

      res.status(200).json(response);
    } catch (error: any) {
      const response: ApiError = { success: false, message: error.message };
      res.status(401).json(response);
    }
  }

       static async refresh(req: Request, res: Response) {
       try {
         const refreshToken = req.cookies.refreshToken;
         if (!refreshToken) {
           return res.status(401).json({ success: false, message: 'Refresh token required' } as ApiError);
         }

         const result = await AuthService.refreshToken(refreshToken);

         const response: ApiSuccess = {
           success: true,
           message: 'Token refreshed',
           data: { accessToken: result.accessToken },
         };

         res.status(200).json(response);
       } catch (error: any) {
         const response: ApiError = { success: false, message: error.message };
         res.status(401).json(response);
       }
     }
}