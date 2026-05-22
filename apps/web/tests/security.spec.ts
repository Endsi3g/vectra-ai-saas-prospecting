import { test, expect } from '@playwright/test';

test.describe('Security & Rate Limiting Verification', () => {
  test.beforeEach(async ({ context }) => {
    // Authenticate the request using the bypass header and cookie
    await context.setExtraHTTPHeaders({
      'x-test-bypass': 'true'
    });
    await context.addCookies([{
      name: 'sb-mock-session',
      value: 'true',
      domain: 'localhost',
      path: '/'
    }]);
  });

  test('1. Domain Scraping Whitelist - Whitelisted Domain', async ({ request }) => {
    const response = await request.post('/api/sourcing/scrape', {
      data: {
        url: 'https://github.com/trending',
        query: 'test query'
      }
    });
    
    // Should NOT be 400 Bad Request due to whitelist block (might be 200 or another status)
    expect(response.status()).not.toBe(400);
  });

  test('2. Domain Scraping Whitelist - Non-Whitelisted Domain', async ({ request }) => {
    const response = await request.post('/api/sourcing/scrape', {
      data: {
        url: 'https://malicious-domain.com/data',
        query: 'test query'
      }
    });
    
    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toContain('Scraping non autorisé pour ce domaine');
  });

  test('3. Email Format Verification - Valid Email', async ({ request }) => {
    const response = await request.post('/api/email/send', {
      data: {
        to: 'user@example.com',
        subject: 'Hello',
        body: 'World',
        mailbox_id: 'mailbox-123'
      }
    });

    // Should NOT be 400 Bad Request due to format (might fail auth/mailbox setup with another code, but format is valid)
    expect(response.status()).not.toBe(400);
  });

  test('4. Email Format Verification - Invalid Email', async ({ request }) => {
    const response = await request.post('/api/email/send', {
      data: {
        to: 'invalid-email-format',
        subject: 'Hello',
        body: 'World',
        mailbox_id: 'mailbox-123'
      }
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toContain("Format d'email invalide");
  });

  test('5. Brevo Contacts Upload - Content-Length and Payload limits', async ({ request }) => {
    // Send a payload larger than 5MB to trigger 413 Payload Too Large
    const largeLeads = Array.from({ length: 60000 }, (_, i) => ({
      email: `test${i}@example.com`,
      name: `User ${i}`,
      company: 'Test Company',
      phone: '1234567890'
    }));

    const response = await request.post('/api/brevo/contacts', {
      data: {
        leads: largeLeads,
        listId: '123'
      }
    });

    expect(response.status()).toBe(413);
    const body = await response.json();
    expect(body.error).toContain('Payload size exceeds 5MB limit.');
  });
});
