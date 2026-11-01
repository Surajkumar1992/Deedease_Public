// Real-browser test of the waitlist form: loads the live page, submits it and
// waits for the page's own success/error message (so it exercises Web3Forms
// exactly as a visitor would). Uses 1 Web3Forms submission per run.
import { chromium } from 'playwright-core';

const SITE_URL = process.env.SITE_URL || 'https://deedease.com';
const TEST_EMAIL = 'healthcheck@deedease.com';

const browser = await chromium.launch({ channel: 'chrome', headless: true });
let exitCode = 0;
try {
  const page = await browser.newPage();
  page.on('console', (m) => m.type() === 'error' && console.log('[page error]', m.text()));
  await page.goto(SITE_URL, { waitUntil: 'load', timeout: 30000 });

  const form = page.locator('form[data-form="waitlist"]');
  await form.locator('input[name="email"]').fill(TEST_EMAIL);
  await form.locator('button[type="submit"]').click();

  const status = form.locator('.form-status.ok, .form-status.err');
  await status.first().waitFor({ timeout: 30000 });
  const text = (await status.first().innerText()).trim();
  const ok = await form.locator('.form-status.ok').count();
  console.log(`Form status: ${ok ? 'OK' : 'ERROR'} - ${text}`);
  if (!ok) exitCode = 1;
} catch (err) {
  console.log('Form test failed:', err.message);
  exitCode = 1;
} finally {
  await browser.close();
}
process.exit(exitCode);
