import type { Page } from '@playwright/test';

const TEST_EMAIL = process.env.TEST_USER_EMAIL ?? `test-${Date.now()}@vectra-e2e.dev`;
const TEST_PASSWORD = process.env.TEST_USER_PASSWORD ?? 'TestPassword123!';

export { TEST_EMAIL, TEST_PASSWORD };

export async function signUp(page: Page, email = TEST_EMAIL, password = TEST_PASSWORD) {
  await page.goto('/auth/sign-up');
  await page.locator('#signup-email').fill(email);
  await page.locator('#signup-password').fill(password);
  await page.locator('#signup-confirm-password').fill(password);
  await page.getByRole('button', { name: /s'inscrire|créer/i }).click();
}

export async function signIn(page: Page, email = TEST_EMAIL, password = TEST_PASSWORD) {
  await page.goto('/auth/sign-in');
  await page.locator('#signin-email').fill(email);
  await page.locator('#signin-password').fill(password);
  await page.getByRole('button', { name: /connexion|se connecter/i }).click();
}

export async function signOut(page: Page) {
  // Click profile dropdown → sign out
  await page.getByTestId('profile-dropdown').click();
  await page.getByRole('menuitem', { name: /déconnexion|sign out/i }).click();
  await page.waitForURL(/auth\/sign-in/);
}

export async function completeOnboarding(page: Page) {
  await page.waitForURL(/\/onboarding/, { timeout: 10_000 });
  await page.locator('#firstName').fill('Test');
  await page.locator('#lastName').fill('User');
  await page.getByRole('button', { name: /continuer/i }).click();

  await page.locator('#compName').fill('Vectra Test');
  await page.locator('#pitch').fill('We build amazing automated outreach campaigns');
  await page.getByRole('button', { name: /continuer/i }).click();

  await page.locator('#icp').fill('SaaS Founders B2B');
  await page.getByRole('button', { name: /continuer/i }).click();

  await page.getByRole('button', { name: /passer/i }).click();

  await page.getByRole('button', { name: /lancer/i }).click();
  await page.waitForURL(/\/app/, { timeout: 15_000 });
}
