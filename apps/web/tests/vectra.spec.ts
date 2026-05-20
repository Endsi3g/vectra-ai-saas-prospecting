import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page, context }) => {
  // Set mock auth cookie & header for server-side middleware bypass
  await context.setExtraHTTPHeaders({
    'x-test-bypass': 'true'
  });
  await context.addCookies([{
    name: 'sb-mock-session',
    value: 'true',
    domain: 'localhost',
    path: '/'
  }]);

  // Capture page console logs, requests and errors for debugging
  page.on('console', msg => console.log(`[BROWSER LOG] [${msg.type()}] ${msg.text()}`));
  page.on('pageerror', err => console.error(`[BROWSER EXCEPTION] ${err.message}\n${err.stack}`));
  page.on('request', req => console.log(`>> REQ: ${req.method()} ${req.url()}`));
  page.on('response', res => console.log(`<< RESP: ${res.status()} ${res.url()}`));

  // Seed local storage with a mock Supabase session before page load (Supabase JS v2 format)
  await page.addInitScript(() => {
    const mockSession = {
      access_token: 'mock-access-token',
      refresh_token: 'mock-refresh-token',
      expires_in: 3600,
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      token_type: 'bearer',
      user: {
        id: 'mock-user-id',
        email: 'kael@example.com',
        role: 'authenticated',
        aud: 'authenticated'
      }
    };
    window.localStorage.setItem('sb-placeholder-auth-token', JSON.stringify(mockSession));
    window.localStorage.setItem('sb-xuzkfnpzmmtgpsjaiguv-auth-token', JSON.stringify(mockSession));
    window.localStorage.setItem('tour_completed', 'true');
  });

  // Mock Supabase Auth check
  await page.route('**/auth/v1/user*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 'mock-user-id',
        email: 'kael@example.com',
        aud: 'authenticated',
        role: 'authenticated',
      }),
    });
  });

  // Mock profile query
  await page.route('**/rest/v1/profiles*', async (route) => {
    const isSingle = route.request().headers()['accept']?.includes('vnd.pgrst.object') || route.request().url().includes('single');
    const data = {
      id: 'mock-user-id',
      tour_completed: true,
      credits_count: 1500,
      credits_limit: 2000,
      business_type: 'solopreneur',
    };
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(isSingle ? data : [data]),
    });
  });

  // Mock campaigns queries
  await page.route('**/rest/v1/campaigns*', async (route) => {
    const headers = route.request().headers();
    const acceptHeader = headers['accept'] || '';
    // A query is single only if vnd.pgrst.object is explicitly requested, or if limit=1 query param is set.
    const isSingle = acceptHeader.includes('vnd.pgrst.object') || route.request().url().includes('limit=1');
    const data = {
      id: 'mock-campaign-id',
      name: 'SaaS Leads Canada',
      business_type: 'solopreneur',
      offer: 'Je crée des landing pages de haute qualité.',
      icp: 'Saas founders based in Canada.',
      angle: 'audit',
      angle_description: 'Proposer un audit gratuit de leur landing page.',
      call_to_action: 'proposer un appel de 20 minutes',
      extra_instructions: 'Je crée des landing pages de haute qualité.',
    };
    
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(isSingle ? data : [data]),
    });
  });

  // Mock leads queries
  await page.route('**/rest/v1/leads*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        {
          id: 'lead-1',
          campaign_id: 'mock-campaign-id',
          name: 'Jean Dupont',
          company: 'SaaS Inc',
          website: 'saasinc.com',
          email: 'jean@saasinc.com',
          notes: 'Found on LinkedIn.',
        },
      ]),
    });
  });

  // Mock messages queries
  await page.route('**/rest/v1/messages*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        {
          id: 'msg-1',
          lead_id: 'lead-1',
          email_subject: 'Proposition de design pour SaaS Inc',
          email_body: 'Bonjour Jean, j\'ai analysé votre site saasinc.com...',
          linkedin_message: 'Salut Jean, top votre SaaS...',
          personalization_score: 95,
          status: 'draft',
        },
      ]),
    });
  });
});

