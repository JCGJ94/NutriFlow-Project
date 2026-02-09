
import { test as base, Page } from '@playwright/test';
import { seed_user_complete } from './users';

type AuthFixtures = {
    loginAsSeedUser: (page: Page) => Promise<void>;
    ensureLoggedIn: (page: Page) => Promise<void>;
};

export const test = base.extend<AuthFixtures>({
    loginAsSeedUser: async ({ }, use) => {
        await use(async (page: Page) => {
            await page.goto('/login');
            await page.fill('[data-testid="login-email"]', seed_user_complete.email);
            await page.fill('[data-testid="login-password"]', seed_user_complete.password);
            await page.click('[data-testid="login-submit"]');
            await page.waitForURL('/dashboard');
        });
    },
    ensureLoggedIn: async ({ }, use) => {
        await use(async (page: Page) => {
            // Check if we are already logged in (e.g., by checking for a session cookie or a UI element)
            // This is a simplified version. For robustness, we might check for specific cookies or localStorage.
            // For now, we assume if we hit dashboard and don't get redirected, we are good.
            // Or we can just perform the login flow again if needed, relying on idempotency or handling the 'already logged in' state.

            // Optimization: Ideally, we'd set the session state directly (cookies/localStorage) to bypass the UI login.
            // But for this "seed user" approach via UI as per prompt, we'll stick to UI interaction or just verify.

            // Let's just do the login flow for now, assuming clean state for each test if fullyParallel/isolated is true (default).
            await page.goto('/login');
            await page.fill('[data-testid="login-email"]', seed_user_complete.email);
            await page.fill('[data-testid="login-password"]', seed_user_complete.password);
            await page.click('[data-testid="login-submit"]');
            // If already logged in, we might be redirected immediately or see different UI.
            try {
                await page.waitForURL('/dashboard', { timeout: 5000 });
            } catch (e) {
                // If timeout, maybe we were already logged in? check url
                if (page.url().includes('/dashboard')) return;
                throw e;
            }
        });
    },
});

export { expect } from '@playwright/test';
