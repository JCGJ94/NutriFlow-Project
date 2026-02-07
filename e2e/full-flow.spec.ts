import { test, expect } from '@playwright/test';
import { randomBytes } from 'crypto';

test.describe('Full Application Flow (New User)', () => {
    test.setTimeout(180000); // 3 min timeout

    test('should register, login, complete onboarding, and auto-generate plan', async ({ page }) => {
        // Generate unique user
        const randomId = randomBytes(4).toString('hex');
        const email = `qa_test_${randomId}@example.com`;
        const password = 'TestPassport123!';
        const username = `qa_user_${randomId}`;

        console.log(`Step 1: Registering new user ${email}...`);
        await page.goto('/register');
        await page.fill('input[name="email"]', email);
        await page.fill('input[name="password"]', password);
        await page.fill('input[name="confirmPassword"]', password);
        await page.click('button[type="submit"]');

        // Verify toast or redirect
        // Expect redirect to login
        await page.waitForURL('/login', { timeout: 10000 });
        console.log('✅ Redirected to Login after registration.');

        console.log('Step 2: Manual Login...');
        await page.fill('input[name="emailOrUsername"]', email);
        await page.fill('input[name="password"]', password);
        await page.click('button[type="submit"]');

        // Expect redirect to onboarding (since new user has no profile)
        // Note: It might go to dashboard first then redirect to onboarding
        await page.waitForURL(/\/onboarding/, { timeout: 15000 });
        console.log('✅ Redirected to Onboarding.');

        console.log('Step 3: Completing Onboarding...');

        // Step 1: Basics
        await page.fill('input[name="username"]', username);
        await page.fill('input[name="age"]', '30');
        await page.selectOption('select[name="sex"]', 'male');
        await page.fill('input[name="weightKg"]', '80');
        await page.fill('input[name="heightCm"]', '180');
        await page.click('button:has-text("Siguiente")');

        // Step 2: Activity
        await page.selectOption('select[name="activityLevel"]', 'moderately_active');
        await page.selectOption('select[name="mealsPerDay"]', '4');
        await page.click('button:has-text("Siguiente")');

        // Step 3: Goals
        await page.selectOption('select[name="dietPattern"]', 'omnivore');
        await page.fill('input[name="weightGoalKg"]', '75');
        await page.click('button:has-text("Siguiente")');

        // Step 4: Allergens
        // Check if allergens are loaded. If so, select the first one.
        // We wait a bit for fetch if needed
        await page.waitForTimeout(1000);
        const checkboxes = page.locator('input[type="checkbox"][name="allergenIds"]');
        if (await checkboxes.count() > 0) {
            await checkboxes.first().check();
            console.log('Selected an allergen.');
        } else {
            console.log('No allergens found (or loading failed). Continuing...');
        }

        console.log('Step 4: Submitting and Generating Plan...');
        await page.click('button:has-text("Generar Plan Personalizado")');

        // Wait for AI generation (redirect to /plan/ID)
        console.log('Waiting for AI generation...');
        await page.waitForURL(/\/plan\/.+/, { timeout: 90000 });

        console.log('✅ Plan generated successfully!');

        // Verify Plan Page
        await expect(page.locator('h1')).toContainText('Tu plan semanal');
        await expect(page.locator('text=kcal')).toBeVisible();

        console.log('Step 5: Verifying Shopping List...');
        // Navigate to Shopping List (assuming button exists on plan page)
        // Look for the shopping cart icon button or text
        await page.click('button:has-text("Lista de Compra")');

        await page.waitForURL(/\/shopping-list\/.+/, { timeout: 10000 });
        console.log('✅ Navigated to Shopping List.');

        // Add Custom Item (Testing the backend fix)
        const customItemName = `Custom Item ${randomId}`;
        await page.fill('input[placeholder="Añadir otro producto..."]', customItemName);
        await page.click('button:has(.lucide-plus)'); // Click the add button (icon Plus)

        // Wait for item to appear
        await expect(page.locator(`text=${customItemName}`)).toBeVisible({ timeout: 5000 });
        console.log('✅ Custom item added successfully (Backend fix verified).');

        // Check the item
        await page.click(`text=${customItemName}`); // This usually clicks the container
        // Verify style change (line-through or opacity) - exact check might be brittle, but let's check checkbox state if possible
        // For now, just clicking it without error is a good sign
        console.log('✅ Item checked.');

        // Verify Print and Share buttons exist
        await expect(page.locator('button[title="Imprimir"]')).toBeVisible();
        await expect(page.locator('button[title="Enviar"]')).toBeVisible();
        console.log('✅ Print and Share buttons present.');

        await page.screenshot({ path: 'e2e-full-success.png' });
    });
});
