import rateLimit from "express-rate-limit";
import env from "../config/index.js";

export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: env.NODE_ENV === "production" ? 100 : 500,
  message: {
    success: false,
    message: "Too many requests, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter limiter for anonymous incident reporting (core proposal requirement)
export const reportRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // max 5 anonymous reports per hour per IP
  message: {
    success: false,
    message: "Too many incident reports. Please wait before submitting again.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
