#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# SJMS 2.5 — Institutional CA Certificate Installation
#
# Use this script when TLS certificates are provided by an institutional CA
# (e.g., Jisc, university IT services, or a commercial CA).
#
# Prerequisites:
#   - Certificate file (PEM format, full chain)
#   - Private key file (PEM format, unencrypted)
#
# Usage:
#   ./scripts/ssl-install-institutional.sh /path/to/fullchain.pem /path/to/privkey.pem
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

if [ $# -ne 2 ]; then
  echo "Usage: $0 <fullchain.pem> <privkey.pem>"
  echo ""
  echo "  fullchain.pem — Full certificate chain (server cert + intermediate CAs)"
  echo "  privkey.pem   — Private key (PEM format, unencrypted)"
  exit 1
fi

CERT_FILE="$1"
KEY_FILE="$2"
DEST_DIR="docker/nginx/certs"

# Validate files exist
[ -f "$CERT_FILE" ] || { echo "ERROR: Certificate file not found: $CERT_FILE"; exit 1; }
[ -f "$KEY_FILE" ]  || { echo "ERROR: Key file not found: $KEY_FILE"; exit 1; }

echo "═══════════════════════════════════════════════════════════"
echo "  SJMS 2.5 — Institutional CA Certificate Installation"
echo "  Certificate: ${CERT_FILE}"
echo "  Key:         ${KEY_FILE}"
echo "  Destination: ${DEST_DIR}/"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Validate the certificate and key match
CERT_MOD=$(openssl x509 -noout -modulus -in "$CERT_FILE" 2>/dev/null | openssl md5)
KEY_MOD=$(openssl rsa -noout -modulus -in "$KEY_FILE" 2>/dev/null | openssl md5)

if [ "$CERT_MOD" != "$KEY_MOD" ]; then
  echo "ERROR: Certificate and key do not match (modulus mismatch)."
  echo "  Cert modulus hash: ${CERT_MOD}"
  echo "  Key modulus hash:  ${KEY_MOD}"
  exit 1
fi
echo "[1/4] Certificate and key validated (modulus match)."

# Show certificate details
echo "[2/4] Certificate details:"
openssl x509 -noout -subject -issuer -dates -in "$CERT_FILE" | sed 's/^/  /'
echo ""

# Copy to destination
echo "[3/4] Installing to ${DEST_DIR}/..."
mkdir -p "$DEST_DIR"
cp "$CERT_FILE" "${DEST_DIR}/fullchain.pem"
cp "$KEY_FILE"  "${DEST_DIR}/privkey.pem"
chmod 644 "${DEST_DIR}/fullchain.pem"
chmod 600 "${DEST_DIR}/privkey.pem"

# Reload nginx if running
echo "[4/4] Reloading nginx..."
docker compose exec nginx nginx -s reload 2>/dev/null && echo "  nginx reloaded." || echo "  nginx not running — reload when stack is started."

echo ""
echo "✅ Institutional certificate installed."
echo "   Verify: curl -I https://\$(grep DOMAIN .env | cut -d= -f2)/api/health"
echo ""
echo "   Note: Add certificate expiry date to your renewal calendar."
openssl x509 -noout -enddate -in "$CERT_FILE" | sed 's/^/   /'
