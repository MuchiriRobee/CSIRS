import { Request, Response, NextFunction } from "express";
import { ApiError } from "@csirs/shared/types";

export const notFoundHandler = (
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const error: ApiError = {
    success: false,
    message: `Route not found: ${req.originalUrl}`,
  };
  res.status(404).json(error);
};
