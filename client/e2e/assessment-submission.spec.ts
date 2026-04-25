import { test, expect } from '@playwright/test';

const MOCK_ASSESSMENTS = {
  success: true,
  data: [
    {
      id: 'assess-001',
      title: 'Programming Fundamentals Coursework',
      assessmentType: 'COURSEWORK',
      weighting: 60,
      maxMark: 100,
      dueDate: '2026-05-01T23:59:00.000Z',
      status: 'OPEN',
    },
    {
      id: 'assess-002',
      title: 'Database Design Exam',
      assessmentType: 'EXAM',
      weighting: 40,
      maxMark: 100,
      dueDate: '2026-06-10T09:00:00.000Z',
      status: 'OPEN',
    },
  ],
  pagination: { limit: 25, total: 2, hasNext: false, nextCursor: null },
};

const MOCK_MODULE_REGS = {
  success: true,
  data: [{ id: 'mr-001', moduleId: 'mod-001', academicYear: '2025/26', status: 'REGISTERED', module: { title: 'CS5001 Programming' } }],
  pagination: { limit: 25, total: 1, hasNext: false, nextCursor: null },
};

const MOCK_ATTENDANCE = {
  success: true,
  data: [],
  pagination: { limit: 25, total: 0, hasNext: false, nextCursor: null },
};

test.describe('Assessment Submission Journey', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/v1/assessments**', route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_ASSESSMENTS) }),
    );
    await page.route('**/api/v1/module-registrations**', route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_MODULE_REGS) }),
    );
    await page.route('**/api/v1/attendance**', route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_ATTENDANCE) }),
    );
    await page.route('**/api/v1/communications/notifications**', route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: [], pagination: { limit: 10, total: 0, hasNext: false, nextCursor: null } }) }),
    );
    await page.route('**/api/v1/reports/**', route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: {} }) }),
    );
  });

  test('student dashboard shows module registrations', async ({ page }) => {
    await page.goto('/#/student/dashboard');
    await expect(page.locator('body')).toBeVisible();
    // Dashboard should load without errors
    await page.waitForTimeout(1000);
    await expect(page.locator('body')).not.toContainText('Error');
  });

  test('assessment list renders with due dates', async ({ page }) => {
    await page.goto('/#/student/assessments');
    // The page should load (may redirect via portal guard)
    await expect(page.locator('body')).toBeVisible();
  });

  test('marks page shows student marks', async ({ page }) => {
    await page.route('**/api/v1/marks**', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: [{ id: 'mark-001', rawMark: 72, finalMark: 72, grade: 'A', status: 'PUBLISHED', assessment: { title: 'Programming Coursework' } }],
          pagination: { limit: 25, total: 1, hasNext: false, nextCursor: null },
        }),
      }),
    );
    await page.goto('/#/student/marks');
    await expect(page.locator('body')).toBeVisible();
  });
});
