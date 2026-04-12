# Remediation: Mock Data Elimination

Context: 26/57 staff pages in SJMS 4.0 served hardcoded mock data due to URL prefix bug. 14 more had backend gaps.

Claude Prompt:
ROLE: REMEDIATION_ENGINEER
TASK: Eliminate ALL mock/placeholder/fallback data patterns from the codebase.

1. Search entire codebase for mockData, fallbackData, dummyData, sampleData, placeholder data, MOCK_, TODO mock
2. For each match: if backend endpoint exists wire to real API; if missing implement it; if empty show proper empty state
3. Remove all mock data files/objects
4. Add ESLint rule to prevent future mock imports in production code
5. Verify: every page makes real API calls (check Network tab)

ACCEPTANCE: grep for mock/fallback/dummy/placeholder in client/src/ and server/src/ returns ZERO results (excluding test files)
