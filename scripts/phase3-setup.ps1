# =============================================================================
# SJMS 2.5 - Phase 3 Setup Script (Windows PowerShell)
# Run from the REPO ROOT: .\scripts\phase3-setup.ps1
# If blocked by execution policy, run first:
#   Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
# =============================================================================

$ErrorActionPreference = 'Stop'

$BRANCH       = 'phase-3/api-decomposition'
$BASE_BRANCH  = 'main'
$SERVER_DIR   = 'server'

function Pass  { param($msg) Write-Host "  [PASS] $msg" -ForegroundColor Green }
function Warn  { param($msg) Write-Host "  [WARN] $msg" -ForegroundColor Yellow }
function Fail  { param($msg) Write-Host "  [FAIL] $msg" -ForegroundColor Red; exit 1 }
function Info  { param($msg) Write-Host "  -->  $msg"   -ForegroundColor Cyan }
function Divider { Write-Host ('=' * 60) -ForegroundColor DarkCyan }

Write-Host ''
Divider
Write-Host '  SJMS 2.5 - Phase 3 Pre-Flight and Branch Setup' -ForegroundColor Cyan
Divider
Write-Host ''

# --- STEP 1: Confirm repo root ------------------------------------------------
Info 'Step 1/6 - Confirming repo root...'
if (-not (Test-Path 'CLAUDE.md')) {
    Fail 'CLAUDE.md not found. Run this script from the REPO ROOT, e.g.: .\scripts\phase3-setup.ps1'
}
if (-not (Test-Path $SERVER_DIR -PathType Container)) {
    Fail "server\ directory not found. Are you in the repo root?"
}
Pass 'Repo root confirmed'

# --- STEP 2: Check git state --------------------------------------------------
Info 'Step 2/6 - Checking git state...'
$currentBranch = (git rev-parse --abbrev-ref HEAD 2>&1).Trim()
if ($currentBranch -ne $BASE_BRANCH) {
    Warn "Currently on branch '$currentBranch', not '$BASE_BRANCH'."
    $answer = Read-Host '  Switch to main now? (y/N)'
    if ($answer -match '^[Yy]') {
        git checkout $BASE_BRANCH
    } else {
        Fail 'Aborting. Please switch to main manually first.'
    }
}

$gitStatus = (git status --porcelain 2>&1)
if ($gitStatus) {
    Warn 'Working tree is not clean. Uncommitted changes detected:'
    git status --short
    $answer = Read-Host '  Stash changes and continue? (y/N)'
    if ($answer -match '^[Yy]') {
        $stamp = (Get-Date -Format 'yyyyMMdd-HHmmss')
        git stash push -m "phase3-setup auto-stash $stamp"
    } else {
        Fail 'Aborting. Please commit or stash changes before running setup.'
    }
}

git pull origin $BASE_BRANCH --quiet
Pass "On clean $BASE_BRANCH, pulled latest"

# --- STEP 3: Create Phase 3 branch --------------------------------------------
Info "Step 3/6 - Creating branch $BRANCH..."
$remoteExists = git ls-remote --heads origin $BRANCH 2>&1
if ($remoteExists) {
    Warn "Remote branch $BRANCH already exists."
    $answer = Read-Host '  Check it out instead of creating fresh? (y/N)'
    if ($answer -match '^[Yy]') {
        git checkout $BRANCH
        git pull origin $BRANCH --quiet
        Pass "Checked out existing branch $BRANCH"
    } else {
        Fail 'Aborting. Delete the remote branch first or choose to check it out.'
    }
} else {
    git checkout -b $BRANCH
    git push -u origin $BRANCH
    Pass "Branch $BRANCH created and pushed to origin"
}

# --- STEP 4: TypeScript pre-flight --------------------------------------------
Info 'Step 4/6 - Running TypeScript pre-flight check...'
Set-Location $SERVER_DIR
if (-not (Test-Path 'package.json')) {
    Set-Location ..
    Fail 'server\package.json not found'
}
if (-not (Test-Path 'node_modules' -PathType Container)) {
    Warn 'node_modules missing - installing dependencies...'
    npm install --silent
}

$tscOutput = (npx tsc --noEmit 2>&1) | Out-String
Set-Location ..

if ($tscOutput -match 'error TS') {
    Write-Host ''
    Warn 'TypeScript errors found BEFORE Phase 3 build starts:'
    $tscOutput -split "`n" | Where-Object { $_ -match 'error TS' } | Select-Object -First 20 | ForEach-Object { Write-Host "    $_" -ForegroundColor Red }
    Write-Host ''
    Warn 'Resolve these on main before Phase 3 begins.'
    Warn 'If pre-existing, log them in docs/KNOWN_ISSUES.md as KI-P2-xxx items.'
    exit 1
}
Pass 'TypeScript: 0 errors on server/tsconfig.json'

# --- STEP 5: Verify server/src structure -------------------------------------
Info 'Step 5/6 - Verifying server\src structure...'
$requiredDirs = @('routes','services','repositories','middleware','utils')
$missing = @()
foreach ($dir in $requiredDirs) {
    if (-not (Test-Path "server\src\$dir" -PathType Container)) {
        $missing += "server\src\$dir"
    }
}
if ($missing.Count -gt 0) {
    Fail "Missing required directories:`n$($missing -join "`n")  `nPhase 2.5 remediation may not be complete."
}

# Grep for direct prisma imports in services
$directPrisma = Get-ChildItem -Path 'server\src\services' -Filter '*.ts' -Recurse -ErrorAction SilentlyContinue |
    Select-String -Pattern 'from.*utils/prisma' | Where-Object { $_.Line -notmatch 'repository' }
