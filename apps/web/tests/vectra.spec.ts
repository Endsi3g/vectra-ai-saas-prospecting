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

  // Mock follow_ups queries
  await page.route('**/rest/v1/follow_ups*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        {
          lead_id: 'lead-1',
          status: 'message_envoye',
          follow_up_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          notes: 'A relancer !'
        },
      ]),
    });
  });

  // Mock inbox_conversations and inbox_messages
  await page.route('**/rest/v1/inbox_conversations*', async (route) => {
    const mockConversations = [
      {
        id: 'conv-interested-jenkins',
        sentiment: 'interested',
        last_message_text: 'Bonjour Kael, oui votre audit de saasinc.com m’intéresse carrément !',
        updated_at: new Date().toISOString(),
        lead: {
          name: 'Sarah Jenkins',
          company: 'SaaS Inc',
          email: 'sarah@saasinc.com',
          website: 'saasinc.com',
          campaign: {
            name: 'Audit SaaS Growth'
          }
        },
        messages: [
          {
            id: 'msg-interested-jenkins',
            conversation_id: 'conv-interested-jenkins',
            nylas_message_id: 'msg-interested-jenkins',
            sender_type: 'prospect',
            body: 'Bonjour Kael, oui votre audit de saasinc.com m’intéresse carrément !',
            snippet: 'Bonjour Kael, oui votre audit de saasinc.com m’intéresse carrément !',
            subject: 'Re: Amélioration SaaS',
            magic_reply_draft: 'Bonjour Sarah,\n\nMerci beaucoup pour votre intérêt ! Je suis ravi que notre audit vous intéresse.\n\nQue diriez-vous d\'un échange rapide jeudi à 15h00 pour en discuter de vive voix ?\nVoici mon lien direct : calendly.com/vectra/demo\n\nExcellente journée,\nL\'équipe Vectra',
            created_at: new Date(Date.now() - 10000).toISOString()
          }
        ]
      },
      {
        id: 'conv-objection-leclerc',
        sentiment: 'objection',
        last_message_text: 'Bonjour, c\'est un peu trop cher pour nous. Est-ce négociable ?',
        updated_at: new Date(Date.now() - 20000).toISOString(),
        lead: {
          name: 'Marc-André Leclerc',
          company: 'LeadFlow AI',
          email: 'marc-andre@leadflow.ai',
          website: 'leadflow.ai',
          campaign: {
            name: 'Outbound Pricing'
          }
        },
        messages: [
          {
            id: 'msg-objection-leclerc',
            conversation_id: 'conv-objection-leclerc',
            nylas_message_id: 'msg-objection-leclerc',
            sender_type: 'prospect',
            body: 'Bonjour, c\'est un peu trop cher pour nous. Est-ce négociable ?',
            snippet: 'Bonjour, c\'est un peu trop cher pour nous.',
            subject: 'Re: Question de tarifs',
            magic_reply_draft: 'Bonjour Marc-André,\n\nMerci pour votre retour ! C\'est une excellente question. Nos forfaits commencent à seulement 49€/mois pour la formule Solo Pro.\n\nSeriez-vous disponible ce jeudi à 11h pour un court appel de 5 minutes ?\n\nBien à vous,\nL\'équipe Vectra',
            created_at: new Date(Date.now() - 20000).toISOString()
          }
        ]
      }
    ];

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockConversations),
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
    await expect(page.locator('button:has-text("Préférences")')).toBeVisible();
    
    // Check the left history column header
    await expect(page.locator('text=Search History')).toBeVisible();
    // Check the empty state message in history column
    await expect(page.locator('text=Aucune recherche récente')).toBeVisible();
    
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

  test('4. Outreach Hub Vectra Features: NLP Pitch, Copilot Alert, Shortlist/Hide Buttons, and Fit Badge', async ({ page }) => {
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
    // 1. Check Inbox Page and Interactions
    await page.goto('/app/inbox');
    await expect(page.locator('header').getByText('Inbox', { exact: true })).toBeVisible();
    await expect(page.locator('text=Sarah Jenkins').first()).toBeVisible();
    await expect(page.locator('text=Magic Replies (IA)')).toBeVisible();
    await expect(page.locator('button:has-text("Proposer un appel")')).toBeVisible();

    // Click on Objections filter tab
    await page.click('button:has-text("Objections")');
    await expect(page.locator('button:has-text("Marc-André Leclerc")')).toBeVisible();
    await expect(page.locator('button:has-text("Sarah Jenkins")')).not.toBeVisible();

    // Select Marc-André Leclerc conversation
    await page.click('button:has-text("Marc-André Leclerc")');
    await expect(page.locator('text=Marc-André Leclerc (LeadFlow AI)').first()).toBeVisible();

    // Click a Magic Reply button
    await page.click('button:has-text("Justifier le Tarif")');
    
    // Check that the textarea value is updated with the generated reply text
    const textarea = page.locator('textarea[placeholder*="Répondre à"]');
    await expect(textarea).not.toHaveValue('');
    await expect(textarea).toHaveValue(/Marc-André/);

    // Send the reply
    await page.click('button:has-text("Envoyer")');
    await expect(page.locator('text=Réponse envoyée avec succès')).toBeVisible();

    // 2. Check Agents Page and Interactions
    await page.goto('/app/agents');
    await expect(page.locator('header').getByText('Agents', { exact: true })).toBeVisible();
    await expect(page.locator('text=Hermes (Sourcing Automatique)')).toBeVisible();
    await expect(page.locator('text=Apollo (Analyse & Personnalisation)')).toBeVisible();
    await expect(page.locator('text=Score de Match Minimum')).toBeVisible();

    // Verify developer terminal is present on page
    await expect(page.locator('text=Developer Terminal & Agent Logs')).toBeVisible();
    
    // Click terminal toggle to open it
    await page.click('text=Developer Terminal & Agent Logs');
    await expect(page.locator('text=Developer Terminal Initialized')).toBeVisible();

    // Select a campaign using the first select element
    await page.locator('select').first().selectOption({ index: 0 });

    // Save configuration
    await page.click('button:has-text("Enregistrer")');
    await expect(page.locator('text=Configuration enregistrée !')).toBeVisible();

    // Run simulated cycle (button text changes to 'Lancer le Cycle' in the terminal header)
    await page.locator('button:has-text("Lancer le Cycle")').first().click();
    // Wait for the terminal to open and show the first log entry
    await page.waitForTimeout(500);
    await expect(page.locator('text=Démarrage du cycle Hermes')).toBeVisible();

    // 3. Check Analytics Page and Interactions
    await page.goto('/app/analytics');
    await expect(page.locator('header').getByText('Analytics', { exact: true })).toBeVisible();
    await expect(page.locator('text=Taux d\'Ouverture')).toBeVisible();
    await expect(page.locator('text=Taux de Réponse')).toBeVisible();
    await expect(page.locator('text=Leads Importés')).toBeVisible();
    await expect(page.locator('text=Appels Planifiés').first()).toBeVisible();

    // Toggle Timeframe filters
    await page.click('button:has-text("30 Jours")');
    await page.waitForTimeout(200);

    // Toggle Campaign Selector filter
    await page.locator('select').first().selectOption({ index: 1 });
    await page.waitForTimeout(200);

    // Click refresh and verify it returns to nominal idle state
    await page.click('button:has-text("Actualiser")');
    await expect(page.locator('button:has-text("Actualiser")')).toBeVisible();
  });

  test('7. Follow-up Tracker Page', async ({ page }) => {
    // Navigate to the new Follow-up page
    await page.goto('/app/followup');
    
    // Check header
    await expect(page.locator('header').getByText('Follow-up Tracker')).toBeVisible();
    await expect(page.locator('button:has-text("Ajouter un lead")')).toBeVisible();
    
    // Check filters are present
    await expect(page.locator('text=Filtres :')).toBeVisible();
    
    // Wait for data to load (using the mocked lead data from beforeEach)
    await expect(page.locator('text=Jean Dupont')).toBeVisible();
    await expect(page.locator('text=SaaS Inc')).toBeVisible();
    
    // Check that overdue badge shows up (mocked follow_ups has an overdue date for lead-1)
    await expect(page.locator('text=En retard').first()).toBeVisible();
    
    // Change a select status
    // Select the first status select element
    const statusSelect = page.locator('table tbody tr:first-child td select').first();
    await statusSelect.selectOption('deal_conclu');
    
    // The visual color of the select should change to the emerald class (we can check if deal_conclu is selected)
    await expect(statusSelect).toHaveValue('deal_conclu');
  });

  test('8. Cold Calling Simulator Page', async ({ page }) => {
    // Navigate to the Cold Call Simulator page
    await page.goto('/app/training');

    // Check header
    await expect(page.locator('header').getByText('Cold Call Simulator')).toBeVisible();
    await expect(page.locator('h1:has-text("Simulateur d\'Appel (IA)")')).toBeVisible();

    // Check that we have a persona selection card
    await expect(page.locator('text=Le CEO Pressé')).toBeVisible();
    await expect(page.locator('text=Le CTO Sceptique')).toBeVisible();

    // Select "Le CEO Pressé" (which is selected by default, but let's click it)
    await page.click('text=Le CEO Pressé');

    // Launch simulation
    await page.click('button:has-text("Lancer la Simulation")');

    // Verify simulation starts
    await expect(page.locator('text=Appel en cours...')).toBeVisible();
    await expect(page.locator('text=Marc (CEO)')).toBeVisible();

    // The agent typing state should be visible initially
    // Since agent typing has a 1.5s timeout, we can wait for the first message.
    await page.waitForTimeout(2000);
    await expect(page.locator('text=Oui, bonjour. Je suis très occupé, c\'est à quel sujet ?')).toBeVisible();

    // Type a response in the input
    const input = page.locator('input[placeholder*="Tapez votre réponse"]');
    await expect(input).toBeVisible();
    await input.fill('Bonjour Marc, je vous contacte pour doubler vos rendez-vous qualifiés.');

    // Click send
    await page.click('form button[type="submit"]');

    // Verify user message appears
    await expect(page.locator('text=Bonjour Marc, je vous contacte pour doubler vos rendez-vous qualifiés.')).toBeVisible();

    // Agent response starts typing and then appears
    await page.waitForTimeout(2500);
    
    // Check that some response from agent CEO pressé is visible
    // First response for CEO busy is: 'Allez droit au but, je rentre en réunion dans 2 minutes. Quelle est votre proposition de valeur ?'
    await expect(page.locator('text=Allez droit au but, je rentre en réunion dans 2 minutes.')).toBeVisible();
  });
});

