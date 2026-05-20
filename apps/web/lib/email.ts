import { Resend } from 'resend';

// Use env RESEND_API_KEY if present, otherwise fallback to a mock/console printer in development
const resendApiKey = process.env.RESEND_API_KEY || 're_mock_key';
const resend = new Resend(resendApiKey);

export async function sendWelcomeEmail(to: string, name: string) {
  if (resendApiKey === 're_mock_key' || process.env.NODE_ENV === 'test') {
    console.log(`[EMAIL MOCK] Sending welcome email to ${to} for user ${name}`);
    return { id: 'mock-email-id', success: true };
  }

  try {
    const data = await resend.emails.send({
      from: 'Vectra <onboarding@vectra.ai>',
      to,
      subject: 'Bienvenue sur Vectra ! 🚀',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e4e4e7; border-radius: 8px;">
          <h2 style="color: #0f172a; margin-top: 0;">Bienvenue sur Vectra, ${name} ! 🚀</h2>
          <p style="color: #334155; line-height: 1.5;">Votre espace de travail de prospection IA est prêt.</p>
          <p style="color: #334155; line-height: 1.5;">Vous disposez de 1 500 crédits pour lancer vos premières recherches conversationnelles et personnaliser vos campagnes cold email ou LinkedIn.</p>
          <div style="margin: 24px 0;">
            <a href="https://vectra.ai/app" style="background-color: #0f172a; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Accéder au Dashboard</a>
          </div>
          <hr style="border: 0; border-top: 1px solid #e4e4e7; margin: 24px 0;" />
          <p style="color: #64748b; font-size: 12px; margin-bottom: 0;">Si vous avez des questions, n'hésitez pas à répondre directement à cet email.</p>
        </div>
      `,
    });
    return data;
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    throw error;
  }
}

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  if (resendApiKey === 're_mock_key' || process.env.NODE_ENV === 'test') {
    console.log(`[EMAIL MOCK] Sending password reset email to ${to} with URL ${resetUrl}`);
    return { id: 'mock-email-id', success: true };
  }

  try {
    const data = await resend.emails.send({
      from: 'Vectra <auth@vectra.ai>',
      to,
      subject: 'Réinitialisation de votre mot de passe - Vectra',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e4e4e7; border-radius: 8px;">
          <h2 style="color: #0f172a; margin-top: 0;">Réinitialiser votre mot de passe</h2>
          <p style="color: #334155; line-height: 1.5;">Vous avez demandé la réinitialisation de votre mot de passe Vectra.</p>
          <div style="margin: 24px 0;">
            <a href="${resetUrl}" style="background-color: #0f172a; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Réinitialiser mon mot de passe</a>
          </div>
          <p style="color: #64748b; font-size: 12px;">Ce lien expirera dans 24 heures. Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email en toute sécurité.</p>
        </div>
      `,
    });
    return data;
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    throw error;
  }
}
