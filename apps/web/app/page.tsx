import React from 'react';
import Link from 'next/link';
import { Button } from '@workspace/ui/components/button';
import { Sparkles, ArrowRight, Compass, ShieldCheck, Mail, Check, Zap, Users, BarChart3 } from 'lucide-react';

export default function MarketingLandingPage() {
  return (
    <div className="min-h-screen bg-white text-zinc-950 font-sans flex flex-col selection:bg-purple-100 selection:text-purple-900 antialiased">

      <div className="max-w-[1440px] mx-auto w-full p-4 md:p-6 lg:p-8 pt-4 flex-1 flex flex-col gap-12">
        
        {/* Rounded Hero Card wrapper containing Navigation & Hero */}
        <div className="relative bg-[#FAFBFC] rounded-[2rem] overflow-hidden border border-zinc-200/50 pb-20 shadow-sm flex flex-col">
            
            {/* Blurry gradient background vector elements (Mesh Gradient) */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[60%] bg-[#E0F2FE] rounded-full mix-blend-multiply filter blur-[100px] opacity-80 pointer-events-none"></div>
            <div className="absolute top-[10%] right-[-10%] w-[45%] h-[70%] bg-[#FAE8FF] rounded-full mix-blend-multiply filter blur-[120px] opacity-80 pointer-events-none"></div>

            {/* Navigation Header */}
            <header className="relative z-10 flex items-center justify-between px-6 py-5 md:px-10 max-w-7xl mx-auto w-full">
                <div className="flex items-center gap-2">
                    <svg className="w-6 h-6 text-emerald-500" viewBox="0 0 24 24" fill="currentColor">
                        <rect x="3" y="3" width="8" height="8" rx="2" />
                        <rect x="13" y="3" width="8" height="8" rx="2" fillOpacity="0.5" />
                        <rect x="3" y="13" width="8" height="8" rx="2" fillOpacity="0.5" />
                    </svg>
                    <span className="text-xl font-bold tracking-tight text-zinc-900">Vectra</span>
                </div>

                <nav className="hidden md:flex items-center gap-8 text-[15px] font-medium text-zinc-600">
                    <Link href="#features" className="hover:text-zinc-900 transition-colors">Product</Link>
                    <Link href="#how" className="hover:text-zinc-900 transition-colors">Solutions</Link>
                    <Link href="#pricing" className="hover:text-zinc-900 transition-colors">Pricing</Link>
                </nav>

                <div className="flex items-center gap-5 text-[15px] font-medium">
                    <Link href="/app?bypass=true" className="hidden lg:block text-zinc-600 hover:text-zinc-900 transition-colors">Voir la démo</Link>
                    <Link href="/auth/sign-in" className="text-zinc-600 hover:text-zinc-900 transition-colors">Log In</Link>
                    <Link href="/auth/sign-up" className="flex items-center gap-1.5 px-4 py-2 bg-white border border-zinc-200 rounded-full shadow-sm hover:bg-zinc-50 transition-colors text-zinc-900 font-semibold">
                        Get started
                        <ArrowRight className="w-4 h-4 text-zinc-400" />
                    </Link>
                </div>
            </header>

            {/* Hero Main Content */}
            <main className="relative z-10 pt-20 pb-16 px-4 text-center max-w-4xl mx-auto flex flex-col items-center">
                
                {/* Announcement Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-zinc-200 shadow-sm text-xs font-medium text-zinc-600 mb-8 hover:bg-zinc-50 cursor-pointer transition-colors">
                    <span className="text-lg leading-none">🚀</span> Nouveau : accès API & MCP disponible dès maintenant
                </div>

                {/* H1 Heading */}
                <h1 className="text-5xl md:text-[64px] leading-tight font-semibold tracking-tight text-zinc-900 mb-6">
                    De la Recherche au Lead Qualifié en Minutes
                </h1>

                {/* Subheading */}
                <p className="text-lg md:text-xl text-zinc-500 mb-10 max-w-2xl mx-auto leading-relaxed">
                    Vectra vous permet de sourcer en langage naturel, d'engager vos prospects à grande échelle, et d'automatiser votre pipeline de prospection B2B.
                </p>

                {/* Get started button */}
                <div className="flex flex-wrap justify-center gap-3">
                  <Link href="/auth/sign-up" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-zinc-900 text-white text-base font-semibold rounded-full hover:bg-zinc-800 transition-all hover:shadow-md">
                      Démarrer gratuitement
                      <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link href="/app?bypass=true" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border border-zinc-200 shadow-sm text-base font-semibold rounded-full text-zinc-900 hover:bg-zinc-50 transition-all hover:shadow-md">
                      Voir la démo live
                  </Link>
                </div>
            </main>

            {/* Premium Mockup Glassmorphism Wrapper */}
            <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 w-full">
                <div className="rounded-2xl border border-zinc-200/60 bg-white/40 backdrop-blur-md p-2 shadow-2xl">
                    <div className="rounded-xl overflow-hidden bg-white border border-zinc-100 relative aspect-video flex items-center justify-center">
                        <img 
                          src="/app-mockup.png" 
                          className="w-full h-full object-cover" 
                          alt="Wrangle application dashboard preview" 
                        />
                    </div>
                </div>
            </div>

        </div>

        {/* Social Proof */}
        <div className="max-w-5xl mx-auto py-8 px-4 text-center select-none">
            <p className="text-sm font-medium text-zinc-400 mb-4">Utilisé par des fondateurs et équipes de vente B2B dans toute la francophonie</p>
            <div className="flex flex-wrap justify-center items-center gap-x-10 gap-y-4 opacity-50 grayscale">
                <div className="text-base font-bold tracking-tight text-zinc-500">SaaS Founders</div>
                <div className="text-base font-bold text-zinc-500">Agences Growth</div>
                <div className="text-base font-bold text-zinc-500">Consultants B2B</div>
                <div className="text-base font-bold text-zinc-500">Startups Tech</div>
            </div>
        </div>

        {/* Features Section */}
        <section id="features" className="py-16 px-6 max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 mb-4">
              Tout ce qu'il vous faut pour prospecter efficacement
            </h2>
            <p className="text-zinc-500 text-lg max-w-xl mx-auto">
              Vectra automatise chaque étape de votre cycle de prospection B2B.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                icon: Compass,
                title: 'Recherche Intelligente',
                description: 'Scraping automatique et analyse IA des sites web de vos leads pour extraire les informations clés.',
              },
              {
                icon: Mail,
                title: 'Rédaction Multi-Canaux',
                description: 'Cold emails structurés et messages LinkedIn DM adaptés à votre offre et votre angle d\'approche.',
              },
              {
                icon: ShieldCheck,
                title: 'Validation & Export CSV',
                description: 'Passez en revue les messages, éditez les brouillons, validez et exportez en un clic.',
              },
              {
                icon: Zap,
                title: 'Agents Autonomes',
                description: 'Hermes, Apollo et Athena travaillent en arrière-plan pour automatiser votre pipeline.',
              },
              {
                icon: Users,
                title: 'Gestion des Leads',
                description: 'Bibliothèque de candidats organisée en collections, avec filtres et import CSV.',
              },
              {
                icon: BarChart3,
                title: 'Analytics Avancées',
                description: 'Suivez vos KPIs — taux d\'ouverture, réponses, appels bookés — avec des graphiques temps réel.',
              },
            ].map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div
                  key={idx}
                  className="group bg-white border border-zinc-200 p-6 rounded-2xl hover:-translate-y-1 hover:shadow-lg hover:border-zinc-300 transition-all duration-[220ms] animate-fade-up"
                >
                  <div className="h-10 w-10 bg-zinc-50 text-zinc-700 rounded-xl flex items-center justify-center mb-4 group-hover:bg-zinc-950 group-hover:text-white transition-all duration-300 border border-zinc-200">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold text-base text-zinc-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-zinc-500 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="py-16 px-6 bg-[#FAFBFC] border border-zinc-200/50 rounded-[2rem]">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 mb-4">
              En 3 étapes simples
            </h2>
            <p className="text-zinc-500 text-lg mb-16 max-w-xl mx-auto">
              De l'import de prospects à l'envoi de messages personnalisés en quelques minutes.
            </p>
            <div className="grid md:grid-cols-3 gap-8 text-left">
              {[
                { num: '01', title: 'Importez vos prospects', desc: 'Importez via CSV ou recherche NLP directement dans l\'app.' },
                { num: '02', title: 'L\'IA analyse et rédige', desc: 'Wrangle scrape les sites, analyse le contexte et génère des messages personnalisés.' },
                { num: '03', title: 'Validez et envoyez', desc: 'Revoyez les brouillons, approuvez et exportez vers vos outils d\'envoi.' },
              ].map((step, idx) => (
                <div key={idx} className="space-y-3">
                  <span className="text-4xl font-extrabold text-zinc-200 font-mono">{step.num}</span>
                  <h3 className="font-bold text-base text-zinc-900">{step.title}</h3>
                  <p className="text-sm text-zinc-500 leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-16 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 mb-4">
                Tarifs simples et transparents
              </h2>
              <p className="text-zinc-500 text-lg max-w-xl mx-auto">
                Commencez gratuitement. Passez au plan supérieur quand vous êtes prêt.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Free Plan */}
              <div className="bg-white border border-zinc-200 rounded-2xl p-8 flex flex-col">
                <div className="mb-6">
                  <p className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-2">Gratuit</p>
                  <div className="flex items-end gap-1 mb-4">
                    <span className="text-4xl font-extrabold text-zinc-900">0 $</span>
                    <span className="text-zinc-400 mb-1">/mois</span>
                  </div>
                  <p className="text-sm text-zinc-500">Pour découvrir Vectra et tester le potentiel de l'IA de prospection.</p>
                </div>
                <ul className="space-y-3 flex-1 mb-8">
                  {['2 000 crédits de sourcing', '1 campagne active', 'Import CSV', 'Génération de messages IA', 'Accès à l\'inbox unifié'].map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm text-zinc-600">
                      <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/auth/sign-up" className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-200 text-sm font-semibold text-zinc-900 hover:bg-zinc-50 transition-colors">
                  Démarrer gratuitement
                </Link>
              </div>

              {/* Starter Plan */}
              <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-8 flex flex-col relative overflow-hidden">
                <div className="absolute top-4 right-4 bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">Populaire</div>
                <div className="mb-6">
                  <p className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-2">Starter</p>
                  <div className="flex items-end gap-1 mb-4">
                    <span className="text-4xl font-extrabold text-white">199 $</span>
                    <span className="text-zinc-400 mb-1">/mois</span>
                  </div>
                  <p className="text-sm text-zinc-400">Pour les solopreneurs et freelances qui veulent automatiser leur prospection.</p>
                </div>
                <ul className="space-y-3 flex-1 mb-8">
                  {['5 000 crédits/mois', 'Campagnes illimitées', 'Agents Hermes & Apollo', 'Inbox avec Magic Reply IA', 'Connecteur Gmail & Outlook', 'Export CSV & intégrations', 'Suivi pipeline complet'].map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm text-zinc-300">
                      <Check className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/auth/sign-up" className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 text-sm font-bold text-white hover:bg-emerald-600 transition-colors">
                  Commencer avec Starter
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Scale Plan */}
              <div className="bg-white border border-zinc-200 rounded-2xl p-8 flex flex-col">
                <div className="mb-6">
                  <p className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-2">Scale</p>
                  <div className="flex items-end gap-1 mb-4">
                    <span className="text-4xl font-extrabold text-zinc-900">499 $</span>
                    <span className="text-zinc-400 mb-1">/mois</span>
                  </div>
                  <p className="text-sm text-zinc-500">Pour les agences et équipes commerciales qui scalent leur prospection.</p>
                </div>
                <ul className="space-y-3 flex-1 mb-8">
                  {['20 000 crédits/mois', 'Tout Starter inclus', 'Multi-membres (jusqu\'à 5)', 'Agents autonomes complets', 'Analytics avancées', 'API & MCP access', 'Support prioritaire', 'Branding workspace'].map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm text-zinc-600">
                      <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/auth/sign-up" className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-200 text-sm font-semibold text-zinc-900 hover:bg-zinc-50 transition-colors">
                  Commencer avec Scale
                </Link>
              </div>
            </div>

            <p className="text-center text-xs text-zinc-400 mt-8">
              Tous les prix en USD. Annulation à tout moment. Paiement sécurisé via Stripe.
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-zinc-100 py-10 bg-white">
          <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-between items-start gap-8 text-sm">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <svg className="w-6 h-6 text-emerald-500" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="3" y="3" width="8" height="8" rx="2" />
                    <rect x="13" y="3" width="8" height="8" rx="2" fillOpacity="0.5" />
                    <rect x="3" y="13" width="8" height="8" rx="2" fillOpacity="0.5" />
                </svg>
                <span className="font-bold text-zinc-900">Vectra</span>
              </div>
              <p className="text-zinc-400 text-xs max-w-xs leading-relaxed">
                Plateforme IA de prospection B2B — automatisez vos outreach et boostez vos conversions.
              </p>
            </div>
            <div className="flex gap-12 text-xs text-zinc-400">
              <div className="space-y-2">
                <p className="font-semibold text-zinc-600 mb-3">Produit</p>
                <Link href="#features" className="block hover:text-zinc-900 transition-colors">Fonctionnalités</Link>
                <Link href="#pricing" className="block hover:text-zinc-900 transition-colors">Tarifs</Link>
                <Link href="/app?bypass=true" className="block hover:text-zinc-900 transition-colors">Démo live</Link>
              </div>
              <div className="space-y-2">
                <p className="font-semibold text-zinc-600 mb-3">Légal</p>
                <Link href="/terms" className="block hover:text-zinc-900 transition-colors">Conditions</Link>
                <Link href="/privacy" className="block hover:text-zinc-900 transition-colors">Confidentialité</Link>
              </div>
            </div>
          </div>
          <div className="max-w-7xl mx-auto px-6 pt-8 mt-8 border-t border-zinc-100">
            <p className="text-xs text-zinc-400">&copy; {new Date().getFullYear()} Vectra OS Inc. Tous droits réservés.</p>
          </div>
        </footer>

      </div>

    </div>
  );
}
