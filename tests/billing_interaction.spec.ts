import { test, expect } from '@playwright/test';

test.describe('Billing Interaction Workflow', () => {
    test('should allow adding a note to an invoice', async ({ page }) => {
        await page.goto('/billing');

        // Find the first "Add Note" button and click it
        const addNoteBtn = page.getByRole('button', { name: /Add Note/i }).first();
        await expect(addNoteBtn).toBeVisible();
        await addNoteBtn.click();

        // Check if modal is visible
        await expect(page.getByRole('heading', { name: /Add Communication Log/i })).toBeVisible();

        // Fill the note
        const testNote = `Automated Test Note - ${Date.now()}`;
        await page.locator('textarea').fill(testNote);
        await page.getByRole('button', { name: /Save Note/i }).click();

        // Verify toast message
        await expect(page.locator('.toast')).toContainText('Note added successfully');
    });

    test('should allow transitioning invoice from PENDING to PAID (visual check)', async ({ page }) => {
        await page.goto('/billing');

        // Look for a PENDING badge
        const pendingRow = page.locator('tr').filter({ hasText: 'PENDING' }).first();

        if (await pendingRow.count() > 0) {
            await pendingRow.getByRole('button', { name: /Paid/i }).click();

            // Wait for toast and status change
            await expect(page.locator('.toast')).toBeVisible();
            // The status should change to PAID (or VERIFIED depending on flow, but our button says Paid)
            await expect(pendingRow).toContainText('PAID');
        } else {
            console.log('No PENDING invoices found to test transition.');
        }
    });
});
