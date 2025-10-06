import { test, expect } from '@playwright/test';

test.describe('Meeting Joining', () => {
  test('should show join form with proper elements', async ({ page }) => {
    await page.goto('/meeting?mode=join');
    
    // Check for join form elements
    await expect(page.locator('input[placeholder="ABC123"]')).toBeVisible();
    await expect(page.locator('input[placeholder="Enter your name"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]:has-text("Join Meeting")')).toBeVisible();
  });

  test('should show validation error for invalid meeting code format', async ({ page }) => {
    await page.goto('/meeting?mode=join');
    
    // Enter invalid meeting code (too short)
    await page.fill('input[placeholder="ABC123"]', 'ABC');
    await page.fill('input[placeholder="Enter your name"]', 'Test Participant');
    
    const joinButton = page.locator('button[type="submit"], button:has-text("Join Meeting")').first();
    await joinButton.click();
    
    // Should show validation error
    await expect(page.locator('text=6 characters, text=invalid')).toBeVisible();
  });

  test('should show error for non-existent meeting', async ({ page }) => {
    // Mock API to return 404 for non-existent meeting
    await page.route('**/api/meetings/*', route => {
      route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Meeting not found',
          code: 'MEETING_NOT_FOUND'
        })
      });
    });

    await page.goto('/meeting?mode=join');
    
    // Enter valid format but non-existent meeting code
    await page.fill('input[placeholder="ABC123"]', 'NONEXISTENT');
    await page.fill('input[placeholder="Enter your name"]', 'Test Participant');
    
    const joinButton = page.locator('button[type="submit"]:has-text("Join Meeting")');
    await joinButton.click();
    
    // Should show error for non-existent meeting
    await expect(page.locator('text=Meeting not found')).toBeVisible();
  });

  test('should show validation error for empty participant name', async ({ page }) => {
    await page.goto('/meeting?mode=join');
    
    // Enter valid meeting code but empty name
    await page.fill('input[placeholder="ABC123"]', 'ABCDEF');
    await page.fill('input[placeholder="Enter your name"]', '');
    
    const joinButton = page.locator('button[type="submit"]:has-text("Join Meeting")');
    await joinButton.click();
    
    // Should show validation error
    await expect(page.locator('input[placeholder="Enter your name"]')).toHaveAttribute('required');
  });

  test('should handle server errors gracefully', async ({ page }) => {
    // Mock server error
    await page.route('**/api/meetings/*', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Internal server error',
          code: 'INTERNAL_SERVER_ERROR'
        })
      });
    });

    await page.goto('/meeting?mode=join');
    
    // Enter valid data
    await page.fill('input[placeholder="ABC123"]', 'ABCDEF');
    await page.fill('input[placeholder="Enter your name"]', 'Test Participant');
    
    const joinButton = page.locator('button[type="submit"], button:has-text("Join Meeting")').first();
    await joinButton.click();
    
    // Should show error message
    await expect(page.locator('text=Internal server error, text=Failed to get meeting')).toBeVisible();
  });

  test('should join meeting successfully with valid data', async ({ page }) => {
    // Mock successful meeting creation and joining
    await page.route('**/api/meetings', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          meetingCode: 'TEST12',
          meetingId: 'test-meeting-id',
          shareUrl: 'http://localhost:3000/join/TEST12'
        })
      });
    });

    await page.route('**/api/meetings/*', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'test-meeting-id',
          code: 'TEST12',
          title: 'Test Meeting',
          facilitator: 'Test Facilitator',
          participantCount: 0,
          isActive: true
        })
      });
    });

    await page.goto('/meeting?mode=join');
    
    // Enter valid data
    await page.fill('input[placeholder="ABC123"]', 'TEST12');
    await page.fill('input[placeholder="Enter your name"]', 'Test Participant');
    
    const joinButton = page.locator('button[type="submit"], button:has-text("Join Meeting")').first();
    await joinButton.click();
    
    // Should navigate to meeting room
    await expect(page).toHaveURL(/.*\/meeting\/|.*\/room\//);
  });

  test('should auto-fill meeting code from URL parameter', async ({ page }) => {
    // Navigate with meeting code in URL
    await page.goto('/meeting?mode=join&code=TEST12');
    
    // Should auto-fill the meeting code
    const codeInput = page.locator('input[placeholder="ABC123"]');
    await expect(codeInput).toHaveValue('TEST12');
  });

  test('should show loading state during join process', async ({ page }) => {
    // Mock slow API response
    await page.route('**/api/meetings/*', route => {
      setTimeout(() => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'test-meeting-id',
            code: 'TEST12',
            title: 'Test Meeting',
            facilitator: 'Test Facilitator',
            participantCount: 0,
            isActive: true
          })
        });
      }, 1000);
    });

    await page.goto('/meeting?mode=join');
    
    // Enter valid data
    await page.fill('input[placeholder="ABC123"]', 'TEST12');
    await page.fill('input[placeholder="Enter your name"]', 'Test Participant');
    
    const joinButton = page.locator('button[type="submit"], button:has-text("Join Meeting")').first();
    await joinButton.click();
    
    // Should show loading state
    await expect(page.locator('text=Joining, text=Loading')).toBeVisible();
  });
});