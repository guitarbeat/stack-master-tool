import { test, expect } from '@playwright/test';

test.describe('Comprehensive Meeting Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('complete meeting lifecycle - host creates, participants join, speaking queue works', async ({ page }) => {
    // * Host creates a meeting
    await test.step('Host creates meeting', async () => {
      await page.click('a[href="/meeting?mode=host"], button:has-text("Start Hosting")');
      await expect(page).toHaveURL(/.*\/meeting\?mode=host/);
      
      // Fill in meeting details
      await page.fill('input[placeholder*="name"], input[id*="facilitator"]', 'Test Facilitator');
      await page.fill('input[placeholder*="title"], input[id*="title"]', 'E2E Test Meeting');
      
      // Create meeting
      await page.click('button:has-text("Create Meeting"), button:has-text("Start Meeting")');
      
      // Wait for meeting to be created and get the meeting code
      await expect(page.locator('text=/Meeting Code: [A-Z0-9]{6}/')).toBeVisible();
      
      // Extract meeting code for later use
      const meetingCodeElement = page.locator('text=/Meeting Code: ([A-Z0-9]{6})/');
      const meetingCode = await meetingCodeElement.textContent();
      const code = meetingCode?.match(/[A-Z0-9]{6}/)?.[0];
      expect(code).toBeDefined();
      
      // Store meeting code for other tests
      await page.evaluate((code) => {
        (window as any).meetingCode = code;
      }, code);
    });

    // * First participant joins
    await test.step('First participant joins', async () => {
      const newPage = await page.context().newPage();
      await newPage.goto('/');
      
      await newPage.click('a[href="/meeting?mode=join"], button:has-text("Join Meeting")');
      await expect(newPage).toHaveURL(/.*\/meeting\?mode=join/);
      
      // Get meeting code from the host page
      const meetingCode = await page.evaluate(() => (window as any).meetingCode);
      
      await newPage.fill('input[placeholder*="code"], input[id*="meeting-code"]', meetingCode);
      await newPage.fill('input[placeholder*="name"], input[id*="participant-name"]', 'Participant 1');
      await newPage.click('button:has-text("Join Meeting")');
      
      // Verify participant joined successfully
      await expect(newPage.locator('text=Participant 1')).toBeVisible();
      await expect(newPage.locator('text=Test Facilitator')).toBeVisible();
      
      await newPage.close();
    });

    // * Second participant joins
    await test.step('Second participant joins', async () => {
      const newPage = await page.context().newPage();
      await newPage.goto('/');
      
      await newPage.click('a[href="/meeting?mode=join"], button:has-text("Join Meeting")');
      
      const meetingCode = await page.evaluate(() => (window as any).meetingCode);
      
      await newPage.fill('input[placeholder*="code"], input[id*="meeting-code"]', meetingCode);
      await newPage.fill('input[placeholder*="name"], input[id*="participant-name"]', 'Participant 2');
      await newPage.click('button:has-text("Join Meeting")');
      
      // Verify participant joined successfully
      await expect(newPage.locator('text=Participant 2')).toBeVisible();
      
      await newPage.close();
    });

    // * Test speaking queue functionality
    await test.step('Test speaking queue', async () => {
      // Host should see participants
      await expect(page.locator('text=Participant 1')).toBeVisible();
      await expect(page.locator('text=Participant 2')).toBeVisible();
      
      // Check that speaking queue is empty initially
      await expect(page.locator('text=/Queue: 0 participants/')).toBeVisible();
    });

    // * Test watcher functionality
    await test.step('Watcher joins meeting', async () => {
      const newPage = await page.context().newPage();
      await newPage.goto('/');
      
      await newPage.click('a[href="/meeting?mode=watch"], button:has-text("Watch Meeting")');
      
      const meetingCode = await page.evaluate(() => (window as any).meetingCode);
      
      await newPage.fill('input[placeholder*="code"], input[id*="meeting-code"]', meetingCode);
      await newPage.click('button:has-text("Watch Meeting")');
      
      // Verify watcher can see meeting
      await expect(newPage.locator('text=Test Facilitator')).toBeVisible();
      await expect(newPage.locator('text=Participant 1')).toBeVisible();
      await expect(newPage.locator('text=Participant 2')).toBeVisible();
      
      await newPage.close();
    });
  });

  test('meeting creation with validation', async ({ page }) => {
    await page.click('a[href="/meeting?mode=host"], button:has-text("Start Hosting")');
    
    // Test empty form validation
    await page.click('button:has-text("Create Meeting"), button:has-text("Start Meeting")');
    
    // Should show validation errors or button should be disabled
    const createButton = page.locator('button:has-text("Create Meeting"), button:has-text("Start Meeting")');
    await expect(createButton).toBeDisabled();
    
    // Test with valid data
    await page.fill('input[placeholder*="name"], input[id*="facilitator"]', 'Test Facilitator');
    await page.fill('input[placeholder*="title"], input[id*="title"]', 'Validation Test Meeting');
    
    // Button should now be enabled
    await expect(createButton).toBeEnabled();
    
    await createButton.click();
    
    // Verify meeting was created
    await expect(page.locator('text=/Meeting Code: [A-Z0-9]{6}/')).toBeVisible();
  });

  test('meeting joining with validation', async ({ page }) => {
    await page.click('a[href="/meeting?mode=join"], button:has-text("Join Meeting")');
    
    // Test empty form validation
    const joinButton = page.locator('button:has-text("Join Meeting")');
    await expect(joinButton).toBeDisabled();
    
    // Test with only meeting code
    await page.fill('input[placeholder*="code"], input[id*="meeting-code"]', 'ABC123');
    await expect(joinButton).toBeDisabled();
    
    // Test with only participant name
    await page.fill('input[placeholder*="name"], input[id*="participant-name"]', 'Test Participant');
    await page.clear('input[placeholder*="code"], input[id*="meeting-code"]');
    await expect(joinButton).toBeDisabled();
    
    // Test with both fields
    await page.fill('input[placeholder*="code"], input[id*="meeting-code"]', 'ABC123');
    await expect(joinButton).toBeEnabled();
  });

  test('responsive design on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Test homepage on mobile
    await expect(page.locator('h1')).toBeVisible();
    
    // Test meeting creation on mobile
    await page.click('a[href="/meeting?mode=host"], button:has-text("Start Hosting")');
    await expect(page.locator('h1, h2, h3')).toBeVisible();
    
    // Test meeting joining on mobile
    await page.goto('/');
    await page.click('a[href="/meeting?mode=join"], button:has-text("Join Meeting")');
    await expect(page.locator('h1, h2, h3')).toBeVisible();
    
    // Test meeting watching on mobile
    await page.goto('/');
    await page.click('a[href="/meeting?mode=watch"], button:has-text("Watch Meeting")');
    await expect(page.locator('h1, h2, h3')).toBeVisible();
  });

  test('error handling for invalid meeting codes', async ({ page }) => {
    await page.click('a[href="/meeting?mode=join"], button:has-text("Join Meeting")');
    
    // Test with invalid meeting code
    await page.fill('input[placeholder*="code"], input[id*="meeting-code"]', 'INVALID');
    await page.fill('input[placeholder*="name"], input[id*="participant-name"]', 'Test Participant');
    await page.click('button:has-text("Join Meeting")');
    
    // Should show error message
    await expect(page.locator('text=/error|not found|invalid/i')).toBeVisible();
  });

  test('meeting code case sensitivity', async ({ page }) => {
    // First create a meeting to get a valid code
    await page.click('a[href="/meeting?mode=host"], button:has-text("Start Hosting")');
    await page.fill('input[placeholder*="name"], input[id*="facilitator"]', 'Test Facilitator');
    await page.fill('input[placeholder*="title"], input[id*="title"]', 'Case Test Meeting');
    await page.click('button:has-text("Create Meeting"), button:has-text("Start Meeting")');
    
    await expect(page.locator('text=/Meeting Code: ([A-Z0-9]{6})/')).toBeVisible();
    const meetingCodeElement = page.locator('text=/Meeting Code: ([A-Z0-9]{6})/');
    const meetingCode = await meetingCodeElement.textContent();
    const code = meetingCode?.match(/[A-Z0-9]{6}/)?.[0];
    
    // Test with lowercase code
    const newPage = await page.context().newPage();
    await newPage.goto('/');
    await newPage.click('a[href="/meeting?mode=join"], button:has-text("Join Meeting")');
    await newPage.fill('input[placeholder*="code"], input[id*="meeting-code"]', code?.toLowerCase() || '');
    await newPage.fill('input[placeholder*="name"], input[id*="participant-name"]', 'Case Test Participant');
    await newPage.click('button:has-text("Join Meeting")');
    
    // Should still work (case insensitive)
    await expect(newPage.locator('text=Case Test Participant')).toBeVisible();
    
    await newPage.close();
  });

  test('multiple participants joining simultaneously', async ({ page }) => {
    // Create meeting
    await page.click('a[href="/meeting?mode=host"], button:has-text("Start Hosting")');
    await page.fill('input[placeholder*="name"], input[id*="facilitator"]', 'Test Facilitator');
    await page.fill('input[placeholder*="title"], input[id*="title"]', 'Multi Participant Meeting');
    await page.click('button:has-text("Create Meeting"), button:has-text("Start Meeting")');
    
    await expect(page.locator('text=/Meeting Code: ([A-Z0-9]{6})/')).toBeVisible();
    const meetingCodeElement = page.locator('text=/Meeting Code: ([A-Z0-9]{6})/');
    const meetingCode = await meetingCodeElement.textContent();
    const code = meetingCode?.match(/[A-Z0-9]{6}/)?.[0];
    
    // Create multiple participants simultaneously
    const participantPages = await Promise.all([
      page.context().newPage(),
      page.context().newPage(),
      page.context().newPage(),
    ]);
    
    for (let i = 0; i < participantPages.length; i++) {
      const participantPage = participantPages[i];
      await participantPage.goto('/');
      await participantPage.click('a[href="/meeting?mode=join"], button:has-text("Join Meeting")');
      await participantPage.fill('input[placeholder*="code"], input[id*="meeting-code"]', code || '');
      await participantPage.fill('input[placeholder*="name"], input[id*="participant-name"]', `Participant ${i + 1}`);
      await participantPage.click('button:has-text("Join Meeting")');
    }
    
    // Wait for all participants to join
    await Promise.all(participantPages.map(p => 
      expect(p.locator('text=/Participant [1-3]/')).toBeVisible()
    ));
    
    // Host should see all participants
    await expect(page.locator('text=Participant 1')).toBeVisible();
    await expect(page.locator('text=Participant 2')).toBeVisible();
    await expect(page.locator('text=Participant 3')).toBeVisible();
    
    // Clean up
    await Promise.all(participantPages.map(p => p.close()));
  });
});