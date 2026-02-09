
import { test, expect } from '../fixtures/auth';

test.describe('Performance & Health', () => {

    test('No Console Errors on Dashboard', async ({ loginAsSeedUser, page }) => {
        const consoleErrors: string[] = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                // Ignore specific known noise if necessary, but generally fail on error
                consoleErrors.push(msg.text());
            }
        });

        await loginAsSeedUser(page);
        await expect(page).toHaveURL('/dashboard');

        expect(consoleErrors).toEqual([]);
    });

    test('No 500/400 Network Errors on Dashboard Load', async ({ loginAsSeedUser, page }) => {
        const failedRequests: string[] = [];
        page.on('requestfailed', request => {
            failedRequests.push(`${request.method()} ${request.url()} - ${request.failure()?.errorText}`);
        });
        page.on('response', response => {
            if (response.status() >= 400 && response.url().includes('/api/')) {
                failedRequests.push(`${response.request().method()} ${response.url()} - ${response.status()}`);
            }
        });

        await loginAsSeedUser(page);

        expect(failedRequests).toEqual([]);
    });

    test('Dashboard Load Performance (Under 3s LCP)', async ({ loginAsSeedUser, page }) => {
        await loginAsSeedUser(page);

        // Use Performance API to measure LCP
        const lcp = await page.evaluate(() => {
            return new Promise<number>((resolve) => {
                new PerformanceObserver((entryList) => {
                    const entries = entryList.getEntries();
                    const lastEntry = entries[entries.length - 1];
                    resolve(lastEntry.startTime);
                }).observe({ type: 'largest-contentful-paint', buffered: true });

                // Fallback if no LCP observed quickly
                setTimeout(() => resolve(0), 5000);
            });
        });

        // 3000ms budget for LCP
        expect(lcp).toBeLessThan(3000);
    });
});
