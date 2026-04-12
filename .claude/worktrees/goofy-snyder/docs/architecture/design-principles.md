# 7 Design Principles

## 1. Best of Both Worlds
Combine 2.4's clean UI with 4.0's enterprise infrastructure. Neither discarded.

## 2. PostgreSQL as Foundation
Every piece of data persisted, transactional, queryable. Zero MemStorage.

## 3. Modular API Decomposition
37 domain modules. Clear boundaries. Assessment dev never navigates finance code.

## 4. Preserve Working UI
81 pages from 2.4 are the foundation. Changes limited to: data layer replacement + auth wiring.

## 5. Infrastructure as Code
`docker-compose up` gives full stack. All credentials in `.env`. Pin versions. Health checks.

## 6. Event-Driven Integration
Every mutation → webhook → n8n. No integration logic in Express routes.

## 7. Regulatory Compliance by Design
HESA, UKVI, GDPR, audit logging built into schema/middleware layers, not bolted on.
