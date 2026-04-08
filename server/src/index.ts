import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { errorHandler } from "./middleware/error-handler";
import { apiLimiter, authLimiter } from "./middleware/rate-limit";
import logger from "./utils/logger";

const app = express();
const PORT = parseInt(process.env.PORT || "3001", 10);

// ── Core middleware ──────────────────────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: process.env.NODE_ENV === "production"
      ? [process.env.API_BASE_URL || "http://localhost:3001"]
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

// ── Rate limiting ────────────────────────────────────────────────────────
app.use('/api', apiLimiter);
app.use('/api/v1/auth', authLimiter);

// ── Health check ─────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    version: "2.5.0",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// ── API v1 router mount ─────────────────────────────────────────────────
// Routes will be mounted here as modules are built:
// import { router as v1Router } from "./routes";
// app.use("/api/v1", v1Router);

// Placeholder v1 router
import { Router } from "express";
const v1Router = Router();
v1Router.get("/", (_req, res) => {
  res.json({
    message: "SJMS 2.5 API v1",
    docs: "/api/v1/docs",
  });
});
app.use("/api/v1", v1Router);

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
