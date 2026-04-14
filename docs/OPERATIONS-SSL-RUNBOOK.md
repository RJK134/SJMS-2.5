# SJMS 2.5 — Operations SSL Runbook

> **Last updated:** 2026-04-14
> **Scope:** TLS termination, certificate lifecycle, nginx security, admin access control

---

## 1. Architecture Overview

```
Internet
    │
    ▼ :80 / :443
┌───────────────────────────────────────────────┐
│                  Nginx                         │
│  HTTP :80 → ACME challenge only, else → HTTPS │
│  HTTPS :443 → TLS termination                 │
│                                                │
│  /api/*        → api:3001      (public)        │
│  /auth/*       → keycloak:8080 (public)        │
│  /auth/admin/* → keycloak:8080 (RESTRICTED)    │
│  /webhook/*    → n8n:5678      (public)        │
│  /n8n/*        → n8n:5678      (RESTRICTED)    │
│  /minio/*      → minio:9000    (RESTRICTED)    │
│  /metrics      → api:3001      (RESTRICTED)    │
│  /*            → client:80     (public)        │
└───────────────────────────────────────────────┘
                    │
    ┌───────────────┼───────────────┐
    ▼               ▼               ▼
┌────────┐    ┌──────────┐    ┌──────────┐
│ Client │    │   API    │    │ Keycloak │
│  :80   │    │  :3001   │    │  :8080   │
└────────┘    └────┬─────┘    └──────────┘
              ┌────┴────┐
         ┌────▼──┐  ┌──▼───┐
         │Postgres│  │Redis │
         │ :5432  │  │:6379 │
         └───────┘  └──────┘
         ┌───────┐  ┌──────┐
         │ MinIO │  │ n8n  │
         │ :9000 │  │:5678 │
         └───────┘  └──────┘
```

**RESTRICTED** paths are only accessible from private network ranges (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, 127.0.0.1). External requests receive 403 Forbidden.

---

## 2. Hostname and Domain Assumptions

| Variable | Purpose | Example |
|----------|---------|---------|
| `DOMAIN` | Primary hostname for the SJMS instance | `sjms.futurehorizons.ac.uk` |
| `CERTBOT_EMAIL` | Let's Encrypt account (expiry notifications) | `it-services@futurehorizons.ac.uk` |

DNS must resolve `DOMAIN` to the server's public IP before certificate issuance.

---

## 3. TLS Certificate Modes

SJMS supports two mutually compatible certificate sources. The nginx config reads certificates from fixed paths regardless of source.

### Mode A: Let's Encrypt (Automated)

Best for: staging environments, small institutions, internet-facing servers.

| Aspect | Detail |
|--------|--------|
| Certificate authority | Let's Encrypt (free, automated) |
| Validation method | HTTP-01 (webroot at `/var/www/certbot`) |
| Certificate lifetime | 90 days |
| Renewal | Automated via cron (certbot renew) |
| Wildcard support | No (HTTP-01 does not support wildcards) |
| Nginx cert path | `/etc/letsencrypt/live/${DOMAIN}/fullchain.pem` |
| Nginx key path | `/etc/letsencrypt/live/${DOMAIN}/privkey.pem` |

### Mode B: Institutional CA (Manual)

Best for: university production environments with centrally managed certificates (Jisc, GlobalSign, DigiCert via IT Services).

| Aspect | Detail |
|--------|--------|
| Certificate authority | Institutional or commercial CA |
| Validation method | Varies (DV, OV, or EV via CA) |
| Certificate lifetime | 1–3 years (varies by CA) |
| Renewal | Manual — replace files and reload nginx |
| Wildcard support | Yes (if CA supports) |
| Nginx cert path | `/etc/nginx/certs/fullchain.pem` |
| Nginx key path | `/etc/nginx/certs/privkey.pem` |

---

## 4. Let's Encrypt: First-Time Certificate Issuance

### Prerequisites
- Server has a public IP address
- DNS `A` record for `DOMAIN` points to that IP
- Port 80 is reachable from the internet (firewall open)
- Docker Compose stack running (nginx must be up to serve ACME challenge)

### Steps

