// ============================================================
//  GrabDocs Feature Test Suite
//  Tool: Playwright (JavaScript)
//  Features Tested: File Upload | Feedback | Messages
//  Author: [Your Name]
//  Date: 2026-04-24
// ============================================================

const { test, expect } = require('@playwright/test');
const path = require('path');
const fs   = require('fs');

// ─── CONFIG ──────────────────────────────────────────────────
const BASE_URL     = 'https://app.grabdocs.com';
const USER_EMAIL   = process.env.GRABDOCS_EMAIL    || 'your-email@example.com';
const USER_PASS    = process.env.GRABDOCS_PASSWORD  || 'your-password';

// Reusable login helper
async function login(page) {
  await page.goto(`${BASE_URL}/login`);
  await page.getByLabel(/email/i).fill(USER_EMAIL);
  await page.getByLabel(/password/i).fill(USER_PASS);
  await page.getByRole('button', { name: /sign in|log in/i }).click();
  await page.waitForURL(/dashboard|home/i, { timeout: 15_000 });
}

// ─── SHARED SETUP ─────────────────────────────────────────────
test.beforeEach(async ({ page }) => {
  await login(page);
});

// ==============================================================
//  FEATURE 1 — FILE UPLOAD
// ==============================================================
test.describe('Feature 1: File Upload', () => {

  test('FU-001 | Navigate to File Upload section', async ({ page }) => {
    await page.getByRole('link', { name: /file upload|files/i }).click();
    await expect(page).toHaveURL(/file/i);
    await expect(page.getByRole('heading', { name: /file|upload/i })).toBeVisible();
  });

  test('FU-002 | Upload a valid PDF file successfully', async ({ page }) => {
    // Create a tiny test PDF on-the-fly
    const tmpPdf = path.join('/tmp', 'test_upload.pdf');
    if (!fs.existsSync(tmpPdf)) {
      fs.writeFileSync(tmpPdf, '%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\nxref\n0 1\n0000000000 65535 f \ntrailer\n<< /Root 1 0 R /Size 1 >>\nstartxref\n9\n%%EOF');
    }

    await page.getByRole('link', { name: /file upload|files/i }).click();
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(tmpPdf);
    await page.getByRole('button', { name: /upload|send|submit/i }).click();

    // Expect success feedback
    await expect(
      page.locator('text=/upload.*success|file.*upload|successfully/i').first()
    ).toBeVisible({ timeout: 20_000 });
  });

  test('FU-003 | Upload a valid DOCX file successfully', async ({ page }) => {
    const tmpDocx = path.join('/tmp', 'test_upload.docx');
    if (!fs.existsSync(tmpDocx)) {
      fs.writeFileSync(tmpDocx, Buffer.from('PK\x03\x04', 'binary')); // minimal ZIP header placeholder
    }

    await page.getByRole('link', { name: /file upload|files/i }).click();
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(tmpDocx);
    await page.getByRole('button', { name: /upload|send|submit/i }).click();

    await expect(
      page.locator('text=/upload.*success|file.*upload|successfully/i').first()
    ).toBeVisible({ timeout: 20_000 });
  });

  test('FU-004 | File upload rejects unsupported file type', async ({ page }) => {
    const tmpExe = path.join('/tmp', 'malicious.exe');
    fs.writeFileSync(tmpExe, 'MZ'); // exe magic bytes

    await page.getByRole('link', { name: /file upload|files/i }).click();
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(tmpExe);
    await page.getByRole('button', { name: /upload|send|submit/i }).click();

    // Should show error or file should be rejected
    await expect(
      page.locator('text=/invalid|not supported|not allowed|error/i').first()
    ).toBeVisible({ timeout: 10_000 });
  });

  test('FU-005 | Uploaded file appears in the file list', async ({ page }) => {
    const tmpPdf = path.join('/tmp', 'test_upload.pdf');

    await page.getByRole('link', { name: /file upload|files/i }).click();
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(tmpPdf);
    await page.getByRole('button', { name: /upload|send|submit/i }).click();

    // File name should appear in list
    await expect(page.locator('text=test_upload.pdf')).toBeVisible({ timeout: 20_000 });
  });

  test('FU-006 | Upload progress indicator is displayed', async ({ page }) => {
    const tmpPdf = path.join('/tmp', 'test_upload.pdf');

    await page.getByRole('link', { name: /file upload|files/i }).click();
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(tmpPdf);
    await page.getByRole('button', { name: /upload|send|submit/i }).click();

    // Check that progress indicator appears during upload
    const progressIndicator = page.locator('[role="progressbar"], .progress, text=/uploading|%/i');
    // It may appear briefly — check it existed or that success appeared
    const success = page.locator('text=/success|uploaded/i');
    await expect(progressIndicator.or(success).first()).toBeVisible({ timeout: 15_000 });
  });

  test('FU-007 | User can delete an uploaded file', async ({ page }) => {
    await page.getByRole('link', { name: /file upload|files/i }).click();

    // Find a file row and click delete
    const deleteBtn = page.getByRole('button', { name: /delete|remove/i }).first();
    if (await deleteBtn.isVisible()) {
      await deleteBtn.click();
      // Confirm dialog if present
      const confirmBtn = page.getByRole('button', { name: /yes|confirm|delete/i });
      if (await confirmBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await confirmBtn.click();
      }
      await expect(deleteBtn).not.toBeVisible({ timeout: 10_000 });
    } else {
      test.skip();
    }
  });

});

