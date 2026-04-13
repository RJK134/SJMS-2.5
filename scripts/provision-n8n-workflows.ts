/**
 * SJMS 2.5 — n8n Workflow Provisioning Script
 *
 * Reads all workflow JSON files from server/src/workflows/ and provisions
 * them into the n8n instance via its REST API.
 *
 * Behaviour:
 *   - Creates workflows that do not yet exist (matched by name)
 *   - Updates workflows that already exist
 *   - Activates workflows after create/update where possible
 *   - Safe to re-run (idempotent)
 *
 * Required env vars:
 *   N8N_API_URL      — e.g. http://localhost:5678
 *   N8N_API_KEY      — n8n API key for authentication
 *
 * Usage:
 *   npx tsx scripts/provision-n8n-workflows.ts
 */

import { readFileSync, readdirSync } from 'fs';
import { resolve, join } from 'path';

// ── Configuration ───────────────────────────────────────────────────────────

const N8N_API_URL = process.env.N8N_API_URL || 'http://localhost:5678';
const N8N_API_KEY = process.env.N8N_API_KEY;

if (!N8N_API_KEY) {
  console.error('ERROR: N8N_API_KEY environment variable is required.');
  process.exit(1);
}

const WORKFLOWS_DIR = resolve(__dirname, '..', 'server', 'src', 'workflows');
const API_HEADERS = {
  'Content-Type': 'application/json',
  'X-N8N-API-KEY': N8N_API_KEY,
};

// ── Types ───────────────────────────────────────────────────────────────────

interface N8nWorkflow {
  id: string;
  name: string;
  active: boolean;
  nodes: unknown[];
  connections: Record<string, unknown>;
  settings: Record<string, unknown>;
}

interface ProvisionResult {
  file: string;
  name: string;
  action: 'created' | 'updated' | 'skipped';
  activated: boolean;
  error?: string;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${N8N_API_URL}${path}`, { headers: API_HEADERS });
  if (!res.ok) throw new Error(`GET ${path} → ${res.status}: ${res.statusText}`);
  return res.json() as Promise<T>;
}

async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${N8N_API_URL}${path}`, {
    method: 'POST',
    headers: API_HEADERS,
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`POST ${path} → ${res.status}: ${res.statusText}`);
  return res.json() as Promise<T>;
}

async function apiPatch<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${N8N_API_URL}${path}`, {
    method: 'PATCH',
    headers: API_HEADERS,
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`PATCH ${path} → ${res.status}: ${res.statusText}`);
  return res.json() as Promise<T>;
}

async function activateWorkflow(id: string): Promise<boolean> {
  try {
    await apiPost(`/api/v1/workflows/${id}/activate`, {});
    return true;
  } catch {
    // Activation may fail if n8n requires webhook registration — non-fatal
    return false;
  }
}

// ── Main ────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log('SJMS 2.5 — n8n Workflow Provisioning');
  console.log(`Target: ${N8N_API_URL}`);
  console.log(`Source: ${WORKFLOWS_DIR}\n`);

  // 1. Discover workflow JSON files
  const files = readdirSync(WORKFLOWS_DIR)
    .filter((f) => f.startsWith('workflow-') && f.endsWith('.json'))
    .sort();

  if (files.length === 0) {
    console.log('No workflow files found.');
    return;
  }

  console.log(`Found ${files.length} workflow definition(s).\n`);

  // 2. Fetch existing workflows from n8n
  const existing = await apiGet<{ data: N8nWorkflow[] }>('/api/v1/workflows');
  const existingByName = new Map<string, N8nWorkflow>();
  for (const wf of existing.data) {
    existingByName.set(wf.name, wf);
  }

  // 3. Provision each workflow
  const results: ProvisionResult[] = [];

  for (const file of files) {
    const filePath = join(WORKFLOWS_DIR, file);
    let definition: Record<string, unknown>;

    try {
      definition = JSON.parse(readFileSync(filePath, 'utf-8'));
    } catch (err) {
      results.push({ file, name: '(parse error)', action: 'skipped', activated: false, error: (err as Error).message });
      continue;
    }

    const name = definition.name as string;
    const match = existingByName.get(name);
    let action: 'created' | 'updated' = 'created';
    let workflowId: string;

    // Strip read-only fields that the n8n API rejects on create/update
    const payload = { ...definition };
    delete payload.active;
    delete payload.tags;

    try {
      if (match) {
        // Update existing workflow
        const updated = await apiPatch<N8nWorkflow>(`/api/v1/workflows/${match.id}`, payload);
        workflowId = updated.id;
        action = 'updated';
      } else {
        // Create new workflow
        const created = await apiPost<N8nWorkflow>('/api/v1/workflows', payload);
        workflowId = created.id;
        action = 'created';
      }

      const activated = await activateWorkflow(workflowId);
      results.push({ file, name, action, activated });
    } catch (err) {
      results.push({ file, name, action: 'skipped', activated: false, error: (err as Error).message });
    }
  }

  // 4. Report
  console.log('─'.repeat(70));
  const created = results.filter((r) => r.action === 'created').length;
  const updated = results.filter((r) => r.action === 'updated').length;
  const activated = results.filter((r) => r.activated).length;
  const skipped = results.filter((r) => r.action === 'skipped').length;

  for (const r of results) {
    const status = r.error ? `SKIP (${r.error})` : `${r.action}${r.activated ? ' + activated' : ''}`;
    console.log(`  ${r.file} → ${status}`);
  }

  console.log('\n─'.repeat(70));
  console.log(`Created: ${created}  Updated: ${updated}  Activated: ${activated}  Skipped: ${skipped}`);
  console.log('Done.');

  if (skipped > 0) process.exit(1);
}

main().catch((err) => {
  console.error('Provisioning failed:', err);
  process.exit(1);
});
