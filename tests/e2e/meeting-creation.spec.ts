import { test, expect } from '@playwright/test';

test.describe('Meeting Creation', () => {
  test('should create a meeting successfully', async ({ page }) => {
    await page.goto('/create');
    
    // Fill in the form
    await page.fill('input[name="facilitatorName"], input[placeholder*="name" i]', 'Test Facilitator');
    await page.fill('input[name="meetingTitle"], input[placeholder*="title" i]', 'Test Meeting');
    
    // Submit the form
    const submitButton = page.locator('button[type="submit"], button:has-text("Create")').first();
    await expect(submitButton).toBeVisible();
    await submitButton.click();
    
    // Should redirect to facilitator view or show success
    await expect(page).toHaveURL(/.*\/facilitate\/|.*\/meeting\//);
  });

  test('should show validation errors for empty fields', async ({ page }) => {
    await page.goto('/create');
    
    // Try to submit without filling fields
    const submitButton = page.locator('button[type="submit"], button:has-text("Create")').first();
    await submitButton.click();
    
    // Should show validation errors
    await expect(page.locator('text=required, text=invalid')).toBeVisible();
  });

  test('should show validation errors for invalid input', async ({ page }) => {
    await page.goto('/create');
    
    // Fill with invalid data
    await page.fill('input[name="facilitatorName"], input[placeholder*="name" i]', '');
    await page.fill('input[name="meetingTitle"], input[placeholder*="title" i]', 'A'.repeat(101));
    
    const submitButton = page.locator('button[type="submit"], button:has-text("Create")').first();
    await submitButton.click();
    
    // Should show validation errors
    await expect(page.locator('text=required, text=too long')).toBeVisible();
  });
});