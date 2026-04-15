-- SJMS 2.5 — PostgreSQL schema initialisation
-- Executed automatically by postgres on first boot (empty data volume only).
-- Keycloak requires its own schema; the SJMS application uses sjms_app.

CREATE SCHEMA IF NOT EXISTS keycloak;
GRANT ALL ON SCHEMA keycloak TO sjms;
