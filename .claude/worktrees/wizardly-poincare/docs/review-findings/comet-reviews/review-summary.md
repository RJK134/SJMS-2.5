# Comet Browser Review Summary (April 2026)

## Review 1: Frontend Integrity

1. **Mock Data Contamination (26/57 staff pages):** URL prefix bug → API fails silently → fallback serves hardcoded data. 45% of staff portal was fabricated.
2. **14 pages with backend gaps:** Correct API calls but 501/empty responses → mock fallback.
3. **Data inconsistencies:** List totals vs detail totals differ (some views query DB, others cached/mock).

## Review 2: Backend Architecture

1. **Placeholder n8n workflows:** All 44 reference `http://placeholder-api:3000`. None production-connected.
2. **Schema gaps:** Flat Person, flat Mark, basic Fee, no explicit HESA Data Futures entities.
3. **56 P-series findings:** P1-15 UI/UX, P16-30 functional gaps, P31-45 data inconsistencies, P46-56 security.
4. **Docker race conditions:** No health checks, improper service ordering.

## Lessons for 2.5
1. Never ship mock data fallbacks — show error states, not fake data
2. Verify every page against real API — automated E2E, not spot-checks
3. n8n workflows must use real endpoints — test end-to-end
4. Multi-tool code review (Cursor + Copilot + manual)
