import { test, expect } from '@playwright/test';

// In-memory array of mailboxes for stateful testing
let mockMailboxes: any[] = [];

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

  // Seed local storage with a mock Supabase session before page load
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

  // Stateful Mock for Mailboxes table
  await page.route('**/rest/v1/mailboxes*', async (route) => {
    const method = route.request().method();
    if (method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockMailboxes),
      });
    } else if (method === 'POST') {
      const payload = route.request().postDataJSON();
      const newMailbox = {
        id: `mock-mailbox-id-${Math.random().toString(36).substring(7)}`,
        created_at: new Date().toISOString(),
        status: 'connected',
        ...payload,
      };
      mockMailboxes.push(newMailbox);
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify([newMailbox]),
      });
    } else if (method === 'DELETE') {
      const url = route.request().url();
      const match = url.match(/id=eq\.(.+)/);
      if (match && match[1]) {
        mockMailboxes = mockMailboxes.filter(m => m.id !== match[1]);
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    } else {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    }
  });

  // Mock Inbox Conversations and Messages
  await page.route('**/rest/v1/inbox_conversations*', async (route) => {
    const mockConversations = [
      {
        id: 'conv-interested-99',
        sentiment: 'interested',
        last_message_text: 'Bonjour Kael, oui votre audit de techgrowth.fr m’intéresse carrément ! Êtes-vous dispo ce jeudi après-midi pour en parler ?',
        updated_at: new Date().toISOString(),
        lead: {
          name: 'Marie Laurent',
          company: 'TECHGROWTH',
          email: 'marie.laurent@techgrowth.fr',
          website: 'techgrowth.fr',
          campaign: {
            name: 'Audit SaaS Growth'
          }
        },
        messages: [
          {
            id: 'msg-interested-99',
            conversation_id: 'conv-interested-99',
            nylas_message_id: 'msg-interested-99',
            sender_type: 'prospect',
            body: 'Bonjour Kael, oui votre audit de techgrowth.fr m’intéresse carrément ! Êtes-vous dispo ce jeudi après-midi pour en parler ?',
            snippet: 'Bonjour Kael, oui votre audit de techgrowth.fr m’intéresse carrément !',
            subject: 'Re: Amélioration SaaS',
            magic_reply_draft: 'Bonjour Marie, \n\nMerci beaucoup pour votre intérêt ! Je suis ravi que notre audit vous intéresse. Que diriez-vous d\'un échange rapide jeudi à 15h00 pour en discuter de vive voix ? \nVoici mon lien direct : calendly.com/vectra/demo\n\nExcellente journée,\nL\'équipe Vectra',
            created_at: new Date(Date.now() - 10000).toISOString()
          }
        ]
      },
      {
        id: 'conv-price-88',
        sentiment: 'objection',
        last_message_text: 'Merci pour les informations. Cependant, quel est votre tarif de base ? Est-ce que c’est adapté aux petites structures ?',
        updated_at: new Date(Date.now() - 20000).toISOString(),
        lead: {
          name: 'Lucas Bernard',
          company: 'DEVSCALE',
          email: 'lucas.bernard@devscale.com',
          website: 'devscale.com',
          campaign: {
            name: 'Outbound Pricing'
          }
        },
        messages: [
          {
            id: 'msg-price-88',
            conversation_id: 'conv-price-88',
            nylas_message_id: 'msg-price-88',
            sender_type: 'prospect',
            body: 'Merci pour les informations. Cependant, quel est votre tarif de base ? Est-ce que c’est adapté aux petites structures ?',
            snippet: 'Merci pour les informations. Cependant, quel est votre tarif de base ?',
            subject: 'Re: Question de tarifs',
            magic_reply_draft: 'Bonjour Lucas,\n\nMerci pour votre retour ! C\'est une excellente question. Nos forfaits commencent à seulement 49€/mois pour la formule Solo Pro (qui inclut 5000 crédits de sourcing et pitchs illimités).\n\nSeriez-vous disponible ce jeudi à 11h pour un court appel de 5 minutes ?\n\nBien à vous,\nL\'équipe Vectra',
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

test.describe('Nylas Mailbox Sync & Webhook Engine Integration', () => {

  test('should display settings mailboxes UI and allow mock mailbox connection', async ({ page }) => {
    // 1. Navigate to Settings Mailboxes sub-route
    await page.goto('http://localhost:3000/app/settings/mailboxes');
    
    // Verify headers and placeholder text if no mailboxes
    await expect(page.locator('h1')).toContainText('Boîtes de Réception');
    
    // Test the custom IMAP credentials modal
    const connectImapButton = page.locator('button:has-text("Connecter IMAP / SMTP")');
    await expect(connectImapButton).toBeVisible();
    await connectImapButton.click();
    
    // Fill credentials form in modal
    await page.fill('#imapEmail', 'test-agent@agency.com');
    await page.fill('#imapPassword', 'secureAppKey123!');
    
    const submitImapButton = page.locator('button[type="submit"]:has-text("Connecter")');
    await expect(submitImapButton).toBeVisible();
    await submitImapButton.click();
    
    // Verify toast message and active mailbox card creation
    await expect(page.locator('text=Boîte mail IMAP/SMTP connectée avec succès')).toBeVisible();
    await expect(page.locator('text=test-agent@agency.com')).toBeVisible();
  });

  test('should process incoming Nylas webhooks, run sentiment AI classifier, and generate Magic Reply drafts', async ({ request, page }) => {
    // 1. Simulate an incoming Nylas Webhook GET handshake challenge call
    const challengeResponse = await request.get('http://localhost:3000/api/webhooks/nylas?challenge=verify_nylas_handshake_123');
    expect(challengeResponse.status()).toBe(200);
    const challengeText = await challengeResponse.text();
    expect(challengeText).toBe('verify_nylas_handshake_123');

    // 2. Simulate an incoming "interested" email delta webhook POST
    const interestedPayload = {
      messageId: 'msg-interested-99',
      threadId: 'thread-interested-99',
      senderEmail: 'marie.laurent@techgrowth.fr',
      senderName: 'Marie Laurent',
      subject: 'Re: Amélioration SaaS',
      bodyText: 'Bonjour Kael, oui votre audit de techgrowth.fr m’intéresse carrément ! Êtes-vous dispo ce jeudi après-midi pour en parler ?',
      grantId: 'mock-grant-active'
    };

    const webhookResponse = await request.post('http://localhost:3000/api/webhooks/nylas', {
      data: { deltas: [interestedPayload] }
    });
    expect(webhookResponse.status()).toBe(200);
    const webhookData = await webhookResponse.json();
    expect(webhookData.success).toBe(true);

    // 3. Open the Unified Inbox to check if the webhook was processed by AI
    await page.goto('http://localhost:3000/app/inbox');
    
    // Marie Laurent's conversation should be loaded and selected automatically
    await expect(page.locator('text=Marie Laurent').first()).toBeVisible();
    await expect(page.locator('text=dispo ce jeudi après-midi').first()).toBeVisible();

    // Verify sentiment classification badge is 'interested' (Intéressé)
    await expect(page.locator('text=Intéressé').first()).toBeVisible();

    // Verify the pre-generated Magic Reply floating banner displays the 1-click apply action!
    const applyBanner = page.locator('text=Brouillon Magic Reply pré-généré par l\'IA');
    await expect(applyBanner).toBeVisible();

    // Click Apply and verify it populates the textarea
    const applyButton = page.locator('button:has-text("Appliquer")');
    await applyButton.click();
    
    const textarea = page.locator('textarea[placeholder*="Répondre à"]');
    await expect(textarea).toHaveValue(/Bonjour Marie/);
  });

  test('should classify price inquiries as objection sentiment and suggest appropriate reply draft', async ({ request, page }) => {
    // 1. Simulate an incoming "objection" email payload (price objection)
    const pricePayload = {
      messageId: 'msg-price-88',
      threadId: 'thread-price-88',
      senderEmail: 'lucas.bernard@devscale.com',
      senderName: 'Lucas Bernard',
      subject: 'Re: Question de tarifs',
      bodyText: 'Merci pour les informations. Cependant, quel est votre tarif de base ? Est-ce que c’est adapté aux petites structures ?',
      grantId: 'mock-grant-active'
    };

    const response = await request.post('http://localhost:3000/api/webhooks/nylas', {
      data: { deltas: [pricePayload] }
    });
    expect(response.status()).toBe(200);

    // 2. Open Inbox and verify objection sentiment state
    await page.goto('http://localhost:3000/app/inbox');
    await page.click('text=Lucas Bernard');

    await expect(page.locator('text=objection').first()).toBeVisible();

    // Check pre-generated draft contains pricing/budget handling message
    const applyButton = page.locator('button:has-text("Appliquer")');
    await applyButton.click();

    const textarea = page.locator('textarea[placeholder*="Répondre à"]');
    await expect(textarea).toHaveValue(/Solo Pro/); // Should mention Solo Pro plans!
  });

});
