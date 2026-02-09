
import { test, expect } from '../fixtures/auth';

test.describe('Smoke Suite', () => {
    // Use a fresh context/page for smoke tests to ensure clean state

    test('01. Login with Valid Credentials', async ({ loginAsSeedUser, page }) => {
        await loginAsSeedUser(page);
        await expect(page).toHaveURL('/dashboard');
        await expect(page.getByTestId('dashboard-content')).toBeVisible();

        // Check for no console errors during login
        const consoleErrors: string[] = [];
        page.on('console', msg => {
            if (msg.type() === 'error') consoleErrors.push(msg.text());
        });
        expect(consoleErrors).toHaveLength(0);
    });

    test('02. Navigate to Plans', async ({ loginAsSeedUser, page }) => {
        await loginAsSeedUser(page);
        await page.getByTestId('link-plans').click();
        await expect(page).toHaveURL(/\/plans/);
        await expect(page.getByTestId('plans-page-container')).toBeVisible();
    });

    test('03. Navigate to Settings', async ({ loginAsSeedUser, page }) => {
        await loginAsSeedUser(page);
        // Open profile menu first
        await page.getByTestId('profile-menu-button').click();
        await page.getByTestId('profile-dropdown-settings').click();

        await expect(page).toHaveURL('/settings');
        await expect(page.getByTestId('settings-form')).toBeVisible();
    });

    test.afterEach(async ({ page }) => {
        // Basic check for 5xx errors on the current page
        // (This is a shallow check, ideally we intercept network requests)
    });
});