```bash
# 1. Set environment variables
echo "DOMAIN=sjms.futurehorizons.ac.uk" >> .env
echo "CERTBOT_EMAIL=it-services@futurehorizons.ac.uk" >> .env

# 2. Start the stack (nginx needs to be running for ACME challenge)
docker compose -f docker-compose.yml -f docker/docker-compose.prod.yml up -d

# 3. Issue the certificate
./scripts/ssl-issue-letsencrypt.sh

# 4. Verify
curl -I https://${DOMAIN}/api/health
```

### What the script does
1. Verifies nginx is running
2. Runs certbot in webroot mode against `/var/www/certbot`
3. Creates symlinks from certbot output to nginx cert paths
4. Reloads nginx

---

## 5. Let's Encrypt: Renewal

Certbot only renews certificates within 30 days of expiry. The renewal script is safe to run frequently.

### Automated renewal (cron)

```bash
# Add to crontab (runs weekly at 03:00 Monday)
crontab -e
0 3 * * 1 cd /path/to/SJMS-2.5 && ./scripts/ssl-renew.sh >> /var/log/sjms-certbot-renew.log 2>&1
```

### Manual renewal

```bash
./scripts/ssl-renew.sh
```

### Verify renewal is working

```bash
# Check certificate expiry date
echo | openssl s_client -connect ${DOMAIN}:443 -servername ${DOMAIN} 2>/dev/null | openssl x509 -noout -dates
```

---

## 6. Institutional CA: Certificate Replacement

### Steps

```bash
# 1. Obtain certificate files from IT Services / CA
#    Required: fullchain.pem (server cert + intermediates) and privkey.pem

# 2. Install using the helper script (validates cert/key match)
./scripts/ssl-install-institutional.sh /path/to/fullchain.pem /path/to/privkey.pem

# 3. Verify
curl -I https://${DOMAIN}/api/health
openssl s_client -connect ${DOMAIN}:443 -servername ${DOMAIN} 2>/dev/null | openssl x509 -noout -subject -issuer -dates
```

### Manual installation (without script)

```bash
cp /path/to/fullchain.pem docker/nginx/certs/fullchain.pem
cp /path/to/privkey.pem   docker/nginx/certs/privkey.pem
chmod 644 docker/nginx/certs/fullchain.pem
chmod 600 docker/nginx/certs/privkey.pem
docker compose exec nginx nginx -s reload
```

### Renewal calendar

Institutional CA certificates typically last 1–3 years. Add the expiry date to the IT Services renewal calendar. Check current expiry:

```bash
openssl x509 -noout -enddate -in docker/nginx/certs/fullchain.pem
```

---

## 7. Rollback: Certificate Failure

If a certificate update breaks HTTPS:

### Option A: Revert to previous certificate

```bash
# If using institutional CA and you kept the previous files:
cp docker/nginx/certs/fullchain.pem.bak docker/nginx/certs/fullchain.pem
cp docker/nginx/certs/privkey.pem.bak   docker/nginx/certs/privkey.pem
docker compose exec nginx nginx -s reload
```

### Option B: Fall back to HTTP temporarily

```bash
# Switch nginx to the dev config (HTTP only, no TLS)
docker compose exec nginx sh -c "cp /etc/nginx/nginx.dev.conf /etc/nginx/nginx.conf && nginx -s reload"

# Or restart with the base compose only (no prod overlay)
docker compose down nginx
docker compose up -d nginx
```

### Option C: Generate emergency self-signed certificate

```bash
./scripts/ssl-generate-self-signed.sh ${DOMAIN}
docker compose exec nginx nginx -s reload
# Note: browsers will show a security warning with self-signed certs
```

---

## 8. Verifying TLS and Redirects

### HTTP → HTTPS redirect

```bash
# Should return 301 redirect to https://
curl -I http://${DOMAIN}/
# Expected: HTTP/1.1 301 Moved Permanently
#           Location: https://${DOMAIN}/
```

### HTTPS certificate verification

```bash
# Should show valid certificate chain
echo | openssl s_client -connect ${DOMAIN}:443 -servername ${DOMAIN} 2>/dev/null | openssl x509 -noout -subject -issuer -dates

# Check TLS version and cipher
echo | openssl s_client -connect ${DOMAIN}:443 -servername ${DOMAIN} 2>/dev/null | grep -E "Protocol|Cipher"
```

### Security header verification

