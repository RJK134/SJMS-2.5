// ─── Cursor-based Pagination (Phase 3) ──────────────────────────────────────

export interface CursorPaginationParams {
  cursor?: string;
  limit: number;
  sort: string;
  order: 'asc' | 'desc';
}

export interface CursorPaginatedResponse<T> {
  data: T[];
  pagination: {
    limit: number;
    total: number;
    hasNext: boolean;
    nextCursor: string | null;
  };
}

const DEFAULT_LIMIT = 25;
const MAX_LIMIT = 100;

/**
 * Build a cursor-paginated response from a Prisma result set.
 *
 * Repositories should fetch `limit + 1` rows. If more rows are returned
 * than `limit`, there is a next page — the extra row is trimmed and the
 * last returned row's `id` becomes `nextCursor`.
 */
export function buildCursorPaginatedResponse<T extends { id: string }>(
  items: T[],
  total: number,
  limit: number,
): CursorPaginatedResponse<T> {
  const hasNext = items.length > limit;
  const data = hasNext ? items.slice(0, limit) : items;

  return {
    data,
    pagination: {
      limit,
      total,
      hasNext,
      nextCursor: hasNext ? data[data.length - 1].id : null,
    },
  };
}

/** Clamp a raw limit value to the allowed range. */
export function clampLimit(raw: number | undefined): number {
  if (!raw || raw < 1) return DEFAULT_LIMIT;
  return Math.min(raw, MAX_LIMIT);
}
