import { Request } from "express";

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
  sort: string;
  order: "asc" | "desc";
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 25;
const MAX_LIMIT = 100;

export function parsePagination(req: Request): PaginationParams {
  const page = Math.max(1, parseInt(req.query.page as string, 10) || DEFAULT_PAGE);
  const rawLimit = parseInt(req.query.limit as string, 10) || DEFAULT_LIMIT;
  const limit = Math.min(Math.max(1, rawLimit), MAX_LIMIT);
  const sort = (req.query.sort as string) || "createdAt";
  const order = (req.query.order as string)?.toLowerCase() === "asc" ? "asc" : "desc";
  const skip = (page - 1) * limit;

  return { page, limit, skip, sort, order };
}

export function buildPaginatedResponse<T>(
  data: T[],
  total: number,
  params: PaginationParams
): PaginatedResponse<T> {
  const totalPages = Math.ceil(total / params.limit);

  return {
    data,
    pagination: {
      page: params.page,
      limit: params.limit,
      total,
      totalPages,
      hasNext: params.page < totalPages,
      hasPrev: params.page > 1,
    },
  };
}
