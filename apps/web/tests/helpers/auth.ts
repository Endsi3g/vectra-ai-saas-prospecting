import type { Page } from '@playwright/test';

const TEST_EMAIL = process.env.TEST_USER_EMAIL ?? `test-${Date.now()}@vectra-e2e.dev`;
const TEST_PASSWORD = process.env.TEST_USER_PASSWORD ?? 'TestPassword123!';

export { TEST_EMAIL, TEST_PASSWORD };

export async function signUp(page: Page, email = TEST_EMAIL, password = TEST_PASSWORD) {
  await page.goto('/auth/sign-up');
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/mot de passe/i).fill(password);
  await page.getByRole('button', { name: /s'inscrire|créer/i }).click();
}

export async function signIn(page: Page, email = TEST_EMAIL, password = TEST_PASSWORD) {
  await page.goto('/auth/sign-in');
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/mot de passe/i).fill(password);
  await page.getByRole('button', { name: /connexion|se connecter/i }).click();
}

export async function signOut(page: Page) {
  // Click profile dropdown → sign out
  await page.getByTestId('profile-dropdown').click();
  await page.getByRole('menuitem', { name: /déconnexion|sign out/i }).click();
  await page.waitForURL(/auth\/sign-in/);
}
