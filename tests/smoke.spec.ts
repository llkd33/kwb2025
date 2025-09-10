import { test, expect } from '@playwright/test';

test.describe('Smoke', () => {
  test('loads home and shows service name', async ({ page }) => {
    await page.goto('/');
    // Expect the brand initials and service name to be visible
    await expect(page.getByText('NB')).toBeVisible();
    // The localized service name should render somewhere on the page
    await expect(page.getByText(/KnowWhere Bridge|노웨어브릿지|Nowhere Bridge/i)).toBeTruthy();
  });

  test('navigates to About and Services', async ({ page, isMobile }) => {
    await page.goto('/');
    
    // On mobile, first open the mobile menu
    if (isMobile) {
      // Look for the hamburger menu button - it's in a nav element and has an SVG
      const menuButton = page.locator('nav button').last();
      await menuButton.click();
      // Wait for mobile menu to be visible
      await page.waitForSelector('.fixed.inset-0', { timeout: 5000 });
    }
    
    // Click the About link - on mobile it's in the mobile menu, on desktop in the nav
    const aboutLink = isMobile 
      ? page.locator('.fixed.inset-0').getByRole('link', { name: /소개|About/i })
      : page.getByRole('navigation').getByRole('link', { name: /소개|About/i });
    await aboutLink.click();
    await expect(page).toHaveURL(/\/about$/);

    // If on mobile, open menu again for the next navigation
    if (isMobile) {
      const menuButton = page.locator('nav button').last();
      await menuButton.click();
      await page.waitForSelector('.fixed.inset-0', { timeout: 5000 });
    }

    // Click the Services link
    const servicesLink = isMobile 
      ? page.locator('.fixed.inset-0').getByRole('link', { name: /서비스|Services/i })
      : page.getByRole('navigation').getByRole('link', { name: /서비스|Services/i });
    await servicesLink.click();
    await expect(page).toHaveURL(/\/services$/);
  });
});

