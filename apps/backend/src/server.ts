// Main express setup
import express from 'express';
import env from './config/index.js';
// import { isDev } from './config/index.js';

import prisma from './config/prisma.js';
import router from './routes/index.js';
import {
  securityMiddleware,
  globalRateLimiter,
  httpLogger,
  errorHandler,
  notFoundHandler,
} from './middleware/index.js';

const app = express();

// ======================
// MIDDLEWARE (order matters!)
// ======================
app.use(...securityMiddleware);           // Helmet + CORS
app.use(globalRateLimiter);               // Global rate limit
app.use(httpLogger);                      // Request logging
app.use(express.json({ limit: '10mb' })); // JSON body parser
app.use(express.urlencoded({ extended: true }));

// ======================
// ROUTES
// ======================
app.use('/api', router);

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
  console.log('\n⏳ Shutting down gracefully...');
  await prisma.$disconnect();
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

export default app;