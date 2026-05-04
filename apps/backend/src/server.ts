// Main express setup
import express from "express";
import cors from "cors";
import env from "./config/index.js";
import { fileURLToPath } from 'url';
import path from 'path';
import prisma from "./config/prisma.js";
import router from "./routes/index.js";
import {
  securityMiddleware,
  globalRateLimiter,
  httpLogger,
  errorHandler,
  notFoundHandler,
} from "./middleware/index.js";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const allowedOrigins = [
  process.env.FRONTEND_URL, // Production URL from Render env
  "http://localhost:5173", // Local Vite dev server
].filter(Boolean) as string[]; // Removes undefined if FRONTEND_URL isn't set

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl)
      // or if the origin is in our allowed list
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use('/uploads', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(path.join(__dirname, '../uploads')));

// ======================
// MIDDLEWARE (order matters!)
// ======================
app.use(...securityMiddleware); // Helmet + CORS
app.use(globalRateLimiter); // Global rate limit
app.use(httpLogger); // Request logging
app.use(express.json({ limit: "10mb" })); // JSON body parser
app.use(express.urlencoded({ extended: true }));
// ======================
// ROUTES
// ======================
app.use("/api", router);

// ======================
// ERROR HANDLING (must be last)
// ======================
app.use(notFoundHandler);
app.use(errorHandler);

// ======================
// START SERVER
// ======================
const server = app.listen(env.PORT, () => {
  console.log(`🚀 CSIRS Backend running on http://localhost:${env.PORT}`);
  console.log(`📊 Environment: ${env.NODE_ENV}`);
  console.log(`🔗 Health check: http://localhost:${env.PORT}/api/health`);
});

// Graceful shutdown
const gracefulShutdown = async () => {
  console.log("\n⏳ Shutting down gracefully...");
  await prisma.$disconnect();
  server.close(() => {
    console.log("✅ Server closed");
    process.exit(0);
  });
};

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);

export default app;
