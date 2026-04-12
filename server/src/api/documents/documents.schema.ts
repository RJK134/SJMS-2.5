import { z } from 'zod';

export const paramsSchema = z.object({ id: z.string().min(1) });

export const querySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(25),
  sort: z.string().default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional(),
  studentId: z.string().optional(), documentType: z.string().optional(),
    verificationStatus: z.string().optional(),
});

export const createSchema = z.object({
  studentId: z.string().optional(),
    documentType: z.enum(['TRANSCRIPT','CERTIFICATE','EVIDENCE','LETTER','PASSPORT','VISA','QUALIFICATION','PHOTO','OTHER']),
    title: z.string().min(1), filePath: z.string().min(1),
    mimeType: z.string().min(1), fileSize: z.number().int(),
});

export const updateSchema = createSchema.partial();
