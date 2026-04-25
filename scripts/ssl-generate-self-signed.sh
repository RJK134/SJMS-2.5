#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# SJMS 2.5 — Generate Self-Signed Certificate (staging/development only)
#
# Creates a self-signed certificate for local TLS testing.
# NOT suitable for production — browsers will show a security warning.
#
# Usage:
#   ./scripts/ssl-generate-self-signed.sh [domain]
#   Default domain: localhost
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

DOMAIN="${1:-localhost}"
DEST_DIR="docker/nginx/certs"

echo "Generating self-signed certificate for: ${DOMAIN}"

mkdir -p "$DEST_DIR"

openssl req -x509 -nodes -days 365 \
  -newkey rsa:2048 \
  -keyout "${DEST_DIR}/privkey.pem" \
  -out "${DEST_DIR}/fullchain.pem" \
  -subj "/CN=${DOMAIN}/O=SJMS 2.5 Development/C=GB" \
  -addext "subjectAltName=DNS:${DOMAIN},DNS:*.${DOMAIN},IP:127.0.0.1"

chmod 644 "${DEST_DIR}/fullchain.pem"
chmod 600 "${DEST_DIR}/privkey.pem"

echo ""
echo "✅ Self-signed certificate created:"
echo "   ${DEST_DIR}/fullchain.pem"
echo "   ${DEST_DIR}/privkey.pem"
echo "   Valid for: 365 days"
echo "   Domain:    ${DOMAIN}"
echo ""
echo "   Start the production stack with:"
echo "   docker compose -f docker-compose.yml -f docker/docker-compose.prod.yml up -d"
