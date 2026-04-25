import { describe, expect, it } from 'vitest';
import { safeOrderBy } from '../../utils/pagination';

describe('safeOrderBy', () => {
  it('uses the requested field when it is in the allow-list', () => {
    const orderBy = safeOrderBy(
      { sort: 'updatedAt', order: 'asc' },
      ['id', 'createdAt', 'updatedAt'] as const,
    );
    expect(orderBy).toEqual({ updatedAt: 'asc' });
  });

  it('falls back to createdAt when the sort is not allowed and no explicit fallback', () => {
    const orderBy = safeOrderBy(
      { sort: 'malicious', order: 'desc' },
      ['id', 'createdAt', 'updatedAt'] as const,
    );
    expect(orderBy).toEqual({ createdAt: 'desc' });
  });

  it('uses explicit fallback when the sort is not allowed', () => {
    const orderBy = safeOrderBy(
      { sort: 'noSuchField', order: 'asc' },
      ['id', 'name'] as const,
      'name',
    );
    expect(orderBy).toEqual({ name: 'asc' });
  });

  it('uses the first allow-list field when createdAt is not available and no explicit fallback', () => {
    const orderBy = safeOrderBy(
      { sort: 'x', order: 'desc' },
      ['id', 'name'] as const,
    );
    expect(orderBy).toEqual({ id: 'desc' });
  });
});
