import { test, expect } from '@playwright/test';

test.describe('Complete Meeting Workflow', () => {
  test('should complete full meeting creation and joining workflow', async ({ browser }) => {
    // Create two browser contexts to simulate facilitator and participant
    const facilitatorContext = await browser.newContext();
    const participantContext = await browser.newContext();
    
    const facilitatorPage = await facilitatorContext.newPage();
    const participantPage = await participantContext.newPage();

    try {
      // Step 1: Facilitator creates a meeting
      await facilitatorPage.goto('/create');
      
      // Fill in meeting details
      await facilitatorPage.fill('input[placeholder*="Meeting Name" i]', 'E2E Test Meeting');
      await facilitatorPage.fill('input[placeholder*="Your Name" i]', 'Test Facilitator');
      
      // Submit the form
      const createButton = facilitatorPage.locator('button:has-text("Host Meeting")');
      await createButton.click();
      
      // Wait for success page
      await expect(facilitatorPage.locator('text=Your meeting is ready!')).toBeVisible();
      
      // Get the meeting code
      const meetingCodeElement = facilitatorPage.locator('text=/[A-Z0-9]{6}/').first();
      const meetingCode = await meetingCodeElement.textContent();
      expect(meetingCode).toMatch(/^[A-Z0-9]{6}$/);
      
      // Step 2: Participant joins the meeting
      await participantPage.goto('/join');
      
      // Fill in join details
      await participantPage.fill('input[placeholder*="code" i]', meetingCode!);
      await participantPage.fill('input[placeholder*="name" i]', 'Test Participant');
      
      // Submit join form
      const joinButton = participantPage.locator('button:has-text("Join")');
      await joinButton.click();
      
      // Should navigate to meeting room
      await expect(participantPage).toHaveURL(/.*\/meeting\//);
      
      // Step 3: Facilitator starts the meeting
      const startButton = facilitatorPage.locator('button:has-text("Start meeting")');
      await startButton.click();
      
      // Should navigate to facilitator view
      await expect(facilitatorPage).toHaveURL(/.*\/facilitate\/[A-Z0-9]{6}/);
      
      // Step 4: Verify both users are in the meeting
      // Check facilitator view shows participant
      await expect(facilitatorPage.locator('text=Test Participant')).toBeVisible();
      
      // Check participant view shows facilitator
      await expect(participantPage.locator('text=Test Facilitator')).toBeVisible();
      
    } finally {
      // Clean up
      await facilitatorContext.close();
      await participantContext.close();
    }
  });

  test('should handle multiple participants joining the same meeting', async ({ browser }) => {
    // Create multiple browser contexts
    const facilitatorContext = await browser.newContext();
    const participant1Context = await browser.newContext();
    const participant2Context = await browser.newContext();
    
    const facilitatorPage = await facilitatorContext.newPage();
    const participant1Page = await participant1Context.newPage();
    const participant2Page = await participant2Context.newPage();

    try {
      // Step 1: Facilitator creates a meeting
      await facilitatorPage.goto('/create');
      await facilitatorPage.fill('input[placeholder*="Meeting Name" i]', 'Multi-Participant Test');
      await facilitatorPage.fill('input[placeholder*="Your Name" i]', 'Test Facilitator');
      
      const createButton = facilitatorPage.locator('button:has-text("Host Meeting")');
      await createButton.click();
      
      await expect(facilitatorPage.locator('text=Your meeting is ready!')).toBeVisible();
      
      // Get the meeting code
      const meetingCodeElement = facilitatorPage.locator('text=/[A-Z0-9]{6}/').first();
      const meetingCode = await meetingCodeElement.textContent();
      
      // Step 2: First participant joins
      await participant1Page.goto('/join');
      await participant1Page.fill('input[placeholder*="code" i]', meetingCode!);
      await participant1Page.fill('input[placeholder*="name" i]', 'Participant 1');
      await participant1Page.locator('button:has-text("Join")').click();
      
      // Step 3: Second participant joins
      await participant2Page.goto('/join');
      await participant2Page.fill('input[placeholder*="code" i]', meetingCode!);
      await participant2Page.fill('input[placeholder*="name" i]', 'Participant 2');
      await participant2Page.locator('button:has-text("Join")').click();
      
      // Step 4: Facilitator starts the meeting
      await facilitatorPage.locator('button:has-text("Start meeting")').click();
      
      // Step 5: Verify all participants are visible
      await expect(facilitatorPage.locator('text=Participant 1')).toBeVisible();
      await expect(facilitatorPage.locator('text=Participant 2')).toBeVisible();
      
    } finally {
      await facilitatorContext.close();
      await participant1Context.close();
      await participant2Context.close();
    }
  });

  test('should handle participant leaving and rejoining', async ({ browser }) => {
    const facilitatorContext = await browser.newContext();
    const participantContext = await browser.newContext();
    
    const facilitatorPage = await facilitatorContext.newPage();
    const participantPage = await participantContext.newPage();

    try {
      // Create and join meeting
      await facilitatorPage.goto('/create');
      await facilitatorPage.fill('input[placeholder*="Meeting Name" i]', 'Rejoin Test');
      await facilitatorPage.fill('input[placeholder*="Your Name" i]', 'Test Facilitator');
      await facilitatorPage.locator('button:has-text("Host Meeting")').click();
      
      const meetingCodeElement = facilitatorPage.locator('text=/[A-Z0-9]{6}/').first();
      const meetingCode = await meetingCodeElement.textContent();
      
      await participantPage.goto('/join');
      await participantPage.fill('input[placeholder*="code" i]', meetingCode!);
      await participantPage.fill('input[placeholder*="name" i]', 'Test Participant');
      await participantPage.locator('button:has-text("Join")').click();
      
      await facilitatorPage.locator('button:has-text("Start meeting")').click();
      
      // Verify participant is in the meeting
      await expect(facilitatorPage.locator('text=Test Participant')).toBeVisible();
      
      // Participant leaves (close browser context)
      await participantContext.close();
      
      // Wait a moment for disconnection
      await facilitatorPage.waitForTimeout(2000);
      
      // Participant rejoins
      const newParticipantContext = await browser.newContext();
      const newParticipantPage = await newParticipantContext.newPage();
      
      try {
        await newParticipantPage.goto('/join');
        await newParticipantPage.fill('input[placeholder*="code" i]', meetingCode!);
        await newParticipantPage.fill('input[placeholder*="name" i]', 'Test Participant');
        await newParticipantPage.locator('button:has-text("Join")').click();
        
        // Verify participant is back in the meeting
        await expect(facilitatorPage.locator('text=Test Participant')).toBeVisible();
        
      } finally {
        await newParticipantContext.close();
      }
      
    } finally {
      await facilitatorContext.close();
    }
  });

  test('should handle network interruptions gracefully', async ({ browser }) => {
    const facilitatorContext = await browser.newContext();
    const participantContext = await browser.newContext();
    
    const facilitatorPage = await facilitatorContext.newPage();
    const participantPage = await participantContext.newPage();

    try {
      // Create meeting
      await facilitatorPage.goto('/create');
      await facilitatorPage.fill('input[placeholder*="Meeting Name" i]', 'Network Test');
      await facilitatorPage.fill('input[placeholder*="Your Name" i]', 'Test Facilitator');
      await facilitatorPage.locator('button:has-text("Host Meeting")').click();
      
      const meetingCodeElement = facilitatorPage.locator('text=/[A-Z0-9]{6}/').first();
      const meetingCode = await meetingCodeElement.textContent();
      
      // Simulate network interruption during join
      await participantPage.route('**/api/meetings/*', route => {
        // Simulate network error
        route.abort('failed');
      });
      
      await participantPage.goto('/join');
      await participantPage.fill('input[placeholder*="code" i]', meetingCode!);
      await participantPage.fill('input[placeholder*="name" i]', 'Test Participant');
      await participantPage.locator('button:has-text("Join")').click();
      
      // Should show error message
      await expect(participantPage.locator('text=error, text=failed')).toBeVisible();
      
      // Restore network and retry
      await participantPage.unroute('**/api/meetings/*');
      await participantPage.locator('button:has-text("Join")').click();
      
      // Should now succeed
      await expect(participantPage).toHaveURL(/.*\/meeting\//);
      
    } finally {
      await facilitatorContext.close();
      await participantContext.close();
    }
  });
});