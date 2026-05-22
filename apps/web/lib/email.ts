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

export async function sendJ1NurtureEmail(to: string, name: string) {
  if (resendApiKey === 're_mock_key' || process.env.NODE_ENV === 'test') {
    console.log(`[EMAIL MOCK] Sending J1 nurture email to ${to} for user ${name}`);
    return { id: 'mock-email-id', success: true };
  }

  try {
    const data = await resend.emails.send({
      from: 'Vectra <onboarding@vectra.ai>',
      to,
      subject: 'Configurez votre première campagne sur Vectra ! ⚙️',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e4e4e7; border-radius: 8px;">
          <h2 style="color: #0f172a; margin-top: 0;">Bonjour ${name}, prêt à lancer votre première campagne ? ⚙️</h2>
          <p style="color: #334155; line-height: 1.5;">Hier, vous avez rejoint Vectra. Pour obtenir vos premiers résultats, la première étape est de configurer une campagne.</p>
          <p style="color: #334155; line-height: 1.5;">Notre IA a besoin de connaître votre offre, votre cible (ICP) et votre angle d'approche pour rédiger des messages ultra-personnalisés.</p>
          <div style="margin: 24px 0;">
            <a href="https://vectra.ai/app/campaigns" style="background-color: #0f172a; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Créer ma campagne</a>
          </div>
          <hr style="border: 0; border-top: 1px solid #e4e4e7; margin: 24px 0;" />
          <p style="color: #64748b; font-size: 12px; margin-bottom: 0;">Besoin d'aide pour rédiger votre ICP ? Notre assistant IA est là pour vous guider directement dans l'application.</p>
        </div>
      `,
    });
    return data;
  } catch (error) {
    console.error('Failed to send J1 email:', error);
    throw error;
  }
}

export async function sendJ3NurtureEmail(to: string, name: string) {
  if (resendApiKey === 're_mock_key' || process.env.NODE_ENV === 'test') {
    console.log(`[EMAIL MOCK] Sending J3 nurture email to ${to} for user ${name}`);
    return { id: 'mock-email-id', success: true };
  }

  try {
    const data = await resend.emails.send({
      from: 'Vectra <onboarding@vectra.ai>',
      to,
      subject: 'Trouvez vos premiers prospects avec l\'IA 🔍',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e4e4e7; border-radius: 8px;">
          <h2 style="color: #0f172a; margin-top: 0;">Trouvez des leads qualifiés en quelques secondes, ${name} 🔍</h2>
          <p style="color: #334155; line-height: 1.5;">Vectra intègre un agent de sourcing autonome. Vous pouvez lui décrire votre cible en langage naturel, et il cherchera sur le web pour extraire les profils correspondants.</p>
          <p style="color: #334155; line-height: 1.5;">Connectez-vous à la section Sourcing de votre espace pour commencer à importer des prospects directement dans vos listes.</p>
          <div style="margin: 24px 0;">
            <a href="https://vectra.ai/app/sourcing" style="background-color: #0f172a; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Lancer le Sourcing IA</a>
          </div>
          <hr style="border: 0; border-top: 1px solid #e4e4e7; margin: 24px 0;" />
          <p style="color: #64748b; font-size: 12px; margin-bottom: 0;">Vous pouvez également importer un fichier CSV existant si vous avez déjà vos listes de prospects.</p>
        </div>
      `,
    });
    return data;
  } catch (error) {
    console.error('Failed to send J3 email:', error);
    throw error;
  }
}

export async function sendJ7NurtureEmail(to: string, name: string) {
  if (resendApiKey === 're_mock_key' || process.env.NODE_ENV === 'test') {
    console.log(`[EMAIL MOCK] Sending J7 nurture email to ${to} for user ${name}`);
    return { id: 'mock-email-id', success: true };
  }

  try {
    const data = await resend.emails.send({
      from: 'Vectra <onboarding@vectra.ai>',
      to,
      subject: 'Analysez vos statistiques et préparez la suite 📊',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e4e4e7; border-radius: 8px;">
          <h2 style="color: #0f172a; margin-top: 0;">Déjà une semaine sur Vectra, ${name} ! 📊</h2>
          <p style="color: #334155; line-height: 1.5;">Il est temps de faire le bilan. Suivez vos taux d'ouverture, de réponse et l'engagement de vos campagnes en temps réel sur votre tableau de bord.</p>
          <p style="color: #334155; line-height: 1.5;">Votre période d'essai de 14 jours arrive bientôt à sa moitié. N'hésitez pas à connecter votre boîte mail Brevo ou Gmail pour commencer à envoyer réellement vos messages.</p>
          <div style="margin: 24px 0;">
            <a href="https://vectra.ai/app/analytics" style="background-color: #0f172a; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Voir mes statistiques</a>
          </div>
          <hr style="border: 0; border-top: 1px solid #e4e4e7; margin: 24px 0;" />
          <p style="color: #64748b; font-size: 12px; margin-bottom: 0;">Une question ? Notre équipe support est à votre disposition en répondant à cet email.</p>
        </div>
      `,
    });
    return data;
  } catch (error) {
    console.error('Failed to send J7 email:', error);
    throw error;
  }
}

