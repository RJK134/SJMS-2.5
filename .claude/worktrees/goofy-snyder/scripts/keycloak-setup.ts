// ╔══════════════════════════════════════════════════════════════════════════╗
// ║  SJMS 2.5 — Keycloak Realm Setup                                       ║
// ║  Configures the "fhe" realm with 36 roles, PKCE client, and test users  ║
// ╚══════════════════════════════════════════════════════════════════════════╝

const KC_URL = process.env.KEYCLOAK_URL || 'http://localhost:8080';
const KC_ADMIN = process.env.KEYCLOAK_ADMIN || 'admin';
const KC_PASSWORD = process.env.KEYCLOAK_ADMIN_PASSWORD || 'changeme';
const REALM = 'fhe';
const CLIENT = 'sjms-client';

// ─── Role Definitions ───────────────────────────────────────────────────────

const ALL_ROLES = [
  // Top-level admin
  'super_admin', 'system_admin',
  // Registry
  'registrar', 'senior_registry_officer', 'registry_officer',
  'admissions_manager', 'admissions_officer', 'admissions_tutor',
  'assessment_officer', 'progression_officer', 'graduation_officer',
  // Finance
  'finance_director', 'finance_manager', 'finance_officer',
  // Quality
  'quality_director', 'quality_officer', 'compliance_officer',
  // Academic
  'dean', 'associate_dean', 'head_of_department',
  'programme_leader', 'module_leader',
  'academic_staff', 'lecturer', 'senior_lecturer', 'professor',
  // Support
  'student_support_manager', 'student_support_officer',
  'personal_tutor', 'disability_advisor', 'wellbeing_officer',
  // Specialist
  'international_officer', 'accommodation_officer',
  // End users
  'student', 'applicant', 'public',
] as const;

// Composite hierarchy: parent → direct children
const COMPOSITES: Record<string, string[]> = {
  super_admin: [
    'system_admin', 'registrar', 'finance_director', 'quality_director',
    'dean', 'student_support_manager', 'international_officer', 'accommodation_officer',
  ],
  registrar: [
    'senior_registry_officer', 'registry_officer', 'admissions_manager',
    'assessment_officer', 'progression_officer', 'graduation_officer',
  ],
  admissions_manager: ['admissions_officer', 'admissions_tutor'],
  finance_director: ['finance_manager'],
  finance_manager: ['finance_officer'],
  quality_director: ['quality_officer', 'compliance_officer'],
  dean: ['associate_dean'],
  associate_dean: ['head_of_department'],
  head_of_department: ['programme_leader', 'module_leader', 'academic_staff'],
  academic_staff: ['lecturer', 'senior_lecturer', 'professor'],
  student_support_manager: [
    'student_support_officer', 'personal_tutor', 'disability_advisor', 'wellbeing_officer',
  ],
};

// Test users: [email, firstName, lastName, password, roles[]]
const TEST_USERS: [string, string, string, string, string[]][] = [
  ['richard.knapp@fhe.ac.uk', 'Richard', 'Knapp', 'Fhe100@', ['super_admin']],
  ['lyndon.shirley@fhe.ac.uk', 'Lyndon', 'Shirley', 'Fhe100@', ['registrar']],
  ['academic@fhe.ac.uk', 'Academic', 'Dean', 'Fhe100@', ['dean']],
  ['finance@fhe.ac.uk', 'Finance', 'Director', 'Fhe100@', ['finance_director']],
  ['quality@fhe.ac.uk', 'Quality', 'Director', 'Fhe100@', ['quality_director']],
  ['support@fhe.ac.uk', 'Support', 'Manager', 'Fhe100@', ['student_support_manager']],
  ['lecturer@fhe.ac.uk', 'James', 'Wilson', 'Fhe100@', ['lecturer']],
  ['student@fhe.ac.uk', 'Student', 'User', 'Fhe100@', ['student']],
  ['applicant@fhe.ac.uk', 'Applicant', 'User', 'Fhe100@', ['applicant']],
];

// ─── API Helpers ────────────────────────────────────────────────────────────

let token = '';

