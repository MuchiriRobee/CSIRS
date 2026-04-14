import { Request, Response, NextFunction } from "express";
import { isDev } from "../config/index.js";
import { ApiError } from "@csirs/shared/types";

export const errorHandler = (
  err: unknown, // ← Changed from 'any'
  req: Request,
  res: Response,
  _next: NextFunction, // ← Prefixed with _ to satisfy ESLint
) => {
  const statusCode = (err as any).statusCode || 500;
  const message = (err as Error).message || "Internal Server Error";

  const errorResponse: ApiError = {
    success: false,
    message,
    ...(isDev && {
      stack: (err as Error).stack,
      errors: (err as any).errors,
    }),
  };

  console.error(err); // Winston will also log this

  res.status(statusCode).json(errorResponse);
};
