import { z } from 'zod';

export const executeSchema = z.object({
  entity: z.enum(['students', 'enrolments', 'modules', 'programmes', 'marks', 'finance', 'attendance']),
  academicYear: z.string().optional(),
  filters: z.record(z.string(), z.any()).optional(),
  fields: z.array(z.string()).optional(),
  format: z.enum(['json', 'csv', 'pdf', 'xlsx']).default('json'),
  limit: z.coerce.number().min(1).max(1000).default(100),
});
