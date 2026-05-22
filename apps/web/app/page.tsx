'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

// ── FadeIn wrapper ────────────────────────────────────────────────────────────

function FadeIn({
  delay = 0,
  duration = 1000,
  children,
  className = '',
}: {
  delay?: number;
  duration?: number;
  children: React.ReactNode;
  className?: string;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <div
      className={`transition-opacity ${className}`}
      style={{ opacity: visible ? 1 : 0, transitionDuration: `${duration}ms` }}
    >
      {children}
    </div>
  );
}

// ── AnimatedHeading ───────────────────────────────────────────────────────────

function AnimatedHeading({
  lines,
  className = '',
  initialDelay = 200,
  charDelay = 28,
}: {
  lines: string[];
  className?: string;
  initialDelay?: number;
  charDelay?: number;
}) {
  const [visibleCount, setVisibleCount] = useState(0);

  const allChars: { char: string; isBreak: boolean }[] = [];
  lines.forEach((line, li) => {
    line.split('').forEach((ch) => allChars.push({ char: ch, isBreak: false }));
    if (li < lines.length - 1) allChars.push({ char: '', isBreak: true });
  });

  useEffect(() => {
    let frame: ReturnType<typeof setTimeout>;
    const start = setTimeout(() => {
      let count = 0;
      const tick = () => {
        if (count > allChars.length) return;
        setVisibleCount(count++);
        frame = setTimeout(tick, charDelay);
      };
      tick();
    }, initialDelay);
    return () => { clearTimeout(start); clearTimeout(frame); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <h1 className={className} style={{ letterSpacing: '-0.04em' }}>
      {allChars.map((item, i) => {
        if (item.isBreak) return <br key={i} />;
        const shown = i < visibleCount;
        return (
          <span
            key={i}
            className="inline-block transition-all duration-500"
            style={{ opacity: shown ? 1 : 0, transform: shown ? 'translateX(0)' : 'translateX(-18px)' }}
          >
            {item.char === ' ' ? ' ' : item.char}
          </span>
        );
      })}
    </h1>
  );
}

// ── Landing Page ──────────────────────────────────────────────────────────────

const VIDEO_URL =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260403_050628_c4e32401-fab4-4a27-b7a8-6e9291cd5959.mp4';

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* ── Full-screen video — no overlay ─────────────────────────────────── */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        src={VIDEO_URL}
      />

      {/* ── Page (above video) ────────────────────────────────────────────── */}
      <div className="relative z-10 flex flex-col min-h-screen px-6 md:px-12 lg:px-16">

        {/* Navbar */}
        <header className="pt-6">
          <nav className="liquid-glass rounded-xl px-4 py-2 flex items-center justify-between">
            <span className="text-2xl font-semibold tracking-tight select-none">VECTRA</span>

            <div className="hidden md:flex items-center gap-8 text-sm text-white/80">
              {['Fonctionnalités', 'Agents', 'Tarifs', 'Training'].map((label) => (
                <a key={label} href={`#${label.toLowerCase()}`} className="hover:text-gray-300 transition-colors">
                  {label}
                </a>
              ))}
            </div>

            <Link href="/auth/sign-up" className="bg-white text-black px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors">
              Commencer
            </Link>
          </nav>
        </header>

        {/* Hero content — pushed to bottom */}
        <div className="flex-1 flex flex-col justify-end pb-12 lg:pb-16">
          <div className="lg:grid lg:grid-cols-2 lg:items-end gap-8">

            {/* Left */}
            <div>
              <AnimatedHeading
                lines={["Trouve tes meilleurs leads.", "Automatiquement, grâce à l'IA."]}
                className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-normal mb-4 text-white"
              />

              <FadeIn delay={900} duration={1000} className="mb-5">
                <p className="text-base md:text-lg text-gray-300 max-w-xl">
                  Vectra automatise ta prospection de A à Z — sourcing qualifié, messages ultra-personnalisés, suivi de réponses et training cold call.
                </p>
              </FadeIn>

              <FadeIn delay={1300} duration={1000}>
                <div className="flex flex-wrap gap-4">
                  <Link href="/auth/sign-up" className="bg-white text-black px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors">
                    Commencer gratuitement
                  </Link>
                  <a
                    href="#fonctionnalités"
                    className="liquid-glass border border-white/20 text-white px-8 py-3 rounded-lg font-medium hover:bg-white hover:text-black transition-all duration-200"
                  >
                    Voir les fonctionnalités
                  </a>
                </div>
              </FadeIn>
            </div>

            {/* Right — tag */}
            <FadeIn delay={1500} duration={1000} className="flex items-end justify-start lg:justify-end mt-8 lg:mt-0">
              <div className="liquid-glass border border-white/20 px-6 py-3 rounded-xl">
                <p className="text-lg md:text-xl lg:text-2xl font-light">
                  Sourcing.&nbsp; Outreach.&nbsp; Training.
                </p>
              </div>
            </FadeIn>

          </div>
        </div>
      </div>

      {/* ── Below-fold ──────────────────────────────────────────────────────── */}
      <div className="relative z-10 bg-black">

        <section id="fonctionnalités" className="px-6 md:px-12 lg:px-16 py-24">
          <FeaturesSection />
        </section>

        <section className="px-6 md:px-12 lg:px-16 py-16 border-t border-white/10">
          <HowItWorksSection />
        </section>

        <section id="tarifs" className="px-6 md:px-12 lg:px-16 py-24 border-t border-white/10">
          <PricingSection />
        </section>

        <section className="px-6 md:px-12 lg:px-16 py-16 border-t border-white/10">
          <TestimonialsSection />
        </section>

        <section className="px-6 md:px-12 lg:px-16 py-16 border-t border-white/10">
          <FaqSection />
        </section>

        <section className="px-6 md:px-12 lg:px-16 py-16 border-t border-white/10">
          <CtaBanner />
        </section>

        <footer className="border-t border-white/10 px-6 md:px-12 lg:px-16 py-10">
          <SiteFooter />
        </footer>
      </div>
    </div>
  );
}

