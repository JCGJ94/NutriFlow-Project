import { test, expect } from '@playwright/test';

test.describe('Plan Generation Flow', () => {
    test.beforeEach(async ({ page }) => {
        // Login first
        await page.goto('/login');
        await page.fill('input[name="email"]', 'test-user@example.com');
        await page.fill('input[name="password"]', 'Password123!');
        await page.click('button[type="submit"]');
        await page.waitForURL('/dashboard');
    });

    test('should generate a weekly plan', async ({ page }) => {
        // Check if we are on dashboard
        await expect(page).toHaveURL('/dashboard');

        // Click generate plan button
        await page.click('button:has-text("Generar nuevo plan")');

        // Should redirect to loading or plan page
        // Wait for plan generation (might take a few seconds)
        await expect(page).toHaveURL(/\/plan\/.+/);

        // Check for plan elements
        await expect(page.locator('h1')).toContainText('Tu plan semanal');
        await expect(page.locator('text=kcal/día')).toBeVisible();
    });
});
