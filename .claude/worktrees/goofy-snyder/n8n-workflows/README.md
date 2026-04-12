# SJMS 2.5 — n8n Workflows

15 production workflows triggered by API webhook events.

## Setup

1. Import each JSON file into n8n via **Workflows > Import from File**.
2. Set the `INTERNAL_SERVICE_KEY` environment variable in n8n to match the API server's key.
3. Activate each workflow after import.

## Authentication

Workflows authenticate to the SJMS API using the `X-Internal-Service-Key` header.
The key is read from the n8n environment variable `INTERNAL_SERVICE_KEY`.

**Production deployments MUST override the default dev key** with a cryptographically
random string of at least 64 characters. Generate one with:

```bash
openssl rand -hex 32
```

Set it in `.env` as `INTERNAL_SERVICE_KEY=<your-key>` and ensure both the API and n8n
containers receive the same value via docker-compose.

## Workflows

| # | Name | Trigger | Events |
|---|------|---------|--------|
| 01 | Student Enrolment Notification | Webhook | enrolments.created |
| 02 | Application Status Change | Webhook | applications.updated |
| 03 | Marks Released Notification | Webhook | marks.updated |
| 04 | Attendance Alert Escalation | Webhook | attendance.created |
| 05 | UKVI Compliance Monitor | Webhook | ukvi.updated |
| 06 | Payment Received Confirmation | Webhook | finance.updated |
| 07 | EC Claim Submitted | Webhook | ec_claims.created |
| 08 | Document Upload Verification | Webhook | documents.created |
| 09 | Exam Board Decision Notification | Webhook | exam_boards.updated |
| 10 | Offer Made to Applicant | Webhook | offers.created |
| 11 | Enrolment Status Change Handler | Webhook | enrolments.updated |
| 12 | Module Registration Confirmed | Webhook | module_registrations.created |
| 13 | Assessment Deadline Reminder | Daily schedule | (polls /v1/assessments) |
| 14 | Support Ticket Assignment | Webhook | support.created |
| 15 | Programme Approval Routing | Webhook | programme_approvals.created |
