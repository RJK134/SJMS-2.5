#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# SJMS 2.5 — Let's Encrypt Certificate Issuance
#
# Prerequisites:
#   - Docker Compose stack running (at minimum: nginx)
#   - DNS A record pointing DOMAIN to this server's public IP
#   - Port 80 open and reachable from the internet
#   - .env contains DOMAIN and CERTBOT_EMAIL
#
# Usage:
#   ./scripts/ssl-issue-letsencrypt.sh
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

# Load env
if [ -f .env ]; then
  set -a; source .env; set +a
fi

DOMAIN="${DOMAIN:?DOMAIN must be set in .env}"
EMAIL="${CERTBOT_EMAIL:?CERTBOT_EMAIL must be set in .env}"

echo "═══════════════════════════════════════════════════════════"
echo "  SJMS 2.5 — Let's Encrypt Certificate Issuance"
echo "  Domain: ${DOMAIN}"
echo "  Email:  ${EMAIL}"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Step 1: Ensure nginx is running (for ACME challenge)
echo "[1/4] Checking nginx is running..."
docker compose ps nginx | grep -q "Up" || {
  echo "ERROR: nginx is not running. Start with: docker compose up -d nginx"
  exit 1
}

# Step 2: Issue certificate via certbot webroot
echo "[2/4] Requesting certificate from Let's Encrypt..."
docker compose -f docker-compose.yml -f docker/docker-compose.prod.yml \
  --profile letsencrypt run --rm certbot certonly \
  --webroot -w /var/www/certbot \
  -d "${DOMAIN}" \
  --agree-tos \
  --email "${EMAIL}" \
  --non-interactive

# Step 3: Create symlinks so nginx can find the certs at the expected paths
echo "[3/4] Linking certificates for nginx..."
docker compose exec nginx sh -c "
  ln -sf /etc/letsencrypt/live/${DOMAIN}/fullchain.pem /etc/nginx/certs/fullchain.pem 2>/dev/null || true
  ln -sf /etc/letsencrypt/live/${DOMAIN}/privkey.pem /etc/nginx/certs/privkey.pem 2>/dev/null || true
"

# Step 4: Reload nginx to pick up new certificate
echo "[4/4] Reloading nginx..."
docker compose exec nginx nginx -s reload

echo ""
echo "✅ Certificate issued and nginx reloaded."
echo "   Verify: curl -I https://${DOMAIN}/api/health"
echo ""
echo "   Set up automatic renewal with:"
echo "   crontab -e"
echo "   0 3 * * 1 cd $(pwd) && ./scripts/ssl-renew.sh >> /var/log/sjms-certbot-renew.log 2>&1"
