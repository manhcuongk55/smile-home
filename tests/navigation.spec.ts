import { test, expect } from '@playwright/test';

test.describe('Xgate Navigation Smoke Test', () => {
    test('should load the dashboard and show sidebar links', async ({ page }) => {
        await page.goto('/');

        // Wait for main content or sidebar
        await expect(page.locator('.sidebar')).toBeVisible();

        // Check for navigation links by partial text
        await expect(page.getByRole('link').filter({ hasText: 'Billing' })).toBeVisible();
        await expect(page.getByRole('link').filter({ hasText: 'Organization' })).toBeVisible();
        await expect(page.getByRole('link').filter({ hasText: 'Lead Pipeline' })).toBeVisible();
    });

    test('should navigate to Billing page', async ({ page }) => {
        await page.goto('/');
        await page.getByRole('link', { name: /Billing/i }).click();
        await expect(page).toHaveURL(/\/billing/);
        await expect(page.getByRole('heading', { name: /Accounting/i })).toBeVisible();
    });

    test('should navigate to Hierarchy page', async ({ page }) => {
        await page.goto('/');
        await page.getByRole('link', { name: /Organization/i }).click();
        await expect(page).toHaveURL(/\/hierarchy/);
        await expect(page.getByRole('heading', { name: /Hierarchy/i })).toBeVisible();
    });
});