async function getAdminToken(): Promise<void> {
  const res = await fetch(`${KC_URL}/realms/master/protocol/openid-connect/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'password',
      client_id: 'admin-cli',
      username: KC_ADMIN,
      password: KC_PASSWORD,
    }),
  });
  if (!res.ok) throw new Error(`Failed to get admin token: ${res.status} ${await res.text()}`);
  const data = await res.json() as { access_token: string };
  token = data.access_token;
}

async function kc(method: string, path: string, body?: unknown): Promise<Response> {
  const res = await fetch(`${KC_URL}${path}`, {
    method,
    headers: {
      'Authorization': `Bearer ${token}`,
      ...(body !== undefined && { 'Content-Type': 'application/json' }),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  return res;
}

async function kcJson<T = unknown>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await kc(method, path, body);
  if (!res.ok) throw new Error(`${method} ${path}: ${res.status} ${await res.text()}`);
  return res.json() as Promise<T>;
}

// ─── Setup Functions ────────────────────────────────────────────────────────

async function setupRealm(): Promise<void> {
  console.log('  Creating realm "fhe"...');

  // Delete existing realm (idempotent)
  const delRes = await kc('DELETE', `/admin/realms/${REALM}`);
  if (delRes.ok) console.log('    Deleted existing realm');

  // Create realm
  const res = await kc('POST', '/admin/realms', {
    realm: REALM,
    enabled: true,
    displayName: 'Future Horizons Education',
    displayNameHtml: '<b>Future Horizons Education</b>',
    loginWithEmailAllowed: true,
    duplicateEmailsAllowed: false,
    resetPasswordAllowed: true,
    editUsernameAllowed: false,
    registrationAllowed: false,
    rememberMe: true,
    verifyEmail: false,
    sslRequired: 'none', // dev only
    accessTokenLifespan: 300, // 5 minutes
    ssoSessionIdleTimeout: 1800, // 30 minutes
    ssoSessionMaxLifespan: 36000, // 10 hours
    internationalizationEnabled: true,
    supportedLocales: ['en'],
    defaultLocale: 'en',
  });

  if (!res.ok) throw new Error(`Failed to create realm: ${res.status} ${await res.text()}`);
  console.log('    Realm created');
}

async function setupRoles(): Promise<void> {
  console.log('  Creating roles...');

  // Create all roles
  for (const roleName of ALL_ROLES) {
    const res = await kc('POST', `/admin/realms/${REALM}/roles`, {
      name: roleName,
      description: roleName.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      composite: roleName in COMPOSITES,
    });
    if (!res.ok && res.status !== 409) {
      throw new Error(`Failed to create role ${roleName}: ${res.status} ${await res.text()}`);
    }
  }
  console.log(`    Created ${ALL_ROLES.length} roles`);

  // Set up composite hierarchy
  console.log('  Setting up composite role hierarchy...');
  for (const [parentName, childNames] of Object.entries(COMPOSITES)) {
    // Fetch child role representations (need id + name for composite API)
    const childRoles: { id: string; name: string }[] = [];
    for (const childName of childNames) {
      const role = await kcJson<{ id: string; name: string }>(
        'GET', `/admin/realms/${REALM}/roles/${childName}`
      );
      childRoles.push({ id: role.id, name: role.name });
    }

    // Add composites to parent
    const res = await kc('POST', `/admin/realms/${REALM}/roles/${parentName}/composites`, childRoles);
    if (!res.ok) {
      throw new Error(`Failed to set composites for ${parentName}: ${res.status} ${await res.text()}`);
    }
  }
  console.log(`    Configured ${Object.keys(COMPOSITES).length} composite roles`);
}

async function setupClient(): Promise<void> {
  console.log('  Creating client "sjms-client"...');

  const res = await kc('POST', `/admin/realms/${REALM}/clients`, {
    clientId: CLIENT,
    name: 'SJMS 2.5 Client',
    description: 'Student Journey Management System frontend application',
    enabled: true,
    publicClient: true,
    standardFlowEnabled: true,
    implicitFlowEnabled: false,
    directAccessGrantsEnabled: true, // for testing
    serviceAccountsEnabled: false,
    protocol: 'openid-connect',
    rootUrl: 'http://localhost:5173',
    baseUrl: '/',
    redirectUris: [
      'http://localhost:5173/*',
      'http://localhost:3001/*',
      'http://localhost/*',
    ],
    webOrigins: [
      'http://localhost:5173',
      'http://localhost:3001',
      'http://localhost',
    ],
    attributes: {
      'pkce.code.challenge.method': 'S256',
      'post.logout.redirect.uris': 'http://localhost:5173/*',
    },
    defaultClientScopes: ['openid', 'profile', 'email', 'roles'],
  });

  if (!res.ok && res.status !== 409) {
    throw new Error(`Failed to create client: ${res.status} ${await res.text()}`);
  }
  console.log('    Client created with PKCE (S256)');

  // Get client UUID for further configuration
  const clients = await kcJson<{ id: string; clientId: string }[]>(
    'GET', `/admin/realms/${REALM}/clients?clientId=${CLIENT}`
  );
  const clientUuid = clients[0]?.id;
  if (!clientUuid) throw new Error('Client not found after creation');

  // Add realm roles protocol mapper to the client (ensures roles appear in token)
  await kc('POST', `/admin/realms/${REALM}/clients/${clientUuid}/protocol-mappers/models`, {
    name: 'realm-roles',
    protocol: 'openid-connect',
    protocolMapper: 'oidc-usermodel-realm-role-mapper',
    config: {
      'claim.name': 'realm_access.roles',
      'jsonType.label': 'String',
      'multivalued': 'true',
      'id.token.claim': 'true',
      'access.token.claim': 'true',
      'userinfo.token.claim': 'true',
    },
  });
  console.log('    Realm roles mapper added to client');
}

async function setupUsers(): Promise<void> {
  console.log('  Creating test users...');

  for (const [email, firstName, lastName, password, roles] of TEST_USERS) {
    const username = email.split('@')[0];

    // Create user
    const createRes = await kc('POST', `/admin/realms/${REALM}/users`, {
      username,
      email,
      firstName,
      lastName,
      enabled: true,
      emailVerified: true,
      credentials: [{
        type: 'password',
        value: password,
        temporary: false,
      }],
    });

    if (!createRes.ok && createRes.status !== 409) {
      console.warn(`    Warning: Could not create user ${email}: ${createRes.status}`);
      continue;
    }

    // Get user ID
    const users = await kcJson<{ id: string }[]>(
      'GET', `/admin/realms/${REALM}/users?username=${username}&exact=true`
    );
    const userId = users[0]?.id;
    if (!userId) {
      console.warn(`    Warning: User ${username} not found after creation`);
      continue;
    }

    // Assign roles
    const roleReps: { id: string; name: string }[] = [];
    for (const roleName of roles) {
      const role = await kcJson<{ id: string; name: string }>(
        'GET', `/admin/realms/${REALM}/roles/${roleName}`
      );
      roleReps.push({ id: role.id, name: role.name });
    }

    const assignRes = await kc(
      'POST', `/admin/realms/${REALM}/users/${userId}/role-mappings/realm`,
      roleReps
    );
    if (!assignRes.ok) {
      console.warn(`    Warning: Could not assign roles to ${email}: ${assignRes.status}`);
    }

    console.log(`    ${email} → [${roles.join(', ')}]`);
  }
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
  console.log('🔐 SJMS 2.5 — Keycloak Realm Setup\n');
  console.log(`  Keycloak URL: ${KC_URL}`);
  console.log(`  Realm: ${REALM}\n`);

  await getAdminToken();
  console.log('  Admin token obtained\n');

  await setupRealm();
  await getAdminToken(); // refresh token after realm operations

  await setupRoles();
  await getAdminToken(); // refresh

  await setupClient();
  await getAdminToken(); // refresh

  await setupUsers();

  console.log('\n✅ Keycloak setup complete!');
  console.log(`\n  Admin console: ${KC_URL}/admin/master/console/#/${REALM}`);
  console.log(`  Account console: ${KC_URL}/realms/${REALM}/account`);
  console.log(`  OIDC config: ${KC_URL}/realms/${REALM}/.well-known/openid-configuration`);
  console.log(`  JWKS: ${KC_URL}/realms/${REALM}/protocol/openid-connect/certs`);
  console.log(`\n  Test login: richard.knapp@fhe.ac.uk / Fhe100@`);
}

main().catch(err => {
  console.error('\n❌ Setup failed:', err.message);
  process.exit(1);
});
