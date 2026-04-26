#!/usr/bin/env node
// Docs truth-check
//
// Verifies that documented counts in README.md and CLAUDE.md match what the
// repository actually contains. Used as a CI gate to stop documentation
// drifting away from reality.
//
// Reports each finding even when there are several, so a single CI run shows
// every drift in one go. Exits 0 only when all checks pass.

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const repoRoot = resolve(dirname(__filename), '..');

const findings = [];

function fail(check, expected, actual, hint) {
  findings.push({ check, expected, actual, hint });
}

function ok(check, value) {
  process.stdout.write(`✓ ${check}: ${value}\n`);
}

// ── helpers ────────────────────────────────────────────────────────────────

function read(rel) {
  return readFileSync(join(repoRoot, rel), 'utf8');
}

function listFiles(rel, predicate) {
  const out = [];
  function walk(dir) {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      const s = statSync(full);
      if (s.isDirectory()) walk(full);
      else if (predicate(full)) out.push(full);
    }
  }
  walk(join(repoRoot, rel));
  return out;
}

// ── 1. Prisma model count ──────────────────────────────────────────────────

const schema = read('prisma/schema.prisma');
const modelCount = (schema.match(/^model /gm) || []).length;
const expectedModels = 197;
if (modelCount !== expectedModels) {
  fail(
    'Prisma model count',
    `${expectedModels}`,
    `${modelCount}`,
    `Update the count in CLAUDE.md "Target Metrics" and the schema header banner.`,
  );
} else {
  ok('Prisma model count', modelCount);
}

// ── 2. Flat router count ───────────────────────────────────────────────────

const routerFiles = listFiles('server/src/api', (p) => p.endsWith('.router.ts'));
const expectedRouters = 44;
if (routerFiles.length !== expectedRouters) {
  fail(
    'Flat router count',
    `${expectedRouters}`,
    `${routerFiles.length}`,
    `Update CLAUDE.md "Target Metrics" if the API surface changed intentionally.`,
  );
} else {
  ok('Flat router count', routerFiles.length);
}

// ── 3. Group barrel count ──────────────────────────────────────────────────

const groupBarrels = listFiles('server/src/api', (p) => p.endsWith('/group-index.ts'));
const expectedGroups = 9;
if (groupBarrels.length !== expectedGroups) {
  fail(
    'API group barrel count',
    `${expectedGroups}`,
    `${groupBarrels.length}`,
    `Phase 12a introduced 9 grouped domain barrels — adjust if the grouping changed.`,
  );
} else {
  ok('API group barrel count', groupBarrels.length);
}

// ── 4. ALL_AUTHENTICATED role count ────────────────────────────────────────

const rolesSrc = read('server/src/constants/roles.ts');
const allAuthMatch = rolesSrc.match(/ALL_AUTHENTICATED:\s*\[([\s\S]*?)\]\s*as const/);
if (!allAuthMatch) {
  fail('ALL_AUTHENTICATED group', 'block found', 'block missing', 'roles.ts may have been refactored.');
} else {
  const inside = allAuthMatch[1];
  const roleRefs = (inside.match(/ROLE_[A-Z_]+/g) || []).filter((s, i, a) => a.indexOf(s) === i);
  // The actual count in ALL_AUTHENTICATED is 35 (the public role is intentionally
  // excluded). Various places in CLAUDE.md and the auth comment header still
  // refer to "36 roles" but that figure includes 'public' — meaning it counts
  // the Keycloak realm total, not the authenticated set. The README and audit
  // now document both numbers explicitly. Locking on 35 here protects the
  // authenticated set from silent drift.
  const expectedRoles = 35;
  if (roleRefs.length !== expectedRoles) {
    fail(
      'ALL_AUTHENTICATED role count',
      `${expectedRoles}`,
      `${roleRefs.length}`,
      'Adjust both CLAUDE.md and README. The Keycloak realm has +1 (public) on top.',
    );
  } else {
    ok('ALL_AUTHENTICATED role count', roleRefs.length);
  }
}

// ── 5. Keycloak realm role count ───────────────────────────────────────────

const realm = JSON.parse(read('docker/keycloak/fhe-realm.json'));
const realmRoles = realm.roles?.realm || [];
// Realm includes 35 authenticated roles + 1 'public' role = 36 total.
const expectedRealmRoles = 36;
if (realmRoles.length !== expectedRealmRoles) {
  fail(
    'Keycloak realm role count',
    `${expectedRealmRoles} (35 authenticated + 1 public)`,
    `${realmRoles.length}`,
    'realm JSON drifted from roles.ts. Reconcile both before merging.',
  );
} else {
  ok('Keycloak realm role count', realmRoles.length);
}

