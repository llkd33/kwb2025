import { test, expect } from '@playwright/test';

test.describe('Navigation bar', () => {
  test('shows base links and language selector', async ({ page }) => {
    await page.goto('/');
    // Base nav
    await expect(page.getByRole('link', { name: /홈|Home/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /소개|About/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /서비스|Services/i })).toBeVisible();
    // Language selector button exists
    await expect(page.getByRole('button', { name: /Language|언어|言語/i })).toBeTruthy();
  });
});