if ($directPrisma) {
    Warn 'Direct prisma imports still present in services (should use repositories):'
    $directPrisma | ForEach-Object { Write-Host "    $($_.Filename):$($_.LineNumber)  $($_.Line.Trim())" -ForegroundColor Yellow }
    Warn 'Log as KI-P2 items - do not fix now, note for Phase 3 review.'
}

# Grep for hard deletes in services
$hardDeletes = Get-ChildItem -Path 'server\src\services' -Filter '*.ts' -Recurse -ErrorAction SilentlyContinue |
    Select-String -Pattern '\.delete\('
if ($hardDeletes) {
    Warn 'Hard deletes detected in services - RED issue, must be converted to soft deletes:'
    $hardDeletes | ForEach-Object { Write-Host "    $($_.Filename):$($_.LineNumber)  $($_.Line.Trim())" -ForegroundColor Red }
}

Pass 'server\src structure verified'

# --- STEP 6: Print Claude Code session primer ---------------------------------
Info 'Step 6/6 - Generating Claude Code session primer...'

$commitShort = (git rev-parse --short HEAD 2>&1).Trim()
$timestamp   = (Get-Date -Format 'yyyy-MM-dd HH:mm zzz')
$currentBranchNow = (git rev-parse --abbrev-ref HEAD 2>&1).Trim()

Write-Host ''
Divider
Write-Host '  PHASE 3 PRE-FLIGHT PASSED - READY TO BUILD' -ForegroundColor Green
Divider
Write-Host "  Current branch : $currentBranchNow" -ForegroundColor Cyan
Write-Host "  Base commit    : $commitShort"       -ForegroundColor Cyan
Write-Host "  Timestamp      : $timestamp"         -ForegroundColor Cyan
Write-Host ''
Write-Host ('=' * 60) -ForegroundColor Yellow
Write-Host '  COPY EVERYTHING BETWEEN THE MARKERS INTO CLAUDE CODE:' -ForegroundColor Yellow
Write-Host ('=' * 60) -ForegroundColor Yellow
Write-Host ''

$primer = @"
## SJMS 2.5 - Phase 3 Build Session

**Context**: You are working on SJMS 2.5 (Student Journey Management System),
a pre-production Node 20 / Express 4 / TypeScript strict / Prisma 5 / PostgreSQL 16
academic management system. Phase 2.5 architecture remediation is complete.
Base commit: $commitShort  |  Started: $timestamp

**Current branch**: phase-3/api-decomposition (branched from clean main)
**Phase goal**: Decompose 44 domain routers into 37 grouped API modules in
server/src/routes/ WITHOUT rewriting any existing business logic.

**Absolute rules - never break these**:
1. No hard deletes anywhere - all deletes must set deletedAt (soft delete)
2. No service file may import directly from utils/prisma - always via repositories
3. No ``prisma db push`` - only ``prisma migrate dev --name <descriptive-name>``
4. TypeScript strict mode - npx tsc --noEmit must return 0 errors after every stage
5. British English in all string literals, comments, and commit messages
6. No scope creep - do not touch client/, n8n-workflows/, or docker/ in this phase

**Pre-production acceptance threshold**:
- GREEN (must pass before commit): tsc clean, routes registered, health endpoints
  respond, auth middleware present on protected routes, soft deletes only
- AMBER (log to docs/KNOWN_ISSUES.md, do NOT fix now): missing pagination,
  line count warnings, performance suggestions, incomplete seed data
- RED (fix before commit): missing auth middleware, hard deletes,
  TypeScript errors, broken imports

**Commit pattern for every batch**:
  feat(api): <module-group-name> - Phase 3 Batch N

  - Modules added: list them
  - tsc: 0 errors
  - Routes registered: N/37

  Co-authored-by: Claude Code <claude@anthropic.com>

**After every batch commit**: run ``git push origin phase-3/api-decomposition``
and confirm the push succeeded before starting the next batch.

**Read CLAUDE.md fully before starting any work.**

---

## START: PHASE 3 BATCH 1 - Identity Module

Create server/src/routes/identity/index.ts as a barrel module that imports
and registers the following existing routers under their existing path prefixes
(do NOT change any existing router file):
  - authentication
  - authorisation
  - user-profile
  - role-management
  - session-management
  - audit-log

Add one new endpoint inside identity/index.ts only:
  GET /api/identity/health  =>  { module: 'identity', status: 'ok', routes: 6 }

Register the identity module in server/src/index.ts under /api/identity.

After creating the files:
1. Run npx tsc --noEmit - must return 0 errors
2. Confirm all 6 sub-routers are reachable
3. Commit with message: feat(api): identity module barrel - Phase 3 Batch 1
4. Run: git push origin phase-3/api-decomposition
5. Report: routes registered so far (should be 6/37)

Then STOP and wait for my instruction to proceed to Batch 2.
"@

Write-Host $primer
Write-Host ''
Write-Host ('=' * 60) -ForegroundColor Yellow
Write-Host '  END OF CLAUDE CODE PRIMER - PASTE EVERYTHING ABOVE THIS LINE' -ForegroundColor Yellow
Write-Host ('=' * 60) -ForegroundColor Yellow
Write-Host ''
Write-Host '  After pasting Batch 1, continue with Batch 2-6 from' -ForegroundColor Gray
Write-Host '  your SJMS-Phase3-ClaudeCode-Prompts.md document.' -ForegroundColor Gray
Write-Host ''
