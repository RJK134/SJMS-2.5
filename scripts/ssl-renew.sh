#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# SJMS 2.5 — Let's Encrypt Certificate Renewal
#
# Run periodically via cron (recommended: weekly):
#   0 3 * * 1 cd /path/to/SJMS-2.5 && ./scripts/ssl-renew.sh >> /var/log/sjms-certbot-renew.log 2>&1
#
# Certbot only renews if the certificate is within 30 days of expiry.
# Nginx is reloaded after any renewal to pick up the new certificate.
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

echo "[$(date -u '+%Y-%m-%d %H:%M:%S UTC')] Starting certificate renewal check..."

# Attempt renewal (certbot skips if not due)
docker compose -f docker-compose.yml -f docker/docker-compose.prod.yml \
  --profile letsencrypt run --rm certbot renew --quiet

# Reload nginx to pick up any renewed certificates
docker compose exec nginx nginx -s reload

echo "[$(date -u '+%Y-%m-%d %H:%M:%S UTC')] Renewal check complete."
