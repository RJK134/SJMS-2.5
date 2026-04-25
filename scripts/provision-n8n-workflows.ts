/**
 * SJMS 2.5 — n8n Workflow Provisioning Script
 *
 * Reads all workflow JSON files from server/src/workflows/ and provisions
 * them into the n8n instance via its REST API.
 *
 * Behaviour:
 *   - Creates the SJMS Internal API credential if absent (resolves KI-P6-010)
 *   - Injects the real credential ID into workflow nodes before import
 *   - Creates workflows that do not yet exist (matched by name)
 *   - Updates workflows that already exist
 *   - Activates workflows after create/update where possible
 *   - Safe to re-run (idempotent)
 *
 * Required env vars:
 *   N8N_API_URL              — e.g. http://localhost:5678
 *   N8N_API_KEY              — n8n API key for authentication
 *   WORKFLOW_INTERNAL_SECRET  — value for the x-internal-key header credential
 *
 * Usage:
 *   npx tsx scripts/provision-n8n-workflows.ts
 */

import { readFileSync, readdirSync } from 'fs';
import { resolve, join } from 'path';

// ── Configuration ───────────────────────────────────────────────────────────

const N8N_API_URL = process.env.N8N_API_URL || 'http://localhost:5678';
const N8N_API_KEY = process.env.N8N_API_KEY;
const WORKFLOW_INTERNAL_SECRET = process.env.WORKFLOW_INTERNAL_SECRET || process.env.INTERNAL_SERVICE_KEY;

if (!N8N_API_KEY) {
  console.error('ERROR: N8N_API_KEY environment variable is required.');
  process.exit(1);
}

const WORKFLOWS_DIR = resolve(__dirname, '..', 'server', 'src', 'workflows');
const CREDENTIAL_NAME = 'SJMS Internal API';
const CREDENTIAL_PLACEHOLDER_ID = 'sjms-internal';
const API_HEADERS: Record<string, string> = {
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

interface N8nCredential {
  id: string;
  name: string;
  type: string;
}

interface ProvisionResult {
  file: string;
  name: string;
  action: 'created' | 'updated' | 'skipped';
  activated: boolean;
  error?: string;
}

// ── API helpers ─────────────────────────────────────────────────────────────

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

async function apiPut<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${N8N_API_URL}${path}`, {
    method: 'PUT',
    headers: API_HEADERS,
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`PUT ${path} → ${res.status}: ${res.statusText}`);
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

// ── Credential provisioning ─────────────────────────────────────────────────

async function ensureCredential(): Promise<string | null> {
  // Check if credential already exists
  const existing = await apiGet<{ data: N8nCredential[] }>('/api/v1/credentials');
  const match = existing.data.find((c) => c.name === CREDENTIAL_NAME && c.type === 'httpHeaderAuth');
  if (match) {
    console.log(`Credential "${CREDENTIAL_NAME}" exists (id=${match.id}).`);
    return match.id;
  }

  // Create credential if WORKFLOW_INTERNAL_SECRET is available
  if (!WORKFLOW_INTERNAL_SECRET) {
    console.warn(
      `WARNING: WORKFLOW_INTERNAL_SECRET not set. Cannot create credential.\n` +
      `  Manual step required: create "${CREDENTIAL_NAME}" in n8n UI\n` +
      `  (Credentials → Add → Header Auth → name: x-internal-key).`,
    );
    return null;
  }

  try {
    const created = await apiPost<N8nCredential>('/api/v1/credentials', {
      name: CREDENTIAL_NAME,
      type: 'httpHeaderAuth',
      data: {
        name: 'x-internal-key',
        value: WORKFLOW_INTERNAL_SECRET,
      },
    });
    console.log(`Credential "${CREDENTIAL_NAME}" created (id=${created.id}).`);
    return created.id;
  } catch (err) {
    console.warn(
      `WARNING: Could not create credential via API: ${(err as Error).message}\n` +
      `  Manual step required: create "${CREDENTIAL_NAME}" in n8n UI.`,
    );
    return null;
  }
}

/**
 * Replace the placeholder credential ID in workflow JSON with the real n8n ID.
 * Scans for `"id": "sjms-internal"` in credential references and swaps it.
 */
function injectCredentialId(workflowJson: string, credentialId: string): string {
  return workflowJson.replace(
    new RegExp(`"id":\\s*"${CREDENTIAL_PLACEHOLDER_ID}"`, 'g'),
    `"id": "${credentialId}"`,
  );
}

// ── Main ────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log('SJMS 2.5 — n8n Workflow Provisioning');
  console.log(`Target: ${N8N_API_URL}`);
  console.log(`Source: ${WORKFLOWS_DIR}\n`);

  // 1. Ensure credential exists and get its real ID
  const credentialId = await ensureCredential();
  console.log('');

  // 2. Discover workflow JSON files
  const files = readdirSync(WORKFLOWS_DIR)
    .filter((f) => f.startsWith('workflow-') && f.endsWith('.json'))
    .sort();

  if (files.length === 0) {
    console.log('No workflow files found.');
    return;
  }

  console.log(`Found ${files.length} workflow definition(s).\n`);

  // 3. Fetch existing workflows from n8n
  const existing = await apiGet<{ data: N8nWorkflow[] }>('/api/v1/workflows');
  const existingByName = new Map<string, N8nWorkflow>();
  for (const wf of existing.data) {
    existingByName.set(wf.name, wf);
  }

  // 4. Provision each workflow
  const results: ProvisionResult[] = [];

  for (const file of files) {
    const filePath = join(WORKFLOWS_DIR, file);
    let rawJson: string;
    let definition: Record<string, unknown>;

    try {
      rawJson = readFileSync(filePath, 'utf-8');

      // Inject real credential ID if available
      if (credentialId) {
        rawJson = injectCredentialId(rawJson, credentialId);
      }

      definition = JSON.parse(rawJson);
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
        // Update existing workflow (n8n v2 uses PUT, not PATCH)
        const updated = await apiPut<N8nWorkflow>(`/api/v1/workflows/${match.id}`, payload);
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

  // 5. Report
  console.log('─'.repeat(70));
  const created = results.filter((r) => r.action === 'created').length;
  const updated = results.filter((r) => r.action === 'updated').length;
  const activated = results.filter((r) => r.activated).length;
  const skipped = results.filter((r) => r.action === 'skipped').length;

  for (const r of results) {
    const status = r.error ? `SKIP (${r.error})` : `${r.action}${r.activated ? ' + activated' : ''}`;
    console.log(`  ${r.file} → ${status}`);
  }

  console.log(`\n${'─'.repeat(70)}`);
  console.log(`Created: ${created}  Updated: ${updated}  Activated: ${activated}  Skipped: ${skipped}`);
  if (credentialId) {
    console.log(`Credential: ${CREDENTIAL_NAME} (id=${credentialId})`);
  }
  console.log('Done.');

  if (skipped > 0) process.exit(1);
}

main().catch((err) => {
  console.error('Provisioning failed:', err);
  process.exit(1);
});
