import { Request, Response, NextFunction } from "express";
import { ZodError, type ZodTypeAny } from "zod";

function formatZodErrors(error: ZodError): Record<string, string[]> {
  const formatted: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const path = issue.path.join(".") || "_root";
    if (!formatted[path]) {
      formatted[path] = [];
    }
    formatted[path].push(issue.message);
  }
  return formatted;
}

export function validate<TSchema extends ZodTypeAny>(schema: TSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({
        status: "error",
        code: "VALIDATION_ERROR",
        message: "Request body validation failed",
        errors: formatZodErrors(result.error),
      });
      return;
    }
    req.body = result.data as Request['body'];
    next();
  };
}

export function validateParams<TSchema extends ZodTypeAny>(schema: TSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.params);
    if (!result.success) {
      res.status(400).json({
        status: "error",
        code: "VALIDATION_ERROR",
        message: "URL parameter validation failed",
        errors: formatZodErrors(result.error),
      });
      return;
    }
    req.params = result.data as Request['params'];
    next();
  };
}

export function validateQuery<TSchema extends ZodTypeAny>(schema: TSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      res.status(400).json({
        status: "error",
        code: "VALIDATION_ERROR",
        message: "Query parameter validation failed",
        errors: formatZodErrors(result.error),
      });
      return;
    }
    req.query = result.data as Request['query'];
    next();
  };
}
