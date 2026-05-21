import React from 'react';

export const metadata = {
  title: 'Conditions d\'Utilisation — Vectra OS',
  description: 'Conditions générales d\'utilisation de la plateforme Vectra OS.'
};

export default function TermsPage() {
  const lastUpdated = '21 mai 2026';

  return (
    <div className="prose prose-zinc max-w-none">
      <h1 className="text-3xl font-extrabold text-zinc-900 mb-2">Conditions Générales d'Utilisation</h1>
      <p className="text-sm text-zinc-400 mb-10">Dernière mise à jour : {lastUpdated}</p>

      <section className="mb-8">
        <h2 className="text-xl font-bold text-zinc-900 mb-3">1. Acceptation des conditions</h2>
        <p className="text-zinc-600 leading-relaxed">
          En accédant à Vectra OS (ci-après "le Service"), vous acceptez d'être lié par les présentes Conditions Générales d'Utilisation. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser le Service. Vectra OS Inc. se réserve le droit de modifier ces conditions à tout moment avec notification préalable de 30 jours.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold text-zinc-900 mb-3">2. Description du Service</h2>
        <p className="text-zinc-600 leading-relaxed">
          Vectra OS est une plateforme SaaS d'intelligence artificielle pour la prospection B2B. Le Service comprend le sourcing automatisé de prospects, la génération de messages personnalisés, la gestion de campagnes de prospection, un inbox unifié, et des outils d'analyse de performance.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold text-zinc-900 mb-3">3. Inscription et compte</h2>
        <p className="text-zinc-600 leading-relaxed mb-3">
          Pour utiliser le Service, vous devez créer un compte avec une adresse email valide. Vous êtes responsable de maintenir la confidentialité de vos identifiants et de toutes les activités qui se produisent sous votre compte.
        </p>
        <p className="text-zinc-600 leading-relaxed">
          Vous devez avoir au moins 18 ans pour utiliser ce Service. En créant un compte, vous garantissez que les informations fournies sont exactes et complètes.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold text-zinc-900 mb-3">4. Plans d'abonnement et facturation</h2>
        <p className="text-zinc-600 leading-relaxed mb-3">
          Vectra OS propose les plans suivants :
        </p>
        <ul className="list-disc list-inside text-zinc-600 space-y-2 mb-3">
          <li><strong>Gratuit :</strong> 2 000 crédits de sourcing, 1 campagne active.</li>
          <li><strong>Starter :</strong> 199 USD/mois, 5 000 crédits/mois, campagnes illimitées.</li>
          <li><strong>Scale :</strong> 499 USD/mois, 20 000 crédits/mois, multi-membres.</li>
        </ul>
        <p className="text-zinc-600 leading-relaxed">
          Les paiements sont traités via Stripe et sont non remboursables sauf obligation légale. Les abonnements se renouvellent automatiquement. Vous pouvez annuler à tout moment depuis les paramètres de votre compte.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold text-zinc-900 mb-3">5. Utilisation acceptable</h2>
        <p className="text-zinc-600 leading-relaxed mb-3">Il est interdit d'utiliser Vectra OS pour :</p>
        <ul className="list-disc list-inside text-zinc-600 space-y-2">
          <li>Envoyer des communications non sollicitées en violation des lois anti-spam (CASL, CAN-SPAM, RGPD)</li>
          <li>Collecter des données sans consentement approprié</li>
          <li>Harceler, menacer ou discriminer des individus</li>
          <li>Contourner les mesures de sécurité du Service</li>
          <li>Toute activité illégale ou contraire à l'éthique commerciale</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold text-zinc-900 mb-3">6. Propriété intellectuelle</h2>
        <p className="text-zinc-600 leading-relaxed">
          Le Service, son code source, ses interfaces et ses contenus sont la propriété exclusive de Vectra OS Inc. et protégés par les lois sur la propriété intellectuelle. Les utilisateurs conservent la propriété de leurs données et contenus importés dans le Service.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold text-zinc-900 mb-3">7. Limitation de responsabilité</h2>
        <p className="text-zinc-600 leading-relaxed">
          Vectra OS est fourni "tel quel". Nous ne garantissons pas que le Service sera ininterrompu ou exempt d'erreurs. Notre responsabilité totale envers vous ne dépassera pas le montant payé par vous au cours des 3 derniers mois précédant l'incident.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold text-zinc-900 mb-3">8. Résiliation</h2>
        <p className="text-zinc-600 leading-relaxed">
          Vous pouvez résilier votre compte à tout moment. Vectra OS se réserve le droit de suspendre ou résilier votre accès en cas de violation de ces conditions. En cas de résiliation, vos données seront conservées 30 jours avant suppression définitive, sauf demande d'exportation préalable.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold text-zinc-900 mb-3">9. Droit applicable</h2>
        <p className="text-zinc-600 leading-relaxed">
          Ces conditions sont régies par les lois de la province de Québec, Canada. Tout litige sera soumis à la juridiction exclusive des tribunaux de Montréal, Québec.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold text-zinc-900 mb-3">10. Contact</h2>
        <p className="text-zinc-600 leading-relaxed">
          Pour toute question concernant ces conditions, contactez-nous à : <strong>legal@vectra.ai</strong>
        </p>
      </section>
    </div>
  );
}
