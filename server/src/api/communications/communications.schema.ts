import { z } from 'zod';

export const paramsSchema = z.object({ id: z.string().min(1) });

export const querySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(25),
  sort: z.string().default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional(),
  channel: z.string().optional(), category: z.string().optional(),
});

export const createSchema = z.object({
  templateCode: z.string().min(1), title: z.string().min(1),
    category: z.string().min(1),
    channel: z.enum(['EMAIL','SMS','PORTAL','LETTER','PUSH']),
    subject: z.string().optional(), body: z.string().min(1),
    isActive: z.boolean().default(true),
});

export const updateSchema = createSchema.partial();

/** Schema for the workflow-facing send endpoint (POST /communications/send). */
export const sendSchema = z.object({
  templateKey: z.string().min(1),
  channel: z.string().transform((v) => v.toUpperCase()).pipe(
    z.enum(['EMAIL', 'SMS', 'PORTAL', 'LETTER', 'PUSH']),
  ).default('EMAIL'),
  recipientId: z.string().optional(),
  data: z.union([z.record(z.string(), z.unknown()), z.string()]).optional().transform((v) =>
    typeof v === 'string' ? JSON.parse(v) as Record<string, unknown> : v,
  ),
  bulk: z.coerce.boolean().optional(),
});
