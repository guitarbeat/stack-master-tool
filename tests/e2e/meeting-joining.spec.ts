import { test, expect } from '@playwright/test';

test.describe('Meeting Joining', () => {
  test('should show join form', async ({ page }) => {
    await page.goto('/join');
    
    // Check for join form elements
    await expect(page.locator('input[placeholder*="code" i], input[name="meetingCode"]')).toBeVisible();
    await expect(page.locator('input[placeholder*="name" i], input[name="participantName"]')).toBeVisible();
  });

  test('should show validation error for invalid meeting code', async ({ page }) => {
    await page.goto('/join');
    
    // Enter invalid meeting code
    await page.fill('input[placeholder*="code" i], input[name="meetingCode"]', 'INVALID');
    await page.fill('input[placeholder*="name" i], input[name="participantName"]', 'Test Participant');
    
    const joinButton = page.locator('button[type="submit"], button:has-text("Join")').first();
    await joinButton.click();
    
    // Should show validation error
    await expect(page.locator('text=6 characters, text=invalid')).toBeVisible();
  });

  test('should show error for non-existent meeting', async ({ page }) => {
    await page.goto('/join');
    
    // Enter valid format but non-existent meeting code
    await page.fill('input[placeholder*="code" i], input[name="meetingCode"]', 'NONEXISTENT');
    await page.fill('input[placeholder*="name" i], input[name="participantName"]', 'Test Participant');
    
    const joinButton = page.locator('button[type="submit"], button:has-text("Join")').first();
    await joinButton.click();
    
    // Should show error for non-existent meeting
    await expect(page.locator('text=not found, text=error')).toBeVisible();
  });
});