import { crud, groupHealth } from './_factory';

// TODO: replace with generated Prisma types in Phase 9
interface FinanceRecord { id: string; [key: string]: unknown; }
interface Report { id: string; [key: string]: unknown; }
interface Transcript { id: string; [key: string]: unknown; }
interface ConfigItem { id: string; [key: string]: unknown; }
interface Webhook { id: string; [key: string]: unknown; }
interface Governance { id: string; [key: string]: unknown; }

export const finance = crud<FinanceRecord>('finance');
export const reports = crud<Report>('reports');
export const transcripts = crud<Transcript>('transcripts');
export const config = crud<ConfigItem>('config');
export const webhooks = crud<Webhook>('webhooks');
export const governance = crud<Governance>('governance');

export const platformHealth = groupHealth('platform');
