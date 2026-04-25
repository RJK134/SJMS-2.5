import { describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { validate, validateParams, validateQuery } from '../../middleware/validate';

function responseStub() {
  return {
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
  };
}

describe('validate middleware', () => {
  it('replaces Express 5 getter-backed query values with parsed query data', () => {
    const req = {} as any;
    Object.defineProperty(req, 'query', {
      get: () => ({ limit: '2' }),
      enumerable: true,
      configurable: true,
    });
    const res = responseStub() as any;
    const next = vi.fn();

    validateQuery(z.object({ limit: z.coerce.number() }))(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req.query).toEqual({ limit: 2 });
  });

  it('replaces parsed body and params without relying on direct assignment', () => {
    const bodyReq = { body: { count: '3' } } as any;
    const paramsReq = { params: { id: '123' } } as any;
    const res = responseStub() as any;
    const next = vi.fn();

    validate(z.object({ count: z.coerce.number() }))(bodyReq, res, next);
    validateParams(z.object({ id: z.string() }))(paramsReq, res, next);

    expect(bodyReq.body).toEqual({ count: 3 });
    expect(paramsReq.params).toEqual({ id: '123' });
    expect(next).toHaveBeenCalledTimes(2);
  });
});