// ── Features ──────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: '🎯',
    title: 'Sourcing IA autonome',
    desc: "L'agent Hermes trouve des leads qualifiés 24h/24 selon ton ICP, sans intervention manuelle.",
  },
  {
    icon: '✉️',
    title: 'Messages ultra-personnalisés',
    desc: 'Apollo génère des emails et messages LinkedIn adaptés à chaque lead, avec score de personnalisation.',
  },
  {
    icon: '📥',
    title: 'Inbox intelligente',
    desc: 'Détection de sentiment, Magic Replies contextuelles et suivi de pipeline intégré.',
  },
  {
    icon: '📞',
    title: 'Training Cold Call',
    desc: "Entraîne-toi face à des personas IA avec objections réalistes. Score et feedback à chaque session.",
  },
  {
    icon: '📊',
    title: 'Analytics temps réel',
    desc: 'KPIs, funnel de conversion, taux d\'ouverture Brevo et historique d\'activité agent.',
  },
  {
    icon: '🔌',
    title: 'Intégrations natives',
    desc: 'Nylas (email), Brevo (campagnes), Stripe (billing), Notion, Google Sheets, Airtable.',
  },
];

function FeaturesSection() {
  return (
    <div>
      <p className="text-sm uppercase tracking-widest text-gray-500 mb-3">Fonctionnalités</p>
      <h2 className="text-3xl md:text-4xl font-normal mb-12" style={{ letterSpacing: '-0.03em' }}>
        Tout ce dont tu as besoin,<br className="hidden md:block" /> sans la complexité.
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {FEATURES.map((f) => (
          <div key={f.title} className="liquid-glass border border-white/10 rounded-2xl p-6">
            <span className="text-2xl mb-4 block">{f.icon}</span>
            <h3 className="text-base font-medium mb-2 text-white">{f.title}</h3>
            <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── How it works ──────────────────────────────────────────────────────────────

function HowItWorksSection() {
  const steps = [
    { num: '01', title: 'Configure ta campagne', desc: "Décris ton offre, ton ICP et ton angle. Vectra s'adapte à ton contexte en quelques minutes." },
    { num: '02', title: 'Hermes trouve les leads', desc: "L'agent sourcing des profils qualifiés, enrichis et scorés selon ta cible, 24h/24." },
    { num: '03', title: 'Apollo personnalise et envoie', desc: "Messages générés par IA, validés par toi, envoyés via tes boîtes mail connectées." },
  ];
  return (
    <div>
      <p className="text-sm uppercase tracking-widest text-gray-500 mb-3">Comment ça marche</p>
      <h2 className="text-3xl md:text-4xl font-normal mb-12" style={{ letterSpacing: '-0.03em' }}>3 étapes. Zéro friction.</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {steps.map((s) => (
          <div key={s.num} className="flex flex-col gap-3">
            <span className="text-4xl font-light text-white/20">{s.num}</span>
            <h3 className="text-xl font-medium text-white">{s.title}</h3>
            <p className="text-sm text-gray-400 leading-relaxed">{s.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Pricing ───────────────────────────────────────────────────────────────────

const PLANS = [
  {
    name: 'Free', price: '0€', period: '/mois', credits: '2 000 crédits/mois',
    features: ['1 campagne', '50 leads/mois', 'Sourcing IA', 'Génération de messages', 'Dashboard'],
    cta: 'Commencer gratuitement', href: '/auth/sign-up?plan=free', highlighted: false,
  },
  {
    name: 'Solo', price: '29€', period: '/mois', credits: '10 000 crédits/mois',
    features: ['Campagnes illimitées', '500 leads/mois', 'Boîtes mail connectées', 'Outreach automatisé', 'Training Cold Call', 'Analytics avancés'],
    cta: 'Démarrer en Solo', href: '/auth/sign-up?plan=solo', highlighted: true,
  },
  {
    name: 'Agence', price: '79€', period: '/mois', credits: '50 000 crédits/mois',
    features: ['Tout Solo inclus', 'Multi-membres (5 seats)', 'Agents 24/7 autonomes', 'API & MCP accès', 'Intégrations Notion / Sheets', 'Support prioritaire'],
    cta: 'Passer en Agence', href: '/auth/sign-up?plan=agence', highlighted: false,
  },
];

function PricingSection() {
  return (
    <div>
      <p className="text-sm uppercase tracking-widest text-gray-500 mb-3">Tarifs</p>
      <h2 className="text-3xl md:text-4xl font-normal mb-12" style={{ letterSpacing: '-0.03em' }}>Simple. Transparent. Évolutif.</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PLANS.map((p) => (
          <div key={p.name} className={`rounded-2xl p-6 flex flex-col gap-4 ${p.highlighted ? 'bg-white text-black' : 'liquid-glass border border-white/10'}`}>
            <div>
              <p className={`text-sm font-medium mb-1 ${p.highlighted ? 'text-gray-500' : 'text-gray-400'}`}>{p.name}</p>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-semibold" style={{ letterSpacing: '-0.04em' }}>{p.price}</span>
                <span className={`text-sm ${p.highlighted ? 'text-gray-500' : 'text-gray-400'}`}>{p.period}</span>
              </div>
              <p className="text-xs mt-1 text-gray-500">{p.credits}</p>
            </div>
            <ul className="flex flex-col gap-2 flex-1">
              {p.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <span className={`mt-0.5 ${p.highlighted ? 'text-black' : 'text-gray-400'}`}>✓</span>
                  <span className={p.highlighted ? 'text-gray-700' : 'text-gray-300'}>{f}</span>
                </li>
              ))}
            </ul>
            <Link href={p.href} className={`mt-2 block text-center py-3 rounded-xl text-sm font-medium transition-colors duration-200 ${p.highlighted ? 'bg-black text-white hover:bg-gray-900' : 'border border-white/20 text-white hover:bg-white hover:text-black'}`}>
              {p.cta}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Testimonials ──────────────────────────────────────────────────────────────

function TestimonialsSection() {
  const testimonials = [
    { initials: 'ML', color: '#3b82f6', name: 'Marie Leroy', role: 'CEO · TechSeed', quote: 'En 2 semaines, Vectra a généré 3× plus de leads qualifiés que notre processus manuel. L\'agent Hermes tourne pendant qu\'on dort.' },
    { initials: 'AC', color: '#8b5cf6', name: 'Antoine Chevalier', role: 'Head of Sales · Growvia', quote: 'Les messages générés par Apollo ont un taux d\'ouverture de 68%. On a divisé notre temps de prospection par 4.' },
    { initials: 'SF', color: '#10b981', name: 'Sophie Fontaine', role: 'Founder · AgencyLab', quote: 'Le training cold call est bluffant. Mes commerciaux juniors progressent 2× plus vite qu\'avec les méthodes classiques.' },
  ];
  return (
    <div>
      <p className="text-sm uppercase tracking-widest text-gray-500 mb-3">Témoignages</p>
      <h2 className="text-3xl md:text-4xl font-normal mb-12" style={{ letterSpacing: '-0.03em' }}>Ce qu&apos;en pensent nos utilisateurs.</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {testimonials.map((t) => (
          <div key={t.name} className="liquid-glass border border-white/10 rounded-2xl p-6 flex flex-col gap-4">
            <p className="text-gray-300 text-sm leading-relaxed flex-1">&ldquo;{t.quote}&rdquo;</p>
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ backgroundColor: t.color }}>
                {t.initials}
              </div>
              <div>
                <p className="text-sm font-medium text-white">{t.name}</p>
                <p className="text-xs text-gray-500">{t.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── FAQ ────────────────────────────────────────────────────────────────────────

function FaqSection() {
  const [open, setOpen] = useState<number | null>(null);
  const faqs = [
    { q: 'Vectra est-il adapté aux solopreneurs ?', a: 'Oui. Le plan Free te permet de tester toutes les fonctionnalités principales sans engagement. Le plan Solo est conçu pour les indépendants et freelances.' },
    { q: "Qu'est-ce qu'un crédit ?", a: "Un crédit est consommé à chaque action IA : sourcing (~5), génération message (~10), session training (~20). Ils se renouvellent chaque mois." },
    { q: 'Est-ce que Vectra respecte le RGPD ?', a: 'Oui. Données stockées en Europe (Supabase EU). Les emails partent depuis tes propres boîtes. Aucune donnée revendue à des tiers.' },
    { q: 'Quelles boîtes mail sont supportées ?', a: 'Gmail, Outlook, et tout serveur IMAP via Nylas. Connexion en 2 clics depuis Settings.' },
    { q: 'Puis-je annuler à tout moment ?', a: 'Oui, sans engagement. Downgrade ou annulation depuis Settings > Plans & Crédits.' },
    { q: "L'app desktop Electron est-elle incluse ?", a: "Oui, gratuitement pour tous les plans. Elle inclut tray, raccourcis globaux, capture LinkedIn et import PDF." },
  ];
  return (
    <div>
      <p className="text-sm uppercase tracking-widest text-gray-500 mb-3">FAQ</p>
      <h2 className="text-3xl md:text-4xl font-normal mb-12" style={{ letterSpacing: '-0.03em' }}>Questions fréquentes.</h2>
      <div className="max-w-3xl flex flex-col gap-3">
        {faqs.map((faq, i) => (
          <div key={i} className="liquid-glass border border-white/10 rounded-2xl overflow-hidden">
            <button className="w-full text-left px-6 py-4 flex items-center justify-between gap-4" onClick={() => setOpen(open === i ? null : i)}>
              <span className="text-sm md:text-base font-medium text-white">{faq.q}</span>
              <span className="text-gray-400 shrink-0 text-lg leading-none">{open === i ? '−' : '+'}</span>
            </button>
            {open === i && (
              <div className="px-6 pb-5">
                <p className="text-sm text-gray-400 leading-relaxed">{faq.a}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── CTA Banner ────────────────────────────────────────────────────────────────

function CtaBanner() {
  return (
    <div className="liquid-glass border border-white/10 rounded-3xl px-8 py-14 text-center">
      <h2 className="text-3xl md:text-5xl font-normal mb-4 text-white" style={{ letterSpacing: '-0.04em' }}>
        Prêt à prospecter intelligemment ?
      </h2>
      <p className="text-gray-400 mb-8 text-base md:text-lg max-w-xl mx-auto">
        Lance ton premier sourcing IA en moins de 5 minutes. Aucune carte bancaire requise.
      </p>
      <Link href="/auth/sign-up" className="inline-block bg-white text-black px-10 py-4 rounded-xl font-medium text-base hover:bg-gray-100 transition-colors duration-200">
        Créer mon compte gratuitement
      </Link>
    </div>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────

function SiteFooter() {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
      <div>
        <span className="text-lg font-semibold tracking-tight">VECTRA</span>
        <p className="text-xs text-gray-600 mt-1">Prospection IA, automatisée.</p>
      </div>
      <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-500">
        <a href="#fonctionnalités" className="hover:text-white transition-colors">Fonctionnalités</a>
        <a href="#tarifs" className="hover:text-white transition-colors">Tarifs</a>
        <Link href="/auth/sign-in" className="hover:text-white transition-colors">Connexion</Link>
        <Link href="/legal/privacy" className="hover:text-white transition-colors">Confidentialité</Link>
        <Link href="/legal/terms" className="hover:text-white transition-colors">CGU</Link>
      </nav>
      <p className="text-xs text-gray-700">© {new Date().getFullYear()} Vectra. Tous droits réservés.</p>
    </div>
  );
}
