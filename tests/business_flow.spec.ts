import { test, expect } from '@playwright/test';

test.describe('End-to-End Business Flow', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        // Seed data if needed to ensure we have content
        const seedBtn = page.getByRole('button', { name: /Seed/i });
        if (await seedBtn.isVisible()) {
            await seedBtn.click();
            await expect(page.locator('.toast')).toBeVisible();
        }
    });

    test('Full Business Cycle: Leads -> Rooms -> Billing', async ({ page }) => {
        // 1. Lead Verification
        await page.goto('/leads');
        // Wait for board or table
        await expect(page.locator('.kanban-board, .data-table')).toBeVisible();
        const leadCard = page.locator('.kanban-card').first();
        await expect(leadCard).toBeVisible();
        console.log('Leads verified.');

        // 2. Room Discovery
        await page.goto('/rooms');
        await expect(page.locator('.room-tile, .data-table')).toBeVisible();
        console.log('Rooms verified.');

        // 3. Billing & Interactions
        await page.goto('/billing');
        await expect(page.locator('.data-table')).toBeVisible();

        // Find a Pending invoice
        const pendingRow = page.locator('tr').filter({ hasText: 'PENDING' }).first();

        if (await pendingRow.count() > 0) {
            // Add a note
            await pendingRow.getByRole('button', { name: /Add Note/i }).click();
            const testNote = `Business Flow Test Note - ${Date.now()}`;
            await page.locator('textarea').fill(testNote);
            await page.getByRole('button', { name: /Save Note|Submit/i }).click();
            await expect(page.locator('.toast')).toContainText('successfully');

            // Transition to Paid
            await pendingRow.getByRole('button', { name: /Paid/i }).click();
            await expect(page.locator('.toast')).toBeVisible();
            await expect(pendingRow).toContainText('PAID');
            console.log('Billing transition verified.');
        } else {
            console.log('No PENDING invoices found for billing test.');
        }

        // 4. Dashboard Verification
        await page.goto('/');
        // Verify stats card for Invoices or Revenue is present
        await expect(page.locator('.stat-card')).toHaveCount(4);
        console.log('Dashboard verified.');
    });
});
