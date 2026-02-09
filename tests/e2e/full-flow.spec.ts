
import { test, expect } from '@playwright/test';
import { randomUUID } from 'crypto';

test('Complete User Flow: Register -> Login -> Generate Plan -> Shopping List', async ({ page }) => {
    // 1. Setup User
    const uniqueId = randomUUID().substring(0, 8);
    const user = {
        email: `flow.${uniqueId}@example.com`,
        password: 'Password123!',
        confirmPassword: 'Password123!',
    };

    // 2. Register
    await page.goto('/register');
    await page.fill('[data-testid="register-email"]', user.email);
    await page.fill('[data-testid="register-password"]', user.password);
    await page.fill('[data-testid="register-confirm-password"]', user.confirmPassword);
    await page.click('[data-testid="register-submit"]');
    await expect(page).toHaveURL('/login', { timeout: 15000 }); // Increase timeout for redirects

    // 3. Login
    await page.fill('[data-testid="login-email"]', user.email);
    await page.fill('[data-testid="login-password"]', user.password);
    await page.click('[data-testid="login-submit"]');
    await expect(page).toHaveURL('/dashboard');

    // 4. Generate Plan
    // If user has no profile, maybe they need to set it up?
    // Let's assume defaults or that standard generation works.
    await page.getByTestId('generate-plan-cta').click();

    // This might take a while if calling real AI
    // We expect to eventually see a plan or be redirected to the plan page.
    // If the button redirects to /plans or /onboarding, we follow.
    // Based on `DashboardClient`, `generateNewPlan` calls API and then refreshes.

    // Wait for the "active plan card" to appear indicating a plan exists.
    // OR verify we are redirected if that's the behavior.

    // NOTE: This step is flaky if it depends on real AI latency (30s+).
    // Ideally we mock the generation response for E2E speed, but this is a "Full Flow".
    // Let's try to wait for the card.

    // Check if we need to configure profile first.
    // If `generateNewPlan` fails because profile incomplete, we might see a toast.
    // But let's assume seed/defaults working for new users or minimal friction.

    // A more robust test would be to ensure Profile is set before generating.
    // Let's quickly go to settings and save valid defaults if we suspect it's needed.
    // Or just try generating.

    // Wait for generation (could be long)
    test.setTimeout(180000);
    await expect(page.getByTestId('active-plan-card')).toBeVisible({ timeout: 120000 });

    // 5. Open Plan
    await page.getByTestId('active-plan-card').first().click();
    await expect(page).toHaveURL(/\/plan\//);

    // 6. Navigate to Shopping List
    await page.getByTestId('nav-shopping-list').click();
    await expect(page).toHaveURL(/\/shopping-list\//);
    await expect(page.getByTestId('shopping-list-container')).toBeVisible();

    // 7. Verify Items
    // Check if there are items (generated plans usually have items)
    // Or add a custom item
    await page.fill('[data-testid="add-custom-item-input"]', 'Test Item');
    await page.click('[data-testid="add-custom-item-button"]');

    // Verify custom item appears
    await expect(page.getByText('Test Item')).toBeVisible();
});