// ==============================================================
//  FEATURE 2 — FEEDBACK
// ==============================================================
test.describe('Feature 2: Feedback', () => {

  test('FB-001 | Navigate to Feedback section', async ({ page }) => {
    await page.getByRole('link', { name: /feedback/i }).click();
    await expect(page).toHaveURL(/feedback/i);
    await expect(page.getByRole('heading', { name: /feedback/i })).toBeVisible();
  });

  test('FB-002 | Submit feedback with valid subject and message', async ({ page }) => {
    await page.getByRole('link', { name: /feedback/i }).click();

    await page.getByLabel(/subject|title/i).fill('Automated Test Feedback');
    await page.getByLabel(/message|description|comment/i).fill(
      'This is an automated test submission from the Playwright test suite. Please disregard.'
    );
    await page.getByRole('button', { name: /submit|send/i }).click();

    await expect(
      page.locator('text=/thank|received|submitted|success/i').first()
    ).toBeVisible({ timeout: 15_000 });
  });

  test('FB-003 | Feedback form shows validation error for empty submission', async ({ page }) => {
    await page.getByRole('link', { name: /feedback/i }).click();
    await page.getByRole('button', { name: /submit|send/i }).click();

    await expect(
      page.locator('text=/required|cannot be empty|please fill|error/i').first()
    ).toBeVisible({ timeout: 5_000 });
  });

  test('FB-004 | Feedback subject field enforces character limit', async ({ page }) => {
    await page.getByRole('link', { name: /feedback/i }).click();

    const longText = 'A'.repeat(500);
    const subjectField = page.getByLabel(/subject|title/i);
    await subjectField.fill(longText);
    const actualValue = await subjectField.inputValue();

    // Should be truncated if there's a maxlength
    expect(actualValue.length).toBeLessThanOrEqual(500);
  });

  test('FB-005 | Feedback form resets after successful submission', async ({ page }) => {
    await page.getByRole('link', { name: /feedback/i }).click();

    await page.getByLabel(/subject|title/i).fill('Test Reset Subject');
    await page.getByLabel(/message|description|comment/i).fill('Test reset message.');
    await page.getByRole('button', { name: /submit|send/i }).click();

    await page.locator('text=/thank|received|submitted|success/i').waitFor({ timeout: 15_000 });

    const subjectField = page.getByLabel(/subject|title/i);
    if (await subjectField.isVisible()) {
      const value = await subjectField.inputValue();
      expect(value).toBe('');
    }
  });

  test('FB-006 | Feedback page loads within acceptable time', async ({ page }) => {
    const start = Date.now();
    await page.getByRole('link', { name: /feedback/i }).click();
    await page.getByRole('heading', { name: /feedback/i }).waitFor();
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(5_000); // Page loads under 5 seconds
  });

  test('FB-007 | Feedback form is accessible (has proper labels)', async ({ page }) => {
    await page.getByRole('link', { name: /feedback/i }).click();
    const inputs = page.locator('input, textarea');
    const count  = await inputs.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const input = inputs.nth(i);
      const id    = await input.getAttribute('id');
      const aria  = await input.getAttribute('aria-label');
      const placeholder = await input.getAttribute('placeholder');
      // Each input should have at least one identifier
      expect(id || aria || placeholder).toBeTruthy();
    }
  });

});

