import { Request, Response, NextFunction } from "express";
import { AppError, ValidationError } from "../utils/errors";
import logger from "../utils/logger";

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Prisma known errors
  if (err.constructor.name === "PrismaClientKnownRequestError") {
    const prismaErr = err as Error & { code: string; meta?: Record<string, unknown> };
    if (prismaErr.code === "P2002") {
      res.status(409).json({
        status: "error",
        code: "CONFLICT",
        message: "A record with this value already exists",
        meta: prismaErr.meta,
      });
      return;
    }
    if (prismaErr.code === "P2025") {
      res.status(404).json({
        status: "error",
        code: "NOT_FOUND",
        message: "Record not found",
      });
      return;
    }
  }

  // Validation errors with field details
  if (err instanceof ValidationError) {
    res.status(err.statusCode).json({
      status: "error",
      code: err.code,
      message: err.message,
      errors: err.errors,
    });
    return;
  }

  // Known operational errors
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      status: "error",
      code: err.code,
      message: err.message,
    });
    return;
  }

  // Unexpected errors
  logger.error("Unhandled error", {
    error: err.message,
    stack: err.stack,
  });

  res.status(500).json({
    status: "error",
    code: "INTERNAL_ERROR",
    message:
      process.env.NODE_ENV === "production"
        ? "An unexpected error occurred"
        : err.message,
  });
}
