import React from 'react';

export const metadata = {
  title: 'Politique de Confidentialité — Vectra OS',
  description: 'Politique de confidentialité et protection des données personnelles de Vectra OS.'
};

export default function PrivacyPage() {
  const lastUpdated = '21 mai 2026';

  return (
    <div className="prose prose-zinc max-w-none">
      <h1 className="text-3xl font-extrabold text-zinc-900 mb-2">Politique de Confidentialité</h1>
      <p className="text-sm text-zinc-400 mb-10">Dernière mise à jour : {lastUpdated}</p>

      <section className="mb-8">
        <h2 className="text-xl font-bold text-zinc-900 mb-3">1. Responsable du traitement</h2>
        <p className="text-zinc-600 leading-relaxed">
          Vectra OS Inc. est responsable du traitement des données personnelles collectées via la plateforme Vectra OS. Pour toute question relative à la protection des données, contactez-nous à : <strong>privacy@vectra.ai</strong>
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold text-zinc-900 mb-3">2. Données collectées</h2>
        <p className="text-zinc-600 leading-relaxed mb-3">Nous collectons les informations suivantes :</p>
        <ul className="list-disc list-inside text-zinc-600 space-y-2">
          <li><strong>Informations de compte :</strong> nom, adresse email, type d'entreprise</li>
          <li><strong>Données de facturation :</strong> informations de paiement traitées par Stripe (nous ne stockons pas les données de carte)</li>
          <li><strong>Données d'utilisation :</strong> actions effectuées sur la plateforme, pages visitées, fonctionnalités utilisées</li>
          <li><strong>Données de prospection :</strong> listes de prospects, messages générés, campagnes créées</li>
          <li><strong>Données d'email :</strong> si vous connectez votre boîte mail via Nylas, accès aux threads email liés à vos prospects</li>
          <li><strong>Données techniques :</strong> adresse IP, type de navigateur, erreurs techniques via Sentry</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold text-zinc-900 mb-3">3. Finalités du traitement</h2>
        <p className="text-zinc-600 leading-relaxed mb-3">Vos données sont utilisées pour :</p>
        <ul className="list-disc list-inside text-zinc-600 space-y-2">
          <li>Fournir et améliorer le Service</li>
          <li>Gérer votre abonnement et votre facturation</li>
          <li>Vous envoyer des communications transactionnelles (confirmations, alertes)</li>
          <li>Analyser les performances du produit pour l'amélioration continue</li>
          <li>Assurer la sécurité et prévenir les abus</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold text-zinc-900 mb-3">4. Sous-traitants et partenaires</h2>
        <p className="text-zinc-600 leading-relaxed mb-3">Nous faisons appel aux prestataires suivants :</p>
        <ul className="list-disc list-inside text-zinc-600 space-y-2">
          <li><strong>Supabase</strong> — Stockage de données (PostgreSQL hébergé sur AWS)</li>
          <li><strong>Stripe</strong> — Traitement des paiements</li>
          <li><strong>Nylas</strong> — Intégration OAuth pour Gmail/Outlook</li>
          <li><strong>PostHog</strong> — Analytique produit anonymisée</li>
          <li><strong>Sentry</strong> — Suivi des erreurs techniques</li>
          <li><strong>Resend</strong> — Envoi d'emails transactionnels</li>
          <li><strong>OpenRouter / OpenAI</strong> — Génération de contenu par IA</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold text-zinc-900 mb-3">5. Conservation des données</h2>
        <p className="text-zinc-600 leading-relaxed">
          Vos données sont conservées tant que votre compte est actif. En cas de résiliation, vos données personnelles sont supprimées sous 30 jours. Les données de facturation sont conservées 7 ans conformément aux obligations comptables.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold text-zinc-900 mb-3">6. Vos droits (RGPD)</h2>
        <p className="text-zinc-600 leading-relaxed mb-3">Conformément au RGPD et aux lois applicables, vous disposez des droits suivants :</p>
        <ul className="list-disc list-inside text-zinc-600 space-y-2">
          <li><strong>Droit d'accès :</strong> obtenir une copie de vos données personnelles</li>
          <li><strong>Droit de rectification :</strong> corriger vos données inexactes</li>
          <li><strong>Droit à l'effacement :</strong> demander la suppression de vos données</li>
          <li><strong>Droit à la portabilité :</strong> recevoir vos données dans un format structuré</li>
          <li><strong>Droit d'opposition :</strong> vous opposer au traitement dans certains cas</li>
        </ul>
        <p className="text-zinc-600 leading-relaxed mt-3">
          Pour exercer ces droits, contactez : <strong>privacy@vectra.ai</strong>. Nous répondrons dans un délai de 30 jours.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold text-zinc-900 mb-3">7. Cookies</h2>
        <p className="text-zinc-600 leading-relaxed">
          Nous utilisons des cookies essentiels pour le fonctionnement du Service (authentification, préférences) et des cookies analytiques anonymisés via PostHog. Vous pouvez désactiver les cookies analytiques dans les paramètres de votre navigateur sans impact sur le fonctionnement du Service.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold text-zinc-900 mb-3">8. Sécurité</h2>
        <p className="text-zinc-600 leading-relaxed">
          Nous appliquons des mesures de sécurité techniques et organisationnelles appropriées : chiffrement TLS en transit, Row-Level Security (RLS) sur la base de données, authentification sécurisée via Supabase Auth. En cas de violation de données, vous serez notifié dans les 72 heures conformément au RGPD.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold text-zinc-900 mb-3">9. Transferts internationaux</h2>
        <p className="text-zinc-600 leading-relaxed">
          Vos données peuvent être transférées et traitées aux États-Unis et au Canada par nos sous-traitants. Ces transferts sont encadrés par des clauses contractuelles types conformes au RGPD.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold text-zinc-900 mb-3">10. Contact</h2>
        <p className="text-zinc-600 leading-relaxed">
          Pour toute question relative à cette politique : <strong>privacy@vectra.ai</strong><br />
          Vectra OS Inc. — Montréal, Québec, Canada
        </p>
      </section>
    </div>
  );
}
