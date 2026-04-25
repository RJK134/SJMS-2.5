# Cursor Background Agent — Setup Guide

This repo is wired for a Cursor Background Agent called **SJMS-Agent** that
auto-reviews PRs, auto-fixes safe issues, implements assigned issues, and
responds to `@cursor` mentions.

## Model strategy (important — cost)

**Cursor Pro gives you:**
- `$20/month` credit pool for premium models
- **Unlimited Auto mode** (Cursor picks a cost-efficient model) — no credit cost
- Unlimited Tab completions
- Cloud / Background Agents with a 20% surcharge on model costs

**This project defaults to Auto mode** to stay within the included Pro
allowance. GPT-5.5 Pro ($30 / $180 per M tokens) would drain the $20 pool in
roughly 2–3 Background Agent runs and is explicitly avoided by default.

If you need to force a premium model on a specific run:
- Use the **Cursor Agent (Manual Dispatch)** workflow (Actions tab) and pick
  `gpt-5.5` or `gpt-5.5-thinking` from the dropdown.
- Or include `[use:gpt-5.5]` in a comment to the agent.

## Files in this repo

| Path | Purpose |
|---|---|
| `.cursor/environment.json` | Install + start commands for the cloud VM |
| `.cursor/agents/SJMS-Agent.md` | Agent persona, triggers, and hard rules |
| `.cursor/rules/sjms-conventions.mdc` | Always-on project conventions |
| `.cursor/BUGBOT.md` | (Existing) BugBot config |
| `.github/workflows/cursor-agent.yml` | Event-driven dispatch to Cursor |
| `.github/workflows/cursor-agent-manual.yml` | Manual `workflow_dispatch` runs |

## One-time setup steps (you must do these)

### 1. Install the Cursor GitHub App on this repo
- In Cursor: **Settings → Integrations → GitHub → Install App**
- Scope to `RJK134/SJMS-2.5` (or your org)

### 2. Register the custom agent in Cursor
- **Cmd/Ctrl + Shift + P** → *Cursor: Manage Custom Agents* → **New**
- Name: `SJMS-Agent`
- Model: **Auto**
- Paste the system prompt from `.cursor/agents/SJMS-Agent.md`
- Save

### 3. Create four automations in Cursor
(Cmd/Ctrl + Shift + P → *Cursor: Automations*)

| Name | Trigger | Agent |
|---|---|---|
| SJMS PR Auto-Review | GitHub → PR opened/synchronized on `RJK134/SJMS-2.5` | SJMS-Agent |
| SJMS Issue → PR | GitHub → Issue assigned to `cursor-agent` **or** labelled `cursor` | SJMS-Agent |
| SJMS Mention Handler | GitHub → Comment contains `@cursor` | SJMS-Agent |
| SJMS Auto-Fix | GitHub → Check suite failure on PR | SJMS-Agent |

After saving each, copy the **Webhook URL** and **Auth header** from the
PR Auto-Review automation.

### 4. Add GitHub repo secrets
Repo → **Settings → Secrets and variables → Actions → New secret**:
- `CURSOR_WEBHOOK_URL` — from step 3
- `CURSOR_WEBHOOK_AUTH` — from step 3
- `CURSOR_API_KEY` — from Cursor → Settings → API Keys (only needed for the
  manual dispatch workflow)

### 5. Configure agent environment secrets in Cursor
Background Agents → **Settings → Secrets** (these never go in the repo):
- `DATABASE_URL` → **dev/staging DB only**, never production
- `NEXTAUTH_SECRET` → dev value
- Any Azure / SharePoint / Dynamics dev credentials the app needs at runtime

### 6. Turn on branch protection for `main`
Repo → **Settings → Branches → Add rule** for `main`:
- Require PR before merge
- **Require 1 human approval** — do not skip this for a student-data system
- Require status checks: `ci`, `codeql`, `security-audit`
- Require branches up to date before merging
- Restrict who can push

### 7. Turn on auto-merge and branch cleanup
Repo → **Settings → General → Pull Requests**:
- Allow auto-merge
- Automatically delete head branches

### 8. Set a spending cap in Cursor
Cursor → **Settings → Billing**: cap monthly usage-based billing at a value
you're willing to lose (e.g. `$10`). Enable email alerts at 50 / 80 / 100 %.

## How to use it day-to-day

- **Assign an issue to the agent:** add the `cursor` label, or assign it to
  the `cursor-agent` GitHub user. The agent opens a branch and PR.
- **Ask a question on a PR:** comment `@cursor <question>`.
- **Force a fix on a failing CI run:** comment `@cursor investigate CI failure
  and fix`.
- **Run an ad-hoc task:** Actions → *Cursor Agent (Manual Dispatch)* → Run
  workflow → enter task.

## What the agent will NOT do

- Modify auth, session, RBAC, or Prisma migrations without a human review
  label — by design.
- Merge its own PRs — merging requires human approval under branch protection.
- Log student PII.
- Disable tests or suppress type errors to make CI pass.
