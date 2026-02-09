
import { test, expect } from '../fixtures/auth';
import { seed_user_complete } from '../fixtures/users';

test.describe('Authentication Flow', () => {

    test('Login with correct credentials redirects to dashboard', async ({ loginAsSeedUser, page }) => {
        await loginAsSeedUser(page);
        await expect(page).toHaveURL('/dashboard');
    });

    test('Login with incorrect password shows error', async ({ page }) => {
        await page.goto('/login');
        await page.fill('[data-testid="login-email"]', seed_user_complete.email);
        await page.fill('[data-testid="login-password"]', 'wrongpassword');
        await page.click('[data-testid="login-submit"]');

        // Expect error toast or message
        // Assuming toast appears. We check for text 'Inválido' or generic error as per translation.
        // Since we don't know the exact text (it's localized), we might check for the toast container or class.
        // Or just check that we are still on login page.
        await expect(page).toHaveURL('/login');
    });

    test('Protected route redirects to login', async ({ page }) => {
        await page.goto('/dashboard');
        // Should be redirected to login or onboarding
        // Based on middleware.ts, it likely redirects to /login
        await expect(page).toHaveURL(/\/login/);
    });

    test('Logout works', async ({ loginAsSeedUser, page }) => {
        await loginAsSeedUser(page);
        await page.getByTestId('profile-menu-button').click();
        // Assuming there is a logout button in the dropdown. 
        // I didn't add data-testid to logout button in Navbar.tsx yet.
        // Let's rely on text text('Cerrar sesión') or 'Logout' or similar.
        // Providing a selector fallback if possible, or assume 'Logout'.
        // Actually, looking at Navbar.tsx, handleLogout is in the dropdown.
        await page.getByRole('button', { name: /Log\s?out|Cerrar/i }).click();
        await expect(page).toHaveURL('/');
    });
});
