// Helmet + CORS
import helmet from "helmet";
import cors from "cors";
import env from "../config/index.js";

export const securityMiddleware = [
  helmet({
    contentSecurityPolicy: { directives: { defaultSrc: ["'self'"] } },
    crossOriginEmbedderPolicy: false, // allow modern browsers
  }),
  cors({
    origin:
      env.NODE_ENV === "production"
        ? ["https://your-frontend-domain.com"] // update in Phase 9
        : ["http://localhost:5173", "http://localhost:3000"],
    credentials: true,
  }),
];
