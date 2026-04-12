#!/usr/bin/env bash
# =============================================================================
# SJMS 2.5 — Phase 3 Setup Script
# Run from the REPO ROOT: bash scripts/phase3-setup.sh
# =============================================================================
set -euo pipefail

BRANCH="phase-3/api-decomposition"
BASE_BRANCH="main"
SERVER_DIR="server"
KNOWN_ISSUES="docs/KNOWN_ISSUES.md"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

pass() { echo -e "${GREEN}  ✓ $1${NC}"; }
warn() { echo -e "${YELLOW}  ⚠ $1${NC}"; }
fail() { echo -e "${RED}  ✗ $1${NC}"; exit 1; }
info() { echo -e "${BLUE}  → $1${NC}"; }

echo ""
echo -e "${BLUE}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   SJMS 2.5 — Phase 3 Pre-Flight & Branch Setup          ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""

# ─── STEP 1: Confirm we are at the repo root ─────────────────────────────────
info "Step 1/6 — Confirming repo root..."
if [ ! -f "CLAUDE.md" ]; then
  fail "CLAUDE.md not found. Run this script from the REPO ROOT, e.g.:\n  bash scripts/phase3-setup.sh"
fi
if [ ! -d "$SERVER_DIR" ]; then
  fail "server/ directory not found. Are you in the repo root?"
fi
pass "Repo root confirmed"

# ─── STEP 2: Confirm we are on main and it is clean ──────────────────────────
info "Step 2/6 — Checking git state..."
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$CURRENT_BRANCH" != "$BASE_BRANCH" ]; then
  warn "Currently on branch '$CURRENT_BRANCH', not '$BASE_BRANCH'."
  read -rp "  Switch to $BASE_BRANCH now? (y/N) " yn
  case $yn in
    [Yy]*) git checkout "$BASE_BRANCH" ;;
    *) fail "Aborting. Please switch to $BASE_BRANCH manually first." ;;
  esac
fi

GIT_STATUS=$(git status --porcelain)
if [ -n "$GIT_STATUS" ]; then
  warn "Working tree is not clean. Uncommitted changes detected:"
  git status --short
  read -rp "  Stash changes and continue? (y/N) " yn
  case $yn in
    [Yy]*) git stash push -m "phase3-setup auto-stash $(date +%Y%m%d-%H%M%S)" ;;
    *) fail "Aborting. Please commit or stash changes before running setup." ;;
  esac
fi

git pull origin "$BASE_BRANCH" --quiet
pass "On clean $BASE_BRANCH, pulled latest"

# ─── STEP 3: Create Phase 3 branch ───────────────────────────────────────────
info "Step 3/6 — Creating branch $BRANCH..."
if git ls-remote --exit-code --heads origin "$BRANCH" &>/dev/null; then
  warn "Remote branch $BRANCH already exists."
  read -rp "  Check it out instead of creating fresh? (y/N) " yn
  case $yn in
    [Yy]*) git checkout "$BRANCH" && git pull origin "$BRANCH" --quiet ;;
    *) fail "Aborting. Delete the remote branch first or choose to check it out." ;;
  esac
else
  git checkout -b "$BRANCH"
  git push -u origin "$BRANCH"
  pass "Branch $BRANCH created and pushed"
fi

# ─── STEP 4: TypeScript pre-flight ───────────────────────────────────────────
info "Step 4/6 — Running TypeScript pre-flight check..."
cd "$SERVER_DIR"
if [ ! -f "package.json" ]; then
  fail "server/package.json not found"
fi
if [ ! -d "node_modules" ]; then
  warn "node_modules missing — installing dependencies..."
  npm install --silent
fi
TSC_ERRORS=$(npx tsc --noEmit 2>&1 || true)
if echo "$TSC_ERRORS" | grep -q "error TS"; then
  echo ""
  warn "TypeScript errors found BEFORE Phase 3 build starts:"
  echo "$TSC_ERRORS" | grep "error TS" | head -20
  echo ""
  warn "These must be resolved before Phase 3 begins."
  warn "Log them in $KNOWN_ISSUES as KI-P2-xxx if pre-existing."
  cd ..
  exit 1
fi
cd ..
pass "TypeScript: 0 errors on server/tsconfig.json"

# ─── STEP 5: Verify server/src structure ─────────────────────────────────────
info "Step 5/6 — Verifying server/src structure..."
REQUIRED_DIRS=("routes" "services" "repositories" "middleware" "utils")
MISSING=()
for dir in "${REQUIRED_DIRS[@]}"; do
  if [ ! -d "server/src/$dir" ]; then
    MISSING+=("server/src/$dir")
  fi
