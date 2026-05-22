import { test, expect } from '@playwright/test';
import { signIn, signUp, completeOnboarding, TEST_EMAIL, TEST_PASSWORD } from './helpers/auth';

// Golden path: the critical user journey from landing to approved message.
// Tests run sequentially (workers: 1) and share browser state via storageState.

test.describe('Golden Path — Vectra', () => {

  test('1. Landing page loads and shows hero', async ({ page }) => {
    await page.goto('/');
    // Video should be present
    const video = page.locator('video');
    await expect(video).toBeAttached();
    // Navbar brand
    await expect(page.getByText('VECTRA').first()).toBeVisible();
    // Primary CTA
    await expect(page.getByRole('link', { name: /commencer gratuitement/i }).first()).toBeVisible();
  });

  test('2. Sign-in page is reachable from CTA', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /commencer/i }).first().click();
    await expect(page).toHaveURL(/auth\/sign-(up|in)/);
  });

  test('3. Sign-in with valid credentials redirects to app', async ({ page }) => {
    // Register a new user dynamically
    await signUp(page);
    // Complete onboarding to mark onboarding_completed as true in DB and redirect to /app
    await completeOnboarding(page);
    const url = page.url();
    expect(url).toMatch(/\/app/);
  });

  test('4. Dashboard renders after auth', async ({ page }) => {
    await signIn(page);
    await page.waitForURL(/\/app/, { timeout: 10_000 });
    // Dashboard should show some content
    await expect(page.locator('main, [role="main"], #main')).toBeVisible({ timeout: 8_000 });
  });

  test('5. Sourcing page loads', async ({ page }) => {
    await signIn(page);
    await page.waitForURL(/\/app/);
    await page.goto('/app/sourcing');
    // Chat input should be visible
    const input = page.locator('input[type="text"], textarea').first();
    await expect(input).toBeVisible({ timeout: 8_000 });
  });

  test('6. Library page loads and shows leads or empty state', async ({ page }) => {
    await signIn(page);
    await page.goto('/app/library');
    // Either leads list or empty state should be visible
    await expect(
      page.locator('[data-testid="lead-card"], [data-testid="empty-state"], .lead-card, h3').first()
    ).toBeVisible({ timeout: 8_000 });
  });

  test('7. Inbox page loads', async ({ page }) => {
    await signIn(page);
    await page.goto('/app/inbox');
    await expect(page.locator('main')).toBeVisible({ timeout: 8_000 });
  });

  test('8. Outreach page loads', async ({ page }) => {
    await signIn(page);
    await page.goto('/app/outreach');
    await expect(page.locator('main')).toBeVisible({ timeout: 8_000 });
  });

  test('9. Campaigns page loads', async ({ page }) => {
    await signIn(page);
    await page.goto('/app/campaigns');
    await expect(page.locator('main')).toBeVisible({ timeout: 8_000 });
  });

  test('10. Settings page loads', async ({ page }) => {
    await signIn(page);
    await page.goto('/app/settings');
    await expect(page.locator('main')).toBeVisible({ timeout: 8_000 });
    // Should show profile/settings content
    await expect(page.getByText(/settings|paramètres|profil/i).first()).toBeVisible({ timeout: 6_000 });
  });

});

test.describe('Public pages', () => {

  test('404 page renders correctly', async ({ page }) => {
    await page.goto('/cette-page-nexiste-pas-du-tout');
    await expect(page.getByText(/404|introuvable|not found/i).first()).toBeVisible({ timeout: 5_000 });
  });

  test('Pricing section visible on landing', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /tarifs/i }).first().click();
    // Scroll to pricing section
    await expect(page.getByText(/Free|Solo|Agence/).first()).toBeVisible({ timeout: 5_000 });
  });

});
