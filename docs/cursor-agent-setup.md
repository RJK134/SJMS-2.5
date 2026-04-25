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