// ── 6. n8n workflow count ──────────────────────────────────────────────────

const workflowDir = 'server/src/workflows';
const workflowJson = readdirSync(join(repoRoot, workflowDir)).filter(
  (f) => f.startsWith('workflow-') && f.endsWith('.json'),
);
const expectedWorkflows = 15;
if (workflowJson.length !== expectedWorkflows) {
  fail(
    'n8n workflow count',
    `${expectedWorkflows}`,
    `${workflowJson.length}`,
    'CLAUDE.md states 15 versioned workflows — keep this and the directory in step.',
  );
} else {
  ok('n8n workflow count', workflowJson.length);
}

// ── 7. Forbidden README phrases ────────────────────────────────────────────

const readme = read('README.md');
const forbiddenInReadme = [
  {
    phrase: 'RETIRED 2026-04-10',
    why: 'No such banner exists in docker-compose.yml. Older README claimed it did.',
  },
  {
    phrase: 'Dockerfiles are currently broken',
    why: 'Both Dockerfiles include real build steps. Re-verify before re-asserting.',
  },
  {
    phrase: 'OIDC/SAML',
    why: 'SAML is not implemented anywhere in server/src. Use "OIDC" alone until it is.',
  },
];
for (const f of forbiddenInReadme) {
  if (readme.includes(f.phrase)) {
    fail(
      `README contains forbidden phrase: "${f.phrase}"`,
      'absent',
      'present',
      f.why,
    );
  } else {
    ok(`README forbidden phrase absent: "${f.phrase}"`, 'absent');
  }
}

// ── 8. Forbidden CLAUDE.md phrases ─────────────────────────────────────────

const claudeMd = read('CLAUDE.md');
// Header banner in schema.prisma — let it lag separately; we'll catch it in
// a dedicated check below. Here we just verify CLAUDE.md does not assert
// SAML.
if (claudeMd.match(/\bSAML\b/)) {
  fail(
    'CLAUDE.md asserts SAML',
    'absent',
    'present',
    'CLAUDE.md should not list SAML as a current capability.',
  );
} else {
  ok('CLAUDE.md does not assert SAML', 'absent');
}

// ── 9. Schema banner stale-ness — non-blocking warning ─────────────────────

const banner = schema.match(/(\d+)\s*models\s*[·•]\s*(\d+)\s*domains/);
if (banner) {
  const bannerModels = Number.parseInt(banner[1], 10);
  if (bannerModels !== modelCount) {
    process.stdout.write(
      `! schema banner says ${bannerModels} models; actual is ${modelCount}. ` +
        `Banner is informational only and intentionally not enforced here so a schema-banner ` +
        `correction can land separately under Workstream F.\n`,
    );
  } else {
    ok('schema.prisma header banner model count', bannerModels);
  }
} else {
  process.stdout.write(`! schema.prisma header banner not parseable; skipping.\n`);
}

// ── 10. n8n credential header sanity (advisory only) ───────────────────────
// Records the known mismatch so it cannot drift further without us noticing.

const credPath = 'server/src/workflows/credentials/sjms-internal-api.json';
if (existsSync(join(repoRoot, credPath))) {
  const cred = JSON.parse(read(credPath));
  const headerName = cred.data?.name;
  if (headerName && headerName !== 'x-internal-key' && headerName !== 'x-internal-service-key') {
    fail(
      'n8n credential header name',
      "'x-internal-key' or 'x-internal-service-key'",
      `'${headerName}'`,
      'Header name drift detected; reconcile with auth.ts before activating Phase 20.',
    );
  } else {
    ok('n8n credential header name (advisory)', headerName);
  }
}

// ── Summary ────────────────────────────────────────────────────────────────

if (findings.length === 0) {
  process.stdout.write('\nAll docs-truth checks passed.\n');
  process.exit(0);
}

process.stderr.write(`\n${findings.length} docs-truth finding${findings.length === 1 ? '' : 's'}:\n`);
for (const f of findings) {
  process.stderr.write(`  ✗ ${f.check}\n`);
  process.stderr.write(`      expected: ${f.expected}\n`);
  process.stderr.write(`      actual:   ${f.actual}\n`);
  process.stderr.write(`      hint:     ${f.hint}\n`);
}
process.exit(1);
