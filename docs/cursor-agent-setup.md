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

## Read-only Q&A from the GitHub mobile app

For quick questions on your phone where you do **not** want a PR or any code
changes, start your `@cursor` comment with one of these triggers and the
agent will reply with a single comment only — no branches, no commits, no PR:

- `@cursor explain ...`
- `@cursor question: ...` or `@cursor q: ...`
- `@cursor what / why / how / where / when / which / who ...`
- `@cursor describe ...` / `@cursor summarise ...` / `@cursor summarize ...`
- `@cursor review (no fix) ...`
- `@cursor read-only: ...` (explicit override for any phrasing)

Examples that work well from a phone:
- `@cursor explain what server/src/services/enrollment.ts does in plain English`
- `@cursor q: why is the test in student.service.test.ts failing?`
- `@cursor review (no fix) the security implications of this PR`
- `@cursor read-only: should I use a transaction here?`

If the answer suggests a change you want made, follow up with
`@cursor implement the above` and the agent switches back to normal mode and
opens a PR. This replaces the Copilot mobile chat workflow without consuming
tokens on every question.

## What the agent will NOT do

- Modify auth, session, RBAC, or Prisma migrations without a human review
  label — by design.
- Merge its own PRs — merging requires human approval under branch protection.
- Log student PII.
- Disable tests or suppress type errors to make CI pass.
# Cursor Agent — API-Driven Setup (Honest Edition)

This repo is wired so a Cursor Background Agent runs on GitHub events with
**zero clicks in the Cursor dashboard** other than generating one API key.

## Why this approach

We tried the Cursor UI Automations path first. Two problems:
- Cursor's UI moves fast and the Custom Agent / Automations builder isn't
  consistently exposed across plans/versions.
- Cursor's webhook automation triggers have a confirmed server-side
  regression (Mar–Apr 2026) returning 500/401, with no workaround per
  Cursor's own forum.

The API-driven path bypasses both. Everything lives in
`.github/workflows/cursor-agent.yml` and is fully reproducible.

## One-time setup (5 minutes total)

### 1. Generate a Cursor API key

1. Open `cursor.com/dashboard` (you're already logged in)
2. Left nav → **Integrations**
3. Scroll to **API Keys** → **Create new key**
4. Name it `SJMS-2.5 GitHub Actions`
5. Copy the key (starts with `crsr_`) — shown once only

### 2. Add it as a GitHub repo secret

1. Open `github.com/RJK134/SJMS-2.5/settings/secrets/actions`
2. Click **New repository secret**
3. **Name:** `CURSOR_API_KEY`
4. **Secret:** paste the key from step 1
5. Click **Add secret**

### 3. Set a Cursor spending cap

1. `cursor.com/dashboard` → **Spending** (or **Billing & Invoices**) →
   **Edit Limit**
2. Set to a number you can afford to lose (e.g. **$25/month** — your current
   on-demand usage is around $64 which is high)
3. Enable email alerts at 50/80/100%

### That's it.

No custom agents to configure. No automations to build. The workflow uses the
agent persona and conventions from:
- `.cursor/agents/SJMS-Agent.md` (passed as part of the prompt context)
- `.cursor/rules/sjms-conventions.mdc` (read by the agent on each run)

## How it works

`.github/workflows/cursor-agent.yml` listens for:
| GitHub event | Agent action | Read-only? |
|---|---|---|
| PR opened/synchronize/reopened | Review the diff, suggest fixes | Yes (review only) |
| Issue labeled `cursor` or assigned to `cursor-agent` | Implement & open PR | No |
| Comment containing `@cursor` | Contextual response | Depends on phrasing |
| Check suite failure on a PR branch | Investigate logs, push fix commit | No |

The workflow:
1. **Routes** the event (`classify` job) to one of: review, implement, mention, ci-fix, skip
2. **Guards** against runaway cost (`guard` job) — skips PRs over 1500 lines
3. **Invokes** the Cursor API (`invoke` job) with the right prompt and model
4. **Comments back** on the PR/issue with the agent ID and tracking URL

## Read-only Q&A from the GitHub mobile app

Comments starting with these phrases are answered with a comment only — no
PR, no commits:

- `@cursor explain ...`
- `@cursor question: ...` / `@cursor q: ...`
- `@cursor what / why / how / where / when / which / who ...`
- `@cursor describe ...` / `@cursor summarise ...` / `@cursor summarize ...`
- `@cursor review (no fix) ...`
- `@cursor read-only: ...`

Reply `@cursor implement the above` to switch to action mode and open a PR.

## Model strategy

The auto-review and routine work uses **GPT-5.5** (your Pro+ plan includes
generous usage of it). Override per run via the *Cursor Agent (Manual
Dispatch)* workflow — Actions tab → Run workflow → pick a model.

**Available models (verified April 2026):**
- `gpt-5.5` (default — strong general coder)
- `claude-4.6-sonnet`
- `claude-4.7-opus` (expensive, sparingly)
- `composer-2` (Cursor's own model)
- `gemini-3.1-pro`
- `gpt-5.3-codex`

Auto mode is **not** exposed via API — the API requires an explicit model.

## How to use it day-to-day

- **Build a feature:** open an issue, add label `cursor`. Agent opens a PR.
- **Review a PR:** happens automatically on open / push.
- **Ask a question:** comment `@cursor explain ...` on any PR or issue.
- **Force a fix:** comment `@cursor fix the failing test`.
- **Manual run:** Actions → *Cursor Agent (Manual Dispatch)* → Run workflow.

## What the agent will NOT do

- Touch auth, session, RBAC, or Prisma migrations without flagging
  `requires-human-review`
- Disable tests or suppress type errors
- Log PII
- Merge its own PRs (branch protection requires human approval)

## Verifying it works

After adding `CURSOR_API_KEY`, run the test issue from
`test-issue-draft.md`. The workflow should:

1. Detect the `cursor` label
2. Validate the API key (`/v0/me`)
3. Launch a Background Agent on the issue
4. Comment back with the agent ID and tracking URL within ~30 seconds
5. The agent opens a PR within 5–15 minutes

If step 2 fails: API key is wrong or revoked.
If step 3 fails with HTTP 500: Cursor's API is having a flap (see
forum.cursor.com). Retry in 10 minutes.

## Cost guardrails

- 1500-line PR cap on auto-review (see `guard` job)
- Dependabot, github-actions[bot], and self-loops skipped
- Branch protection requires 1 human approval before any merge
- Model defaults to GPT-5.5 (not Opus)
- Manual dispatch shows a cost warning when Opus is selected
