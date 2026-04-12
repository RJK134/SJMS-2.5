import { z } from 'zod';

export const engagementQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(25),
  search: z.string().optional(),
  riskLevel: z.enum(['green', 'amber', 'red']).optional(),
  programmeId: z.string().optional(),
});
