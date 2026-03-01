import { test, expect } from '@playwright/test';

test.describe('Accounting Flow', () => {
    test.beforeAll(async ({ request }) => {
        // Ensure we have data
        await request.post('/api/seed');
    });

    test('should manage invoice lifecycle (Pending -> Paid -> Verified)', async ({ page }) => {
        await page.goto('/billing');

        // 1. Verify stats bar presence
        await expect(page.locator('.stats-grid')).toBeVisible();

        // 2. Filter by PENDING
        await page.click('button.filter-tab:has-text("PENDING")');

        // 3. Select an invoice to view detail
        const firstInvoiceRow = page.locator('tr.row-hover').filter({ hasText: 'PENDING' }).first();
        await expect(firstInvoiceRow).toBeVisible({ timeout: 10000 });

        const invoiceNumCell = firstInvoiceRow.locator('td').first();
        const invoiceNum = (await invoiceNumCell.textContent())?.trim();

        await firstInvoiceRow.click();

        // 4. Verify Modal Workspace
        await expect(page.locator('.modal.wide')).toBeVisible();
        if (invoiceNum) {
            await expect(page.locator('.modal.wide')).toContainText(invoiceNum);
        }

        // 5. Mark as PAID
        await page.click('.modal.wide button:has-text("Mark as Paid")');
        await expect(page.locator('.toast.success')).toBeVisible();

        // Verify badge in modal updates to blue (PAID)
        await expect(page.locator('.modal.wide .badge:has-text("PAID")')).toBeVisible();

        // 6. Verify Payment (Mark as VERIFIED)
        await page.click('.modal.wide button:has-text("Verify Payment")');
        await expect(page.locator('.toast.success')).toBeVisible();
        await expect(page.locator('.modal.wide .badge:has-text("VERIFIED")')).toBeVisible();

        // 7. Add internal log
        await page.fill('textarea[placeholder*="Add payment notes"]', 'Test verification log by automate.');
        await page.click('button:has-text("Save Activity")');
        await expect(page.locator('.toast.success')).toContainText('Interaction logged');

        await page.click('.modal-close');
        await expect(page.locator('.modal.wide')).not.toBeVisible();
    });

    test('should filter invoices by status', async ({ page }) => {
        await page.goto('/billing');

        const tabs = ['PENDING', 'PAID', 'VERIFIED'];
        for (const tab of tabs) {
            await page.click(`button.filter-tab:has-text("${tab}")`);
            // Wait for data load
            await page.waitForTimeout(500);
            const rows = page.locator('tbody tr');
            const count = await rows.count();
            if (count > 0) {
                // Check status of at least the first item
                await expect(rows.first().locator('.badge')).toContainText(tab);
            }
        }
    });
});
