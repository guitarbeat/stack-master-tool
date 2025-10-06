import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should load the homepage successfully', async ({ page }) => {
    await page.goto('/');
    
    // Check that the page loads without errors
    await expect(page).toHaveTitle(/Stack Facilitation/);
    
    // Check for key elements on the homepage
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should navigate to host meeting page', async ({ page }) => {
    await page.goto('/');
    
    // Look for host meeting button/link
    const createButton = page.locator('a[href="/meeting?mode=host"], button:has-text("Start Hosting")').first();
    await expect(createButton).toBeVisible();
    
    await createButton.click();
    await expect(page).toHaveURL(/.*\/meeting\?mode=host/);
  });

  test('should navigate to join meeting page', async ({ page }) => {
    await page.goto('/');
    
    // Look for join meeting button/link
    const joinButton = page.locator('a[href="/meeting?mode=join"], button:has-text("Join Meeting")').first();
    await expect(joinButton).toBeVisible();
    
    await joinButton.click();
    await expect(page).toHaveURL(/.*\/meeting\?mode=join/);
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Check that the page is responsive
    await expect(page.locator('h1')).toBeVisible();
  });
});