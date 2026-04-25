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

/**
 * Build a Prisma `orderBy` clause from user-controlled pagination params,
 * validating the sort field against an allow-list to prevent
 * remote-property-injection (CodeQL js/remote-property-injection).
 *
 * Always pass a literal tuple of allowed field names. If the user's
 * `sort` is not in the allow-list, falls back to the supplied default
 * (or the first allowed field).
 *
 * @example
 *   orderBy: safeOrderBy(pagination, ['createdAt', 'updatedAt', 'blockName'], 'createdAt')
 */
export function safeOrderBy<T extends string>(
  pagination: Pick<CursorPaginationParams, 'sort' | 'order'>,
  allowed: readonly T[],
  fallback?: T,
): Record<T, 'asc' | 'desc'> {
  const allowedList = allowed as readonly string[];
  const candidate = pagination.sort as T;
  /** Matches typical API default sort=createdAt when the client omits or spoofs the field. */
  const defaultWhenUnrecognised = (allowedList.find((f) => f === 'createdAt') ??
    allowed[0]) as T;
  const field: T = allowedList.includes(candidate)
    ? candidate
    : fallback !== undefined
      ? fallback
      : defaultWhenUnrecognised;
  return { [field]: pagination.order } as Record<T, 'asc' | 'desc'>;
}
