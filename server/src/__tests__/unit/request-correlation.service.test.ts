import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../utils/prisma', () => ({
  default: {
    auditLog: { create: vi.fn() },
  },
}));

vi.mock('../../utils/logger', () => ({
  default: {
    debug: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  },
}));

import prisma from '../../utils/prisma';
import { logAudit } from '../../utils/audit';
import { requestId as requestIdMiddleware } from '../../middleware/request-id';
import { getRequestId, runWithRequestContext } from '../../utils/request-context';
import { emitEvent } from '../../utils/webhooks';

const mockedPrisma = prisma as {
  auditLog: {
    create: ReturnType<typeof vi.fn>;
  };
};

describe('request correlation hardening', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.unstubAllGlobals();
  });

  it('binds the request ID into async context in the request-id middleware', () => {
    const req = {
      get: vi.fn().mockReturnValue(undefined),
    } as any;
    const res = {
      setHeader: vi.fn(),
    } as any;

    let seenRequestId: string | undefined;

    requestIdMiddleware(req, res, () => {
      seenRequestId = getRequestId();
    });

    expect(req.requestId).toBeDefined();
    expect(res.setHeader).toHaveBeenCalledWith('x-request-id', req.requestId);
    expect(seenRequestId).toBe(req.requestId);
  });

  it('adds request metadata to audit JSON payloads without changing the Prisma schema', async () => {
    await runWithRequestContext({ requestId: 'req-audit-1' }, async () => {
      await logAudit(
        'Student',
        'stu-1',
        'CREATE',
        'user-1',
        null,
        { status: 'ACTIVE' },
      );
    });

    expect(mockedPrisma.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        entityType: 'Student',
        entityId: 'stu-1',
        newData: {
          status: 'ACTIVE',
          _meta: { requestId: 'req-audit-1' },
        },
      }),
    });
  });

  it('propagates the request ID into outbound webhook payloads and headers', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      body: { cancel: vi.fn() },
    });
    vi.stubGlobal('fetch', fetchMock);

    await runWithRequestContext({ requestId: 'req-webhook-1' }, async () => {
      emitEvent({
        event: 'student.updated',
        entityType: 'Student',
        entityId: 'stu-1',
        actorId: 'user-1',
        data: { studentId: 'stu-1' },
      });
    });

    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));

    const [, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    const headers = options.headers as Record<string, string>;
    const payload = JSON.parse(String(options.body)) as Record<string, unknown>;

    expect(headers['x-request-id']).toBe('req-webhook-1');
    expect(payload.requestId).toBe('req-webhook-1');
  });
});
