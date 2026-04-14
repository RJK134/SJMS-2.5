import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { errorHandler } from "./middleware/error-handler";
import { apiLimiter, authLimiter } from "./middleware/rate-limit";
import { apiV1Router } from "./api";
import swaggerUi from "swagger-ui-express";
import { openApiSpec } from "./utils/openapi";
import logger from "./utils/logger";
import { register, httpRequestDuration, httpRequestTotal } from "./utils/metrics";

const app = express();
const PORT = parseInt(process.env.PORT || "3001", 10);

// ── Core middleware ──────────────────────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: process.env.NODE_ENV === "production"
      ? (process.env.CORS_ORIGIN?.split(",") ?? ["http://localhost:5173"])
      : true,
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(
  morgan("short", {
    stream: { write: (msg: string) => logger.info(msg.trim()) },
  })
);

// ── Prometheus metrics ──────────────────────────────────────────────────
app.use((req, res, next) => {
  const end = httpRequestDuration.startTimer();
  res.on('finish', () => {
    const route = req.route?.path ?? req.path;
    end({ method: req.method, route, status_code: res.statusCode });
    httpRequestTotal.inc({ method: req.method, route, status_code: res.statusCode });
  });
  next();
});

app.get('/metrics', async (_req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// ── Rate limiting ────────────────────────────────────────────────────────
app.use('/api', apiLimiter);
app.use('/api/v1/auth', authLimiter);

// ── API Documentation (Swagger UI) ──────────────────────────────────────
app.get("/api/docs/spec", (_req, res) => res.json(openApiSpec));
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(openApiSpec, {
  customSiteTitle: "SJMS 2.5 API Documentation",
}));

// ── Health check ─────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    version: "2.5.0",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// ── API v1 router mount (37 domain modules) ────────────────────────────
app.use("/api/v1", apiV1Router);

// ── Global error handler (must be last) ─────────────────────────────────
app.use(errorHandler);

// ── Start server ─────────────────────────────────────────────────────────
const server = app.listen(PORT, () => {
  logger.info(`SJMS 2.5 API server running on port ${PORT}`);
  logger.info(`Health check: http://localhost:${PORT}/api/health`);
  logger.info(`Environment: ${process.env.NODE_ENV || "development"}`);
});

// ── Graceful shutdown ────────────────────────────────────────────────────
function gracefulShutdown(signal: string) {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);
  server.close(() => {
    logger.info("HTTP server closed");
    process.exit(0);
  });

  // Force exit after 10s
  setTimeout(() => {
    logger.error("Forced shutdown after timeout");
    process.exit(1);
  }, 10_000);
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

export default app;
