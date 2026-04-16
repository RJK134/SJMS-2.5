import { crud, groupHealth } from './_factory';

// TODO: replace with generated Prisma types in Phase 9
interface UKVIRecord { id: string; [key: string]: unknown; }
interface AttendanceRecord { id: string; [key: string]: unknown; }
interface AuditLog { id: string; [key: string]: unknown; }
interface HESAReturn { id: string; [key: string]: unknown; }

export const ukvi = crud<UKVIRecord>('ukvi');
export const attendance = crud<AttendanceRecord>('attendance');
export const audit = crud<AuditLog>('audit');
export const hesa = crud<HESAReturn>('hesa');

export const complianceHealth = groupHealth('compliance');
