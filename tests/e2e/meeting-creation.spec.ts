import { test, expect } from '@playwright/test';

test.describe('Meeting Creation', () => {
  test('should create a meeting successfully and show success page', async ({ page }) => {
    await page.goto('/meeting?mode=host');
    
    // Fill in the form
    await page.fill('input[placeholder="Enter meeting name"]', 'Test Meeting');
    await page.fill('input[placeholder="Enter your name"]', 'Test Facilitator');
    
    // Submit the form
    const submitButton = page.locator('button[type="submit"]:has-text("Host Meeting")');
    await expect(submitButton).toBeVisible();
    await submitButton.click();
    
    // Wait for loading to complete
    await expect(page.locator('text=Hosting Meeting...')).not.toBeVisible({ timeout: 10000 });
    
    // Should show success page with meeting code
    await expect(page.locator('text=Meeting Created!')).toBeVisible();
    await expect(page.locator('text=Meeting Code')).toBeVisible();
    
    // Should show a 6-character meeting code
    const meetingCodeElement = page.locator('text=/[A-Z0-9]{6}/').first();
    await expect(meetingCodeElement).toBeVisible();
    
    // Should show shareable link
    await expect(page.locator('text=Shareable Link')).toBeVisible();
    
    // Should show QR code
    await expect(page.locator('img[alt*="QR code"]')).toBeVisible({ timeout: 5000 });
    
    // Should have start meeting button
    await expect(page.locator('button:has-text("Start meeting")')).toBeVisible();
  });

  test('should show validation errors for empty fields', async ({ page }) => {
    await page.goto('/meeting?mode=host');
    
    // Try to submit without filling fields
    const submitButton = page.locator('button[type="submit"], button:has-text("Host Meeting")').first();
    await submitButton.click();
    
    // Should show validation errors (browser native validation)
    const facilitatorInput = page.locator('input[placeholder="Enter your name"]');
    const titleInput = page.locator('input[placeholder="Enter meeting name"]');
    
    await expect(facilitatorInput).toHaveAttribute('required');
    await expect(titleInput).toHaveAttribute('required');
  });

  test('should show validation errors for invalid input', async ({ page }) => {
    await page.goto('/meeting?mode=host');
    
    // Fill with invalid data
    await page.fill('input[placeholder="Enter your name"]', '');
    await page.fill('input[placeholder="Enter meeting name"]', 'A'.repeat(101));
    
    const submitButton = page.locator('button[type="submit"], button:has-text("Host Meeting")').first();
    await submitButton.click();
    
    // Should show validation errors (browser native validation)
    const facilitatorInput = page.locator('input[placeholder="Enter your name"]');
    const titleInput = page.locator('input[placeholder="Enter meeting name"]');
    
    await expect(facilitatorInput).toHaveAttribute('required');
    await expect(titleInput).toHaveAttribute('required');
  });

  test('should handle server errors gracefully', async ({ page }) => {
    // Mock server error
    await page.route('**/api/meetings', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Internal server error',
          code: 'INTERNAL_SERVER_ERROR'
        })
      });
    });

    await page.goto('/meeting?mode=host');
    
    // Fill in the form
    await page.fill('input[placeholder="Enter meeting name"]', 'Test Meeting');
    await page.fill('input[placeholder="Enter your name"]', 'Test Facilitator');
    
    // Submit the form
    const submitButton = page.locator('button[type="submit"], button:has-text("Create Meeting")').first();
    await submitButton.click();
    
    // Should show error message
    await expect(page.locator('text=Internal server error, text=Failed to create meeting')).toBeVisible();
  });

  test('should copy meeting code to clipboard', async ({ page }) => {
    await page.goto('/meeting?mode=host');
    
    // Fill in the form
    await page.fill('input[placeholder="Enter meeting name"]', 'Test Meeting');
    await page.fill('input[placeholder="Enter your name"]', 'Test Facilitator');
    
    // Submit the form
    const submitButton = page.locator('button[type="submit"], button:has-text("Create Meeting")').first();
    await submitButton.click();
    
    // Wait for success page
    await expect(page.locator('text=Your meeting is ready!')).toBeVisible();
    
    // Click copy code button
    const copyButton = page.locator('button:has-text("Copy Code")');
    await copyButton.click();
    
    // Should show success toast
    await expect(page.locator('text=Copied to clipboard')).toBeVisible();
  });

  test('should copy shareable link to clipboard', async ({ page }) => {
    await page.goto('/meeting?mode=host');
    
    // Fill in the form
    await page.fill('input[placeholder="Enter meeting name"]', 'Test Meeting');
    await page.fill('input[placeholder="Enter your name"]', 'Test Facilitator');
    
    // Submit the form
    const submitButton = page.locator('button[type="submit"], button:has-text("Create Meeting")').first();
    await submitButton.click();
    
    // Wait for success page
    await expect(page.locator('text=Your meeting is ready!')).toBeVisible();
    
    // Click copy link button
    const copyLinkButton = page.locator('button:has-text("Copy")').last();
    await copyLinkButton.click();
    
    // Should show success toast
    await expect(page.locator('text=Copied to clipboard')).toBeVisible();
  });

  test('should navigate to facilitator view when start meeting is clicked', async ({ page }) => {
    await page.goto('/meeting?mode=host');
    
    // Fill in the form
    await page.fill('input[placeholder="Enter meeting name"]', 'Test Meeting');
    await page.fill('input[placeholder="Enter your name"]', 'Test Facilitator');
    
    // Submit the form
    const submitButton = page.locator('button[type="submit"], button:has-text("Create Meeting")').first();
    await submitButton.click();
    
    // Wait for success page
    await expect(page.locator('text=Your meeting is ready!')).toBeVisible();
    
    // Click start meeting button
    const startButton = page.locator('button:has-text("Start meeting")');
    await startButton.click();
    
    // Should navigate to facilitator view
    await expect(page).toHaveURL(/.*\/facilitate\/[A-Z0-9]{6}/);
  });
});