done
if [ ${#MISSING[@]} -gt 0 ]; then
  fail "Missing required directories:\n$(printf '  - %s\n' "${MISSING[@]}")\nPhase 2.5 remediation may not be complete."
fi

# Check for any remaining direct prisma imports in services (Phase 2.5 requirement)
DIRECT_PRISMA=$(grep -r "from.*utils/prisma" server/src/services/ 2>/dev/null | grep -v "repository" || true)
if [ -n "$DIRECT_PRISMA" ]; then
  warn "Direct prisma imports still present in services (should use repositories):"
  echo "$DIRECT_PRISMA"
  warn "Log as KI-P2 items — do not fix now, note for Phase 3 review."
fi

# Check for hard deletes in services
HARD_DELETES=$(grep -r "\.delete(" server/src/services/ 2>/dev/null || true)
if [ -n "$HARD_DELETES" ]; then
  warn "Hard deletes detected in services — these are RED issues, must be converted to soft deletes:"
  echo "$HARD_DELETES"
fi

pass "server/src structure verified"

# ─── STEP 6: Print Phase 3 session primer ────────────────────────────────────
info "Step 6/6 — Generating Claude Code session primer..."

echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   ✓  Phase 3 Pre-Flight PASSED — Ready to Build         ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}Current branch : ${NC}$(git rev-parse --abbrev-ref HEAD)"
echo -e "${BLUE}Base commit    : ${NC}$(git rev-parse --short HEAD)"
echo -e "${BLUE}Timestamp      : ${NC}$(date '+%Y-%m-%d %H:%M %Z')"
echo ""
echo -e "${YELLOW}══════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}  COPY THE BLOCK BELOW AND PASTE INTO CLAUDE CODE:${NC}"
echo -e "${YELLOW}══════════════════════════════════════════════════════════${NC}"
echo ""

cat <<'PRIMER'
## SJMS 2.5 — Phase 3 Build Session

**Context**: You are working on SJMS 2.5 (Student Journey Management System), a
pre-production Node 20 / Express 4 / TypeScript strict / Prisma 5 / PostgreSQL 16
academic management system. Phase 2.5 architecture remediation is complete.

**Current branch**: phase-3/api-decomposition (from clean main)
**Phase goal**: Decompose 44 domain routers into 37 grouped API modules in server/src/routes/
without rewriting any business logic.

**Absolute rules — never break these**:
1. No hard deletes anywhere — all deletes must set deletedAt (soft delete)
2. No service file may import directly from utils/prisma — always via repositories
3. No `prisma db push` — only `prisma migrate dev --name <descriptive-name>`
4. TypeScript strict mode — npx tsc --noEmit must return 0 errors after every stage
5. British English in all string literals, comments, and commit messages
6. No scope creep — do not touch client/, n8n-workflows/, or docker/ in this phase

**Pre-production acceptance threshold**:
- GREEN (must pass): tsc clean, routes registered, health endpoints respond, soft deletes only
- AMBER (log to docs/KNOWN_ISSUES.md, do NOT fix now): missing pagination, line count warnings,
  performance suggestions, incomplete seed data, CSS/UI issues
- RED (fix before commit): missing auth middleware on protected routes, hard deletes,
  TypeScript errors, broken imports

**Commit pattern**:
  feat(api): <module-group-name> — Phase 3 Batch N
  
  - List what was added
  - tsc: 0 errors
  - Routes registered: N/37
  
  Co-authored-by: Claude Code <claude@anthropic.com>

**After each batch commit**: push to origin/phase-3/api-decomposition and confirm push succeeded.

**Read CLAUDE.md fully before starting any work.**

---
START PHASE 3 BATCH 1: Begin with server/src/routes/identity/ module group.
Group the following existing routers into a unified identity module:
authentication, authorisation, user-profile, role-management, session-management, audit-log.
Each existing router file stays intact — create an index.ts barrel that registers all six
under their existing path prefixes. Add a GET /api/identity/health endpoint that returns
{ module: 'identity', status: 'ok', routes: 6 }. Run tsc --noEmit. Commit with the
pattern above as "Batch 1 — Identity module (6/37 routes registered)".
PRIMER

echo ""
echo -e "${YELLOW}══════════════════════════════════════════════════════════${NC}"
echo ""
echo "After pasting that primer, continue with Batch 2–6 from your"
echo "SJMS-Phase3-ClaudeCode-Prompts.md document."
echo ""