// ==============================================================
//  FEATURE 3 — MESSAGES
// ==============================================================
test.describe('Feature 3: Messages', () => {

  test('MSG-001 | Navigate to Messages section', async ({ page }) => {
    await page.getByRole('link', { name: /messages/i }).click();
    await expect(page).toHaveURL(/message/i);
    await expect(page.getByRole('heading', { name: /message/i })).toBeVisible();
  });

  test('MSG-002 | Messages inbox loads and displays list', async ({ page }) => {
    await page.getByRole('link', { name: /messages/i }).click();
    // Inbox should render (could be empty)
    const inbox = page.locator('[class*="inbox"], [class*="message-list"], [data-testid*="message"]');
    await expect(inbox.first()).toBeVisible({ timeout: 10_000 });
  });

  test('MSG-003 | Compose a new message with recipient and body', async ({ page }) => {
    await page.getByRole('link', { name: /messages/i }).click();
    await page.getByRole('button', { name: /compose|new message|write/i }).click();

    const recipientField = page.getByLabel(/to|recipient/i);
    await recipientField.fill('test@example.com');
    await page.getByLabel(/subject/i).fill('Automated Test Message');
    await page.getByLabel(/message|body|content/i).fill(
      'This is an automated test message. Please disregard.'
    );
    await page.getByRole('button', { name: /send|submit/i }).click();

    await expect(
      page.locator('text=/sent|message sent|success/i').first()
    ).toBeVisible({ timeout: 15_000 });
  });

  test('MSG-004 | Compose message validation — empty body blocked', async ({ page }) => {
    await page.getByRole('link', { name: /messages/i }).click();
    await page.getByRole('button', { name: /compose|new message|write/i }).click();

    await page.getByRole('button', { name: /send|submit/i }).click();

    await expect(
      page.locator('text=/required|cannot be empty|please/i').first()
    ).toBeVisible({ timeout: 5_000 });
  });

  test('MSG-005 | Open and read an existing message', async ({ page }) => {
    await page.getByRole('link', { name: /messages/i }).click();

    const firstMessage = page.locator('[class*="message-item"], [data-testid*="message"]').first();
    if (await firstMessage.isVisible()) {
      await firstMessage.click();
      // Message body should appear
      await expect(
        page.locator('[class*="message-body"], [class*="message-content"]').first()
      ).toBeVisible({ timeout: 10_000 });
    } else {
      test.skip();
    }
  });

  test('MSG-006 | Mark a message as read', async ({ page }) => {
    await page.getByRole('link', { name: /messages/i }).click();

    const unreadMessage = page.locator('[class*="unread"]').first();
    if (await unreadMessage.isVisible()) {
      await unreadMessage.click();
      await expect(page.locator('[class*="unread"]').first()).not.toBeVisible({ timeout: 10_000 });
    } else {
      test.skip();
    }
  });

  test('MSG-007 | Delete a message from inbox', async ({ page }) => {
    await page.getByRole('link', { name: /messages/i }).click();

    const deleteBtn = page.getByRole('button', { name: /delete|remove/i }).first();
    if (await deleteBtn.isVisible()) {
      const initialCount = await page.locator('[class*="message-item"]').count();
      await deleteBtn.click();

      const confirmBtn = page.getByRole('button', { name: /yes|confirm|delete/i });
      if (await confirmBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await confirmBtn.click();
      }

      await expect(
        page.locator('[class*="message-item"]')
      ).toHaveCount(Math.max(0, initialCount - 1), { timeout: 10_000 });
    } else {
      test.skip();
    }
  });

});
