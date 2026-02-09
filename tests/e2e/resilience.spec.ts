
import { test, expect } from '../fixtures/auth';

test.describe('Resilience & Error Handling', () => {

    test('Graceful handling of 500 Server Error on Plans', async ({ loginAsSeedUser, page }) => {
        await loginAsSeedUser(page);

        // Mock 500 error for plans endpoint
        await page.route('**/api/plans', route => route.fulfill({
            status: 500,
            contentType: 'application/json',
            body: JSON.stringify({ message: 'Internal Server Error' })
        }));

        await page.getByTestId('link-plans').click();

        // Expect error toast or UI fallback
        // Based on PlansPage code: showToast(t('plans.load_error'), 'error');
        // We check if toast appears.
        const toast = page.getByText(/Error|fallo|problema/i).first();
        await expect(toast).toBeVisible();

        // UI should still render container, maybe empty state or error state
        await expect(page.getByTestId('plans-page-container')).toBeVisible();
    });

    test('Graceful handling of Slow Network (Loading State)', async ({ loginAsSeedUser, page }) => {
        await loginAsSeedUser(page);

        // Simulate slow network for plans
        await page.route('**/api/plans', async route => {
            await new Promise(resolve => setTimeout(resolve, 2000));
            await route.continue();
        });

        await page.getByTestId('link-plans').click();

        // Expect loading state
        // We expect a loader or skeleton. The PlansPage has a Loader2 icon when isLoading is true.
        await expect(page.locator('svg.animate-spin')).toBeVisible();

        // Eventual success
        await expect(page.getByTestId('active-plans-section')).toBeVisible({ timeout: 10000 });
    });

    test('Graceful handling of Offline Mode', async ({ loginAsSeedUser, page }) => {
        await loginAsSeedUser(page);

        // Go offline
        await page.context().setOffline(true);

        await page.getByTestId('link-plans').click();

        // Expect some error indication or kept state if cached
        // If not cached, likely a fetch error which shows a toast.
        const toast = page.getByText(/Error|Network|conexión/i).first();
        await expect(toast).toBeVisible();

        // Restore online
        await page.context().setOffline(false);
    });
});
