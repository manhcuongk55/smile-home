import { test, expect } from '@playwright/test';

test.describe('Xgate Navigation Smoke Test', () => {
    test('should load the dashboard and show sidebar links', async ({ page }) => {
        await page.goto('/');

        // Wait for sidebar
        await expect(page.locator('.sidebar')).toBeVisible();

        // Check for navigation links by href instead of text (more i18n resilient)
        await expect(page.locator('a[href="/billing"]')).toBeVisible();
        await expect(page.locator('a[href="/hierarchy"]')).toBeVisible();
        await expect(page.locator('a[href="/leads"]')).toBeVisible();
    });

    test('should navigate to Billing page', async ({ page }) => {
        await page.goto('/');
        await page.locator('a[href="/billing"]').first().click();
        await expect(page).toHaveURL(/\/billing/);
        await expect(page.getByRole('heading', { name: /Accounting/i })).toBeVisible();
    });

    test('should navigate to Hierarchy page', async ({ page }) => {
        await page.goto('/');
        await page.locator('a[href="/hierarchy"]').first().click();
        await expect(page).toHaveURL(/\/hierarchy/);
        await expect(page.getByRole('heading', { name: /Hierarchy|Organization/i })).toBeVisible();
    });
});
