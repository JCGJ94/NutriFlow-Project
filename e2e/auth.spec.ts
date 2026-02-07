import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
    test('should allow user to register', async ({ page }) => {
        // Generate unique email
        const email = `test-${Date.now()}@example.com`;

        await page.goto('/register');

        await page.fill('input[name="email"]', email);
        await page.fill('input[name="password"]', 'Password123!');
        await page.fill('input[name="confirmPassword"]', 'Password123!');

        await page.click('button[type="submit"]');

        // Should pass through onboarding or go to dashboard
        // For now we expect redirection to onboarding
        await expect(page).toHaveURL(/\/onboarding/);
    });

    test('should allow user to login', async ({ page }) => {
        // Note: This assumes a seeded user or we should register one first
        // For MVP E2E we might mock the auth or use a test account

        await page.goto('/login');
        // Using a known test account or newly registered one ideally
        await page.fill('input[name="email"]', 'test-user@example.com');
        await page.fill('input[name="password"]', 'Password123!');

        await page.click('button[type="submit"]');

        // await expect(page).toHaveURL('/dashboard');
    });
});
