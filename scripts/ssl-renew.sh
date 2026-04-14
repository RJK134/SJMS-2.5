#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# SJMS 2.5 — Let's Encrypt Certificate Renewal
#
# Run periodically via cron (recommended: weekly):
#   0 3 * * 1 cd /path/to/SJMS-2.5 && ./scripts/ssl-renew.sh >> /var/log/sjms-certbot-renew.log 2>&1
#
# Certbot only renews if the certificate is within 30 days of expiry.
# After renewal, certificates are copied to the host-mounted nginx cert
# directory and nginx is reloaded.
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

# Load DOMAIN from .env
DOMAIN="localhost"
if [ -f .env ]; then
  _d=$(grep '^DOMAIN=' .env 2>/dev/null | head -1 | cut -d= -f2- || true)
  [ -n "$_d" ] && DOMAIN="$_d"
fi

echo "[$(date -u '+%Y-%m-%d %H:%M:%S UTC')] Starting certificate renewal check for ${DOMAIN}..."

# Attempt renewal (certbot skips if not due)
docker compose -f docker-compose.yml -f docker/docker-compose.prod.yml \
  --profile letsencrypt run --rm certbot renew --quiet

# Copy renewed certs to host-mounted nginx cert directory
# (nginx mounts docker/nginx/certs as read-only, so we extract via certbot container)
docker compose -f docker-compose.yml -f docker/docker-compose.prod.yml \
  --profile letsencrypt run --rm --entrypoint sh certbot -c \
  "cat /etc/letsencrypt/live/${DOMAIN}/fullchain.pem" > docker/nginx/certs/fullchain.pem

docker compose -f docker-compose.yml -f docker/docker-compose.prod.yml \
  --profile letsencrypt run --rm --entrypoint sh certbot -c \
  "cat /etc/letsencrypt/live/${DOMAIN}/privkey.pem" > docker/nginx/certs/privkey.pem

chmod 644 docker/nginx/certs/fullchain.pem
chmod 600 docker/nginx/certs/privkey.pem

# Reload nginx to pick up any renewed certificates
docker compose exec nginx nginx -s reload

echo "[$(date -u '+%Y-%m-%d %H:%M:%S UTC')] Renewal check complete."
