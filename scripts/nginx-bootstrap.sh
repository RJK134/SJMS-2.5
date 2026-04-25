#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# SJMS 2.5 — Nginx TLS Bootstrap
#
# Solves the chicken-and-egg problem:
#   nginx needs TLS certs to start → certbot needs nginx to serve ACME challenges
#
# This script generates a temporary self-signed certificate if no real cert
# exists, allowing nginx to start. Then certbot can issue a real certificate
# and nginx is reloaded.
#
# Run BEFORE 'docker compose up' on first deployment.
# Idempotent — skips if certs already exist.
#
# Usage:
#   ./scripts/nginx-bootstrap.sh
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

CERT_DIR="docker/nginx/certs"
CERT_FILE="${CERT_DIR}/fullchain.pem"
KEY_FILE="${CERT_DIR}/privkey.pem"

if [ -f "$CERT_FILE" ] && [ -f "$KEY_FILE" ]; then
  echo "✓ TLS certificates already exist at ${CERT_DIR}/ — skipping bootstrap."
  echo "  To force regeneration, delete the existing files first."
  exit 0
fi

echo "═══════════════════════════════════════════════════════════"
echo "  SJMS 2.5 — Nginx TLS Bootstrap"
echo "  No certificates found — generating temporary self-signed cert"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Load DOMAIN from .env if available (grep-based to avoid bash syntax issues)
DOMAIN="localhost"
if [ -f .env ]; then
  _d=$(grep '^DOMAIN=' .env 2>/dev/null | head -1 | cut -d= -f2- || true)
  [ -n "$_d" ] && DOMAIN="$_d"
fi

mkdir -p "$CERT_DIR"

# Write a minimal openssl config to a temp file so we avoid both
# MSYS path-mangling of -subj and missing openssl.cnf on Windows.
_tmpconf=$(mktemp)
cat > "$_tmpconf" <<SSLEOF
[req]
default_bits       = 2048
prompt             = no
distinguished_name = dn
x509_extensions    = v3_ext

[dn]
CN = ${DOMAIN}
O  = SJMS Bootstrap
C  = GB

[v3_ext]
subjectAltName = DNS:${DOMAIN},IP:127.0.0.1
SSLEOF

openssl req -x509 -nodes -days 30 \
  -newkey rsa:2048 \
  -keyout "$KEY_FILE" \
  -out "$CERT_FILE" \
  -config "$_tmpconf" \
  2>/dev/null

rm -f "$_tmpconf"

chmod 644 "$CERT_FILE"
chmod 600 "$KEY_FILE"

echo "✓ Temporary self-signed certificate generated for: ${DOMAIN}"
echo "  Valid for: 30 days (replace with real certificate before expiry)"
echo ""
echo "  Next steps:"
echo "  1. docker compose -f docker-compose.yml -f docker/docker-compose.prod.yml up -d"
echo "  2. ./scripts/ssl-issue-letsencrypt.sh   (for Let's Encrypt)"
echo "     OR"
echo "     ./scripts/ssl-install-institutional.sh cert.pem key.pem   (for institutional CA)"
echo ""
echo "  The temporary cert allows nginx to start with HTTPS enabled so that"
echo "  certbot can serve its HTTP-01 challenge on port 80."
