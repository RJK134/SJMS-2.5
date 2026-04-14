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

# Load env (grep-based to avoid bash syntax issues in .env)
if [ -f .env ]; then
  DOMAIN=$(grep '^DOMAIN=' .env 2>/dev/null | head -1 | cut -d= -f2-)
  CERTBOT_EMAIL=$(grep '^CERTBOT_EMAIL=' .env 2>/dev/null | head -1 | cut -d= -f2-)
fi

DOMAIN="${DOMAIN:?DOMAIN must be set in .env}"
EMAIL="${CERTBOT_EMAIL:?CERTBOT_EMAIL must be set in .env}"

echo "═══════════════════════════════════════════════════════════"
echo "  SJMS 2.5 — Let's Encrypt Certificate Issuance"
echo "  Domain: ${DOMAIN}"
echo "  Email:  ${EMAIL}"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Step 0: Bootstrap — generate temporary self-signed cert if none exists
# This solves the chicken-and-egg: nginx needs certs to start HTTPS,
# but certbot needs nginx running to serve ACME challenges.
echo "[0/5] Running TLS bootstrap..."
./scripts/nginx-bootstrap.sh

# Step 1: Ensure nginx is running (for ACME challenge)
echo "[1/5] Checking nginx is running..."
docker compose ps nginx | grep -q "Up" || {
  echo "  nginx not running — starting production stack..."
  docker compose -f docker-compose.yml -f docker/docker-compose.prod.yml up -d nginx
  echo "  Waiting 5 seconds for nginx to start..."
  sleep 5
}

# Step 2: Issue certificate via certbot webroot
echo "[2/5] Requesting certificate from Let's Encrypt..."
docker compose -f docker-compose.yml -f docker/docker-compose.prod.yml \
  --profile letsencrypt run --rm certbot certonly \
  --webroot -w /var/www/certbot \
  -d "${DOMAIN}" \
  --agree-tos \
  --email "${EMAIL}" \
  --non-interactive

# Step 3: Copy LE certs to the nginx cert path (overwriting bootstrap self-signed)
echo "[3/5] Installing certificates for nginx..."
docker compose exec nginx sh -c "
  ln -sf /etc/letsencrypt/live/${DOMAIN}/fullchain.pem /etc/nginx/certs/fullchain.pem 2>/dev/null || true
  ln -sf /etc/letsencrypt/live/${DOMAIN}/privkey.pem /etc/nginx/certs/privkey.pem 2>/dev/null || true
"

# Step 4: Reload nginx to pick up the real certificate
echo "[4/5] Reloading nginx..."
docker compose exec nginx nginx -s reload

# Step 5: Verify
echo "[5/5] Verifying certificate..."
echo | openssl s_client -connect "${DOMAIN}:443" -servername "${DOMAIN}" 2>/dev/null \
  | openssl x509 -noout -subject -issuer -dates 2>/dev/null \
  | sed 's/^/  /' || echo "  (Could not verify — check DNS and connectivity)"

echo ""
echo "✅ Certificate issued and nginx reloaded."
echo "   Verify: curl -I https://${DOMAIN}/api/health"
echo ""
echo "   Set up automatic renewal with:"
echo "   crontab -e"
echo "   0 3 * * 1 cd $(pwd) && ./scripts/ssl-renew.sh >> /var/log/sjms-certbot-renew.log 2>&1"
