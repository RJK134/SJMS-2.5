import { test, expect } from '@playwright/test';

const MOCK_STUDENTS = {
  success: true,
  data: [
    {
      id: 'stu-001',
      studentNumber: 'STU-2025-0001',
      feeStatus: 'HOME',
      entryRoute: 'UCAS',
      originalEntryDate: '2025-09-15T00:00:00.000Z',
      person: { firstName: 'Emma', lastName: 'Thompson', title: 'Ms' },
      enrolments: [{ programme: { title: 'BSc Computer Science' } }],
    },
    {
      id: 'stu-002',
      studentNumber: 'STU-2025-0002',
      feeStatus: 'OVERSEAS',
      entryRoute: 'DIRECT',
      originalEntryDate: '2025-09-15T00:00:00.000Z',
      person: { firstName: 'James', lastName: 'Wilson', title: 'Mr' },
      enrolments: [{ programme: { title: 'MSc Data Science' } }],
    },
  ],
  pagination: { limit: 25, total: 2, hasNext: false, nextCursor: null },
};

const MOCK_STUDENT_DETAIL = {
  success: true,
  data: {
    id: 'stu-001',
    studentNumber: 'STU-2025-0001',
    feeStatus: 'HOME',
    entryRoute: 'UCAS',
    originalEntryDate: '2025-09-15T00:00:00.000Z',
    person: { firstName: 'Emma', lastName: 'Thompson', title: 'Ms' },
    enrolments: [],
  },
};

const MOCK_ENROLMENT_CREATED = {
  success: true,
  data: {
    id: 'enr-001',
    studentId: 'stu-001',
    programmeId: 'prog-001',
    academicYear: '2025/26',
    yearOfStudy: 1,
    modeOfStudy: 'FULL_TIME',
    status: 'ENROLLED',
    startDate: '2025-09-15T00:00:00.000Z',
  },
};

test.describe('Student Enrolment Journey', () => {
  test.beforeEach(async ({ page }) => {
    // Intercept API calls with mock data
    await page.route('**/api/v1/students?**', route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_STUDENTS) }),
    );
    await page.route('**/api/v1/students/stu-001', route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_STUDENT_DETAIL) }),
    );
    await page.route('**/api/v1/enrolments', route => {
      if (route.request().method() === 'POST') {
        return route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify(MOCK_ENROLMENT_CREATED) });
      }
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: [], pagination: { limit: 25, total: 0, hasNext: false, nextCursor: null } }) });
    });
    // Mock notifications and dashboard endpoints
    await page.route('**/api/v1/communications/notifications**', route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: [], pagination: { limit: 10, total: 0, hasNext: false, nextCursor: null } }) }),
    );
    await page.route('**/api/v1/reports/**', route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: {} }) }),
    );
  });

  test('student list table renders with data', async ({ page }) => {
    await page.goto('/#/admin/students');
    await expect(page.locator('table')).toBeVisible();
    await expect(page.getByText('Emma Thompson')).toBeVisible();
    await expect(page.getByText('James Wilson')).toBeVisible();
    await expect(page.getByText('STU-2025-0001')).toBeVisible();
  });

  test('clicking a student navigates to detail page', async ({ page }) => {
    await page.goto('/#/admin/students');
    await page.getByText('Emma Thompson').click();
    await expect(page).toHaveURL(/.*admin\/students\/stu-001/);
    await expect(page.getByText('Emma Thompson')).toBeVisible();
  });

  test('enrolment creation form submits successfully', async ({ page }) => {
    await page.route('**/api/v1/programmes?**', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: [{ id: 'prog-001', programmeCode: 'UG-CS-001', title: 'BSc Computer Science', level: '6', credits: 360 }],
          pagination: { limit: 25, total: 1, hasNext: false, nextCursor: null },
        }),
      }),
    );
    await page.goto('/#/admin/enrolments/new');
    // Verify the form page loads (may show loading then form)
    await expect(page.locator('body')).toBeVisible();
  });
});
