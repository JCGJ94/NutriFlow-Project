import { test, expect } from '../fixtures/auth';

test.describe('Mobile Plan: Day Scroll Navigation', () => {
    test.beforeEach(async ({ loginAsSeedUser, page }) => {
        // iPhone 14 viewport
        await page.setViewportSize({ width: 390, height: 844 });
        await loginAsSeedUser(page);
    });

    test('Diet tab: tapping a day scrolls to its content section', async ({ page }) => {
        // Navigate to dashboard to find active plan
        await page.goto('/dashboard');
        await page.waitForLoadState('networkidle');

        // Click on active plan card (if exists)
        const planCard = page.getByTestId('active-plan-card');
        if (await planCard.isVisible({ timeout: 5000 })) {
            await planCard.first().click();
            await page.waitForLoadState('networkidle');

            // Verify we are on a plan page
            await expect(page).toHaveURL(/\/plan\//);

            // Wait for diet tab to be active by default
            await expect(page.getByTestId('tab-diet')).toBeVisible();

            // Find the second day tab (index 1 = Tuesday typically)
            const dayTab1 = page.getByTestId('diet-day-tab-1');
            if (await dayTab1.isVisible({ timeout: 3000 })) {
                await dayTab1.click();

                // Wait for smooth scroll to settle
                await page.waitForTimeout(800);

                // The content section for day 1 should now be in the viewport
                const dayContent = page.getByTestId('diet-day-content-1');
                await expect(dayContent).toBeInViewport({ ratio: 0.3 });
            }
        }
    });

    test('Exercise tab: tapping a day scrolls to its content section', async ({ page }) => {
        await page.goto('/dashboard');
        await page.waitForLoadState('networkidle');

        const planCard = page.getByTestId('active-plan-card');
        if (await planCard.isVisible({ timeout: 5000 })) {
            await planCard.first().click();
            await page.waitForLoadState('networkidle');

            // Switch to Exercise tab
            const exerciseTab = page.getByTestId('tab-exercise');
            await exerciseTab.click();
            await page.waitForTimeout(500);

            // Try clicking on day 2 (Wednesday typically)
            const dayTab2 = page.getByTestId('exercise-day-tab-2');
            if (await dayTab2.isVisible({ timeout: 3000 })) {
                await dayTab2.click();
                await page.waitForTimeout(800);

                const dayContent = page.getByTestId('exercise-day-content-2');
                await expect(dayContent).toBeInViewport({ ratio: 0.3 });
            }
        }
    });

    test('Mobile horizontal tabs are visible and scrollable', async ({ page }) => {
        await page.goto('/dashboard');
        await page.waitForLoadState('networkidle');

        const planCard = page.getByTestId('active-plan-card');
        if (await planCard.isVisible({ timeout: 5000 })) {
            await planCard.first().click();
            await page.waitForLoadState('networkidle');

            // Diet tab should show horizontal day tabs on mobile
            const firstDayTab = page.getByTestId('diet-day-tab-0');
            await expect(firstDayTab).toBeVisible({ timeout: 5000 });

            // The tab should have role="tab" for accessibility
            await expect(firstDayTab).toHaveAttribute('role', 'tab');

            // The active tab should have aria-selected="true"
            await expect(firstDayTab).toHaveAttribute('aria-selected', 'true');
        }
    });
});