test.describe('Vectra E2E UI Tests', () => {
  test('1. Dashboard Navigation & Credit Widget Renders', async ({ page }) => {
    await page.goto('/app');
    
    // Check main layout branding and user workspace
    await expect(page.locator('aside')).toBeVisible();
    await expect(page.locator('text=Kael\'s Workspace')).toBeVisible();
    
    // Check credits indicator widget
    await expect(page.locator('text=1,500')).toBeVisible();
    
    // Check main dashboard components
    await expect(page.locator('text=Active Search Campaigns')).toBeVisible();
  });

  test('2. Sourcing Chat Interface Renders Timeline & Inputs', async ({ page }) => {
    await page.goto('/app/sourcing');
    
    // Check breadcrumb
    await expect(page.locator('header').locator('text=Sourcing')).toBeVisible();
    
    // Check navigation preferences button
    await expect(page.locator('button:has-text("Preferences")')).toBeVisible();
    
    // Check timelines
    await expect(page.locator('text=Job Description')).toBeVisible();
    await expect(page.locator('text=Refine Search')).toBeVisible();
    
    // Check chat input element using the stable DOM ID 'sourcing-chat-input'
    const chatInput = page.locator('input#sourcing-chat-input');
    await expect(chatInput).toBeVisible();
  });

  test('3. Library Network Split Layout Renders', async ({ page }) => {
    await page.goto('/app/library');
    
    // Check breadcrumbs and headers
    await expect(page.locator('header').locator('text=Library')).toBeVisible();
    await expect(page.locator('button:has-text("Sources")')).toBeVisible();
    await expect(page.locator('button:has-text("Share")')).toBeVisible();
    
    // Check network title
    await expect(page.locator('text=Kael\'s Shared Network')).toBeVisible();
    await expect(page.locator('text=Privacy & Accessibility')).toBeVisible();
  });

  test('4. Outreach Hub Wrangle Features: NLP Pitch, Copilot Alert, Shortlist/Hide Buttons, and Fit Badge', async ({ page }) => {
    await page.goto('/app/outreach');
    
    // Check campaign name loading (inside select options)
    const selectDropdown = page.locator('header select');
    await expect(selectDropdown).toBeVisible();
    
    // Check single natural language pitch box
    const pitchTextarea = page.locator('textarea[placeholder*="Décrivez votre offre"]');
    await expect(pitchTextarea).toBeVisible();
    
    // Check Copilot summary card
    await expect(page.locator('text=Copilot Outreach Insights')).toBeVisible();
    
    // Check lead name in list (Heading target for exactness)
    await expect(page.locator('h3:has-text("Jean Dupont")')).toBeVisible();
    
    // Check Fit badge (95% personalization score converts to "Fit: High")
    await expect(page.getByText('Fit: High').first()).toBeVisible();
    
    // Select lead to show buttons
    await page.locator('button:has-text("Jean Dupont")').first().click();
    
    // Check Action Buttons: "Shortlist Candidate" and "Hide Candidate"
    await expect(page.locator('button:has-text("Shortlist Candidate")')).toBeVisible();
    await expect(page.locator('button:has-text("Hide Candidate")')).toBeVisible();
    
    // Check show hidden leads checkbox toggle
    const checkbox = page.locator('input[type="checkbox"]#show-hidden');
    await expect(checkbox).toBeVisible();
    await expect(checkbox).not.toBeChecked();
  });

  test('5. Settings Page sub-routes validation', async ({ page }) => {
    // 1. Check Connections Page
    await page.goto('/app/settings');
    await expect(page.locator('header').getByText('Connections', { exact: true })).toBeVisible();
    await expect(page.locator('text=Configuration de l\'IA (Onboarding)')).toBeVisible();
    await expect(page.locator('text=Tonalité par défaut des messages')).toBeVisible();

    // 2. Check Team Members Page
    await page.goto('/app/settings/members');
    await expect(page.locator('header').getByText('Members', { exact: true })).toBeVisible();
    await expect(page.locator('h1:has-text("Team Members")')).toBeVisible();
    await expect(page.locator('button:has-text("Invite")')).toBeVisible();
    await expect(page.locator('button:has-text("Copy join link")')).toBeVisible();

    // 3. Check Branding Page
    await page.goto('/app/settings/branding');
    await expect(page.locator('header').getByText('Branding', { exact: true })).toBeVisible();
    await expect(page.locator('h1:has-text("Branding")')).toBeVisible();
    await expect(page.locator('text=Primary Color')).toBeVisible();
    await expect(page.locator('text=Secondary Color')).toBeVisible();

    // 4. Check Plans Page
    await page.goto('/app/settings/plans');
    await expect(page.locator('header').getByText('Plans', { exact: true })).toBeVisible();
    await expect(page.locator('h1:has-text("Plans")')).toBeVisible();
    await expect(page.locator('h3:has-text("Starter")')).toBeVisible();
    await expect(page.locator('h3:has-text("Scale")')).toBeVisible();
    await expect(page.locator('button:has-text("Upgrade to Starter")')).toBeVisible();

    // 5. Check Integrations Page
    await page.goto('/app/settings/integrations');
    await expect(page.locator('header').getByText('Integrations', { exact: true })).toBeVisible();
    await expect(page.locator('h1:has-text("Integrations")')).toBeVisible();
    await expect(page.locator('text=Ashby')).toBeVisible();
    await expect(page.locator('text=greenhouse')).toBeVisible();
    await expect(page.locator('text=LEVER')).toBeVisible();
    await expect(page.locator('button:has-text("Add to Slack")')).toBeVisible();
  });

  test('6. New Premium Modules validation (Inbox, Agents, Analytics)', async ({ page }) => {
    // 1. Check Inbox Page
    await page.goto('/app/inbox');
    await expect(page.locator('header').getByText('Inbox', { exact: true })).toBeVisible();
    await expect(page.locator('text=Sarah Jenkins').first()).toBeVisible();
    await expect(page.locator('text=Magic Replies (IA)')).toBeVisible();
    await expect(page.locator('button:has-text("Proposer un appel")')).toBeVisible();

    // 2. Check Agents Page
    await page.goto('/app/agents');
    await expect(page.locator('header').getByText('Agents', { exact: true })).toBeVisible();
    await expect(page.locator('text=Hermes (Sourcing Automatique)')).toBeVisible();
    await expect(page.locator('text=Apollo (Analyse & Personnalisation)')).toBeVisible();
    await expect(page.locator('text=Score de Match Minimum')).toBeVisible();
    // Verify that NO terminal/log console is present on page
    await expect(page.locator('text=Console Terminal')).not.toBeVisible();
    await expect(page.locator('text=Crawling, Scoring, Draft generation')).not.toBeVisible();

    // 3. Check Analytics Page
    await page.goto('/app/analytics');
    await expect(page.locator('header').getByText('Analytics', { exact: true })).toBeVisible();
    await expect(page.locator('text=Taux d\'Ouverture')).toBeVisible();
    await expect(page.locator('text=Taux de Réponse')).toBeVisible();
    await expect(page.locator('text=Leads Importés')).toBeVisible();
    await expect(page.locator('text=Appels Planifiés').first()).toBeVisible();
  });
});
