
import { test, expect } from '@playwright/test';

test.describe('Registration and Onboarding Flow', () => {
    test('should complete full registration process', async ({ page }) => {
        // 1. Setup unique user data
        const timestamp = Date.now();
        const email = `qa-user-${timestamp}@test.com`;
        const password = 'TestUser123!';

        // 2. Navigate to Register
        await page.goto('/register');
        await expect(page).toHaveTitle(/NutriFlow/);

        // 3. Fill Registration Form
        await page.fill('input[name="email"]', email);
        await page.fill('input[name="password"]', password);
        await page.fill('input[name="confirmPassword"]', password);

        // 4. Submit
        const submitBtn = page.locator('button[type="submit"]');
        await expect(submitBtn).toBeEnabled();
        await submitBtn.click();

        // 5. Verify Redirect to Onboarding
        // Increase timeout for backend processing
        try {
            await expect(page).toHaveURL(/\/onboarding/, { timeout: 5000 });
        } catch (e) {
            // If we are still on register page, check for success message (Email Confirmation Mode)
            if (page.url().includes('register')) {
                // Check for the specific success message in Green box (text-green-700)
                const successMsg = await page.textContent('div.text-green-700, div.text-green-400').catch(() => null);

                if (successMsg) {
                    console.log(`✅ Registration Outcome: "${successMsg}"`);
                    if (successMsg.includes('email')) {
                        return; // Test passes
                    }
                }

                // If it's an error (Red box)
                const errorMsg = await page.textContent('div.text-red-700, div.text-red-400').catch(() => null);
                if (errorMsg) {
                    console.log(`❌ Registration Failed with UI Error: ${errorMsg}`);
                    throw new Error(`Registration failed: ${errorMsg}`);
                }

                // If neither
                throw new Error('Registration flow stalled: Stuck on register page with no visible error or success message.');
            }
            throw e;
        }

        // 6. Verify Session Persistence (Simple check)
        // Reload page to ensure we are still logged in/onboarding
        await page.reload();
        await expect(page).toHaveURL(/\/onboarding/);

        console.log(`Test User Created: ${email}`);
    });
});
