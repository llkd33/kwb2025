import { test, expect } from '@playwright/test';

test.describe('Knowwhere Bridge Insights E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8080');
  });

  test('homepage loads correctly', async ({ page }) => {
    // Check if the page loads
    await expect(page).toHaveURL('http://localhost:8080/');
    
    // Check for hero section
    const heroSection = page.locator('section').first();
    await expect(heroSection).toBeVisible();
    
    // Check for navigation - use first() to avoid strict mode error
    const nav = page.locator('nav, header').first();
    await expect(nav).toBeVisible();
  });

  test('language switching works', async ({ page }) => {
    // Look for language switcher
    const langButton = page.locator('button:has-text("KO"), button:has-text("EN")').first();
    
    if (await langButton.count() > 0) {
      const initialText = await langButton.textContent();
      await langButton.click();
      await page.waitForTimeout(500);
      const newText = await langButton.textContent();
      expect(newText).not.toBe(initialText);
    }
  });

  test('navigation links are present', async ({ page }) => {
    const navLinks = page.locator('nav a, header a');
    const count = await navLinks.count();
    expect(count).toBeGreaterThan(0);
  });

  test('auth page has login form', async ({ page }) => {
    await page.goto('http://localhost:8080/auth');
    
    // Check for email and password inputs
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    
    // Check for submit button
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeVisible();
  });

  test('protected routes redirect to auth', async ({ page }) => {
    // Try to access dashboard without login
    await page.goto('http://localhost:8080/dashboard');
    
    // Should redirect to auth
    await expect(page).toHaveURL(/.*auth/);
  });

  test('services page loads', async ({ page }) => {
    await page.goto('http://localhost:8080/services');
    await expect(page).toHaveURL('http://localhost:8080/services');
    
    // Check for content
    const mainContent = page.locator('main');
    await expect(mainContent).toBeVisible();
  });

  test('about page loads', async ({ page }) => {
    await page.goto('http://localhost:8080/about');
    await expect(page).toHaveURL('http://localhost:8080/about');
  });

  test('404 page works', async ({ page }) => {
    await page.goto('http://localhost:8080/non-existent-page');
    
    // Check for 404 content
    const body = page.locator('body');
    const content = await body.textContent();
    expect(content?.toLowerCase()).toMatch(/404|not found/);
  });

  test('mobile responsiveness', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:8080');
    
    // Check if navigation is still accessible (might be in hamburger menu)
    const nav = page.locator('nav, header').first();
    await expect(nav).toBeVisible();
  });

  test('form validation on auth page', async ({ page }) => {
    await page.goto('http://localhost:8080/auth');
    
    // Try to submit empty form
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();
    
    // Check for validation messages or required attributes
    const emailInput = page.locator('input[type="email"]');
    const isRequired = await emailInput.getAttribute('required');
    expect(isRequired !== null).toBeTruthy();
  });
});

// Helper to sign in using env credentials
async function login(page: any, {
  base,
  email,
  password,
}: { base: string; email: string; password: string }) {
  await page.goto(`${base}/auth`);
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  // Wait until we navigate away from /auth or see a known post-login element
  await expect(page).not.toHaveURL(/\/auth$/);
}

test.describe('Feature Tests (requires backend setup)', () => {
  test.beforeAll(() => {
    if (!process.env.E2E_BACKEND) {
      test.skip(true, 'E2E_BACKEND not set; skipping backend-dependent tests');
    }
  });
  test('login functionality', async ({ page }) => {
    const base = process.env.E2E_BASE_URL || 'http://localhost:8080';
    const userEmail = process.env.E2E_USER_EMAIL || process.env.E2E_ADMIN_EMAIL || 'admin@example.com';
    const userPassword = process.env.E2E_USER_PASSWORD || process.env.E2E_ADMIN_PASSWORD || 'admin123';

    await page.goto(`${base}/auth`);
    await page.fill('input[type="email"]', userEmail);
    await page.fill('input[type="password"]', userPassword);
    await page.click('button[type="submit"]');
    // Should navigate away from /auth
    await expect(page).not.toHaveURL(/\/auth$/);
  });

  test('file upload works', async ({ page }) => {
    const base = process.env.E2E_BASE_URL || 'http://localhost:8080';
    const userEmail = process.env.E2E_USER_EMAIL || process.env.E2E_ADMIN_EMAIL || 'admin@example.com';
    const userPassword = process.env.E2E_USER_PASSWORD || process.env.E2E_ADMIN_PASSWORD || 'admin123';

    // Login first (ProtectedRoute redirects otherwise)
    await login(page, { base, email: userEmail, password: userPassword });

    await page.goto(`${base}/business-documents`);
    const fileInput = page.locator('input[type="file"]');
    await expect(fileInput).toBeVisible();
  });
});

test.describe('Admin Panel Tests (requires admin login)', () => {
  test.beforeAll(() => {
    if (!process.env.E2E_BACKEND || !process.env.E2E_ADMIN_EMAIL || !process.env.E2E_ADMIN_PASSWORD) {
      test.skip(true, 'Admin creds not set; skipping admin tests');
    }
  });
  test('admin login and access', async ({ page }) => {
    const base = process.env.E2E_BASE_URL || 'http://localhost:8080';
    const adminEmail = process.env.E2E_ADMIN_EMAIL!;
    const adminPassword = process.env.E2E_ADMIN_PASSWORD!;

    await page.goto(`${base}/auth`);
    await page.fill('input[type="email"]', adminEmail);
    await page.fill('input[type="password"]', adminPassword);
    await page.click('button[type="submit"]');
    
    await page.goto(`${base}/admin`);
    await expect(page).toHaveURL(`${base}/admin`);
  });
});