```bash
curl -sI https://${DOMAIN}/ | grep -iE "strict-transport|x-frame|x-content|referrer|permissions"
# Expected:
#   Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
#   X-Frame-Options: DENY
#   X-Content-Type-Options: nosniff
#   Referrer-Policy: strict-origin-when-cross-origin
#   Permissions-Policy: geolocation=(), microphone=(), camera=()
```

### Reverse proxy routing

```bash
# API health
curl -s https://${DOMAIN}/api/health | python -m json.tool

# Keycloak realm
curl -s https://${DOMAIN}/auth/realms/fhe | python -m json.tool | head -5

# Client SPA (should return HTML)
curl -sI https://${DOMAIN}/ | head -5
```

---

## 9. Restricted Path Verification

### Keycloak admin console

```bash
# From external IP — should return 403
curl -sI https://${DOMAIN}/auth/admin/master/console/ | head -3
# Expected: HTTP/1.1 403 Forbidden

# From within Docker network — should return 200/302
docker compose exec api curl -sI http://nginx/auth/admin/master/console/ | head -3
```

### n8n admin UI

```bash
# From external IP — should return 403
curl -sI https://${DOMAIN}/n8n/ | head -3
# Expected: HTTP/1.1 403 Forbidden

# n8n webhooks should still be accessible (for workflow triggers)
curl -sI https://${DOMAIN}/webhook/sjms/test | head -3
# Expected: HTTP/1.1 404 or 200 (not 403)
```

### Prometheus metrics

```bash
# From external IP — should return 403
curl -sI https://${DOMAIN}/metrics | head -3
# Expected: HTTP/1.1 403 Forbidden
```

---

## 10. Monitoring and Alerting Recommendations

### Certificate expiry monitoring

```bash
# Cron check (alert if < 14 days remaining)
DAYS_LEFT=$(echo | openssl s_client -connect ${DOMAIN}:443 -servername ${DOMAIN} 2>/dev/null | openssl x509 -noout -checkend 1209600 2>/dev/null && echo "OK" || echo "EXPIRING")
if [ "$DAYS_LEFT" = "EXPIRING" ]; then
  echo "WARNING: SJMS TLS certificate expires within 14 days" | mail -s "SJMS Certificate Expiry Alert" ${CERTBOT_EMAIL}
fi
```

### Recommended monitoring stack

| Tool | Purpose |
|------|---------|
| Prometheus | Scrape `/metrics` endpoint for API performance |
| Grafana | Dashboard for HTTP latency, error rates, request volume |
| Uptime Kuma / Pingdom | External HTTPS health check with alerting |
| `certbot renew --deploy-hook` | Trigger notification on successful renewal |

### Key metrics to monitor

| Metric | Threshold | Alert |
|--------|-----------|-------|
| Certificate expiry | < 14 days | Email / Slack |
| API `/health` | Non-200 for > 60s | Page |
| Nginx error rate | > 5% 5xx responses | Email |
| Keycloak `/health/ready` | Non-UP for > 120s | Page |
| Docker container restarts | > 3 in 10 min | Email |

---

## 11. Development / Local Testing with TLS

For local development with TLS (e.g., testing Keycloak HTTPS callbacks):

```bash
# Generate self-signed cert for localhost
./scripts/ssl-generate-self-signed.sh localhost

# Start with production overlay
docker compose -f docker-compose.yml -f docker/docker-compose.prod.yml up -d

# Access (browser will show security warning)
# https://localhost/api/health
# https://localhost/auth/realms/fhe
```

---

## 12. Security Checklist

- [ ] TLS 1.2+ only (`TLSv1.0` and `TLSv1.1` disabled)
- [ ] HSTS header set with `max-age=63072000` (2 years)
- [ ] `X-Frame-Options: DENY` prevents clickjacking
- [ ] `X-Content-Type-Options: nosniff` prevents MIME sniffing
- [ ] `server_tokens off` hides nginx version
- [ ] Keycloak admin console restricted to private networks
- [ ] n8n admin UI restricted to private networks
- [ ] MinIO restricted to private networks
- [ ] Prometheus metrics restricted to private networks
- [ ] n8n webhook paths remain publicly accessible (required for workflow triggers)
- [ ] Private key file permissions set to 600
- [ ] No certificates or keys committed to git repository
