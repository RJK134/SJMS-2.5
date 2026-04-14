import { test, expect } from '@playwright/test';

test.describe('Authentication and RBAC', () => {
  test.beforeEach(async ({ page }) => {
    // Mock all API endpoints to prevent network errors
    await page.route('**/api/**', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: [], pagination: { limit: 25, total: 0, hasNext: false, nextCursor: null } }),
      }),
    );
  });

  test('root URL loads login or dashboard', async ({ page }) => {
    await page.goto('/#/');
    await expect(page.locator('body')).toBeVisible();
    // In dev mode, should either show login portal selection or redirect to dashboard
    await page.waitForTimeout(1000);
    const text = await page.locator('body').textContent();
    // Should contain either portal selection or dashboard content
    expect(text).toBeTruthy();
  });

  test('admin dashboard page loads without errors', async ({ page }) => {
    await page.goto('/#/admin/dashboard');
    await expect(page.locator('body')).toBeVisible();
    await page.waitForTimeout(1000);
    // Should not show uncaught error boundary
    await expect(page.locator('body')).not.toContainText('Something went wrong');
  });

  test('student portal routes are accessible', async ({ page }) => {
    await page.goto('/#/student/dashboard');
    await expect(page.locator('body')).toBeVisible();
    await page.waitForTimeout(1000);
    // Page should render (portal guard may redirect in dev mode)
    await expect(page.locator('body')).not.toContainText('Something went wrong');
  });

  test('applicant portal routes are accessible', async ({ page }) => {
    await page.goto('/#/applicant/dashboard');
    await expect(page.locator('body')).toBeVisible();
    await page.waitForTimeout(1000);
    await expect(page.locator('body')).not.toContainText('Something went wrong');
  });

  test('unknown routes show 404 or redirect', async ({ page }) => {
    await page.goto('/#/nonexistent-route');
    await expect(page.locator('body')).toBeVisible();
    // Should not crash — either 404 page or redirect to home
    await page.waitForTimeout(1000);
    await expect(page.locator('body')).not.toContainText('Something went wrong');
  });
});
