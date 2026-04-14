// Morgan + Winston
import morgan from "morgan";
import winston from "winston";
import env from "../config/index.js";

// Winston logger (structured JSON logs)
export const logger = winston.createLogger({
  level: env.NODE_ENV === "production" ? "info" : "debug",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
  ),
  transports: [
    new winston.transports.Console(),
    // In production you can add file transport here
  ],
});

// Morgan middleware for HTTP request logging
export const httpLogger = morgan(
  env.NODE_ENV === "production" ? "combined" : "dev",
  {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  },
);
