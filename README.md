# SJMS 2.5 — Student Journey Management System

**Future Horizons Education**

A comprehensive UK Higher Education academic management platform for managing the complete student lifecycle — from application through enrolment, academic progression, assessment, and graduation.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Nginx (Reverse Proxy)                    │
│                     Ports 80 / 443                              │
├──────────┬──────────┬──────────┬──────────┬─────────────────────┤
│  Client  │   API    │ Keycloak │   n8n    │       MinIO         │
│  :5173   │  :3001   │  :8080   │  :5678   │    :9000/:9001      │
│  React   │ Express  │   IAM    │ Workflow │   Object Store      │
├──────────┴──────────┴──────────┴──────────┴─────────────────────┤
│                    PostgreSQL :5432                              │
│                      Redis :6379                                │
└─────────────────────────────────────────────────────────────────┘
```

### Tech Stack

| Layer          | Technology                                        |
| -------------- | ------------------------------------------------- |
| Frontend       | React 18, TypeScript, Tailwind CSS, shadcn/ui     |
| Backend        | Node.js, Express, TypeScript                      |
| Database       | PostgreSQL 16 with Prisma ORM                     |
| Cache          | Redis 7                                           |
| Auth           | Keycloak 24 (OIDC/SAML)                           |
| Object Storage | MinIO (S3-compatible)                              |
| Workflows      | n8n (automation & integrations)                   |
| Proxy          | Nginx                                              |
| Containers     | Docker Compose                                     |

### Key Modules

- **Admissions** — UCAS integration, application tracking, offers, CAS management
- **Enrolment** — Student registration, programme/module enrolment, fee assessment
- **Academic Records** — Programme structures, module management, academic calendar
- **Assessment** — Marks entry, exam boards, progression rules, award classification
- **Student Finance** — Tuition fees, SLC integration, payment tracking, bursaries
- **Timetabling** — Room booking, schedule generation, clash detection
- **Attendance** — Session tracking, engagement monitoring, alerts
- **Placements** — Work placement tracking, employer management, compliance
- **Student Support** — Extenuating circumstances, disability support, personal tutoring
- **Reporting** — HESA/OfS returns, dashboards, analytics, KPIs
- **Document Management** — Transcripts, letters, certificates (MinIO-backed)
- **Workflow Automation** — n8n-powered notifications, escalations, data sync

## Prerequisites

- Node.js >= 20.x
- Docker Desktop
- Git

## Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/RJK134/SJMS-2.5.git
cd SJMS-2.5

# 2. Copy environment file
cp .env.example .env
# Edit .env with your values

# 3. Start infrastructure services
docker-compose up -d postgres redis minio keycloak n8n

# 4. Install dependencies
npm install

# 5. Generate Prisma client
npm run prisma:generate

# 6. Run database migrations
npm run prisma:migrate

# 7. Start development servers
npm run dev:server   # API on http://localhost:3001
npm run dev:client   # Client on http://localhost:5173
```

### Full Docker Stack

```bash
docker-compose up -d          # Start all 8 services
docker-compose logs -f api    # Tail API logs
docker-compose down           # Stop everything
```

## Project Structure

```
sjms-2.5/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # UI components (shadcn/ui)
│   │   ├── contexts/       # React contexts (Auth, etc.)
│   │   ├── hooks/          # Custom hooks
│   │   ├── lib/            # API client, auth adapter
│   │   ├── pages/          # Route pages
│   │   └── assets/         # Static assets
│   └── Dockerfile
├── server/                 # Express API
│   ├── src/
│   │   ├── middleware/     # Auth, validation, error handling
│   │   ├── routes/         # API route handlers
│   │   ├── utils/          # Prisma, logger, errors, pagination
│   │   └── constants/      # Roles, enums
│   └── Dockerfile
├── prisma/                 # Database schema & migrations
├── docker/                 # Docker config (nginx.conf)
├── n8n-workflows/          # Exported n8n workflow JSON
├── scripts/                # Utility scripts
├── docs/                   # Documentation
├── docker-compose.yml      # Full service stack
├── .env.example            # Environment template
└── README.md               # This file
```

## API Health Check

```bash
curl http://localhost:3001/api/health
# → { "status": "ok", "version": "2.5.0", "timestamp": "..." }
```

## Portals

SJMS 2.5 provides role-based portal access:

| Portal      | Roles                                           |
| ----------- | ----------------------------------------------- |
| Admin       | System Admin, Registry, Finance, QA, Compliance |
| Academic    | Programme Leader, Module Leader, Tutor, Examiner |
| Student     | Enrolled students                                |
| Applicant   | Prospective students                             |

## License

Proprietary — Future Horizons Education. All rights reserved.
