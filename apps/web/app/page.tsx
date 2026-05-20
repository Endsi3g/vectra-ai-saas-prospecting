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
                        <rect x="13" y="3" width="8" height="8" rx="2" fill-opacity="0.5" />
                        <rect x="3" y="13" width="8" height="8" rx="2" fill-opacity="0.5" />
                    </svg>
                    <span className="text-xl font-bold tracking-tight text-zinc-900">Wrangle</span>
                </div>

                <nav className="hidden md:flex items-center gap-8 text-[15px] font-medium text-zinc-600">
                    <Link href="#features" className="hover:text-zinc-900 transition-colors">Product</Link>
                    <Link href="#how" className="hover:text-zinc-900 transition-colors">Solutions</Link>
                    <Link href="#pricing" className="hover:text-zinc-900 transition-colors">Pricing</Link>
                </nav>

                <div className="flex items-center gap-5 text-[15px] font-medium">
                    <Link href="/auth/sign-in" className="hidden lg:block text-zinc-600 hover:text-zinc-900 transition-colors">Get a Demo</Link>
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
                    <span className="text-lg leading-none">📢</span> April 27: Introducing our API and MCP
                </div>

                {/* H1 Heading */}
                <h1 className="text-5xl md:text-[64px] leading-tight font-semibold tracking-tight text-zinc-900 mb-6">
                    From Search to Shortlist in Minutes
                </h1>

                {/* Subheading */}
                <p className="text-lg md:text-xl text-zinc-500 mb-10 max-w-2xl mx-auto leading-relaxed">
                    Wrangle lets you source in natural language, engage candidates at scale, and interview with intelligence.
                </p>

                {/* Get started button */}
                <Link href="/auth/sign-up" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border border-zinc-200 shadow-sm text-base font-semibold rounded-full text-zinc-900 hover:bg-zinc-50 transition-all hover:shadow-md">
                    Get Started
                    <ArrowRight className="w-4 h-4 text-zinc-400" />
                </Link>
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

        {/* Social Proof Partners */}
        <div className="max-w-5xl mx-auto py-8 px-4 flex flex-wrap justify-center items-center gap-x-12 gap-y-8 opacity-60 grayscale select-none">
            <div className="text-xl font-bold tracking-tighter text-zinc-400">chime</div>
            <div className="text-xl font-bold flex items-center gap-1 text-zinc-400">
                <svg className="w-5 h-5 text-zinc-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 22h20L12 2z"/>
                </svg>
                Serval
            </div>
            <div className="text-xl font-bold text-zinc-400">Lightspeed</div>
            <div className="text-xl font-bold tracking-widest text-zinc-400">SULLY.AI</div>
        </div>

        {/* Features Section */}
        <section id="features" className="py-16 px-6 max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 mb-4">
              Tout ce qu'il vous faut pour prospecter efficacement
            </h2>
            <p className="text-zinc-500 text-lg max-w-xl mx-auto">
              Wrangle automatise chaque étape de votre cycle de prospection B2B.
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

        {/* Final CTA */}
        <section id="pricing" className="py-16 px-6">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-[#FAFBFC] border border-zinc-200/60 rounded-3xl p-12 shadow-sm">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 mb-4">
                Prêt à transformer votre prospection ?
              </h2>
              <p className="text-zinc-500 mb-8 leading-relaxed">
                Commencez gratuitement avec 50 leads. Aucune carte bancaire requise.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link href="/auth/sign-up">
                  <Button size="lg" className="bg-zinc-900 text-white font-bold px-8 h-12 shadow-md hover:bg-zinc-800 hover:-translate-y-0.5 transition-all duration-200">
                    Créer mon compte gratuit
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/app?bypass=true">
                  <Button size="lg" variant="outline" className="px-8 h-12 bg-white border border-zinc-200 hover:-translate-y-0.5 transition-all duration-200">
                    Voir la démo
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-zinc-100 py-10 bg-white">
          <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-between items-start gap-8 text-sm">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <svg className="w-6 h-6 text-emerald-500" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="3" y="3" width="8" height="8" rx="2" />
                    <rect x="13" y="3" width="8" height="8" rx="2" fill-opacity="0.5" />
                    <rect x="3" y="13" width="8" height="8" rx="2" fill-opacity="0.5" />
                </svg>
                <span className="font-bold text-zinc-900">Wrangle</span>
              </div>
              <p className="text-zinc-400 text-xs max-w-xs leading-relaxed">
                Plateforme AI de prospection B2B — automatisez vos outreach et boostez vos conversions.
              </p>
            </div>
            <div className="flex gap-12 text-xs text-zinc-400">
              <div className="space-y-2">
                <p className="font-semibold text-zinc-600 mb-3">Produit</p>
                <Link href="#features" className="block hover:text-zinc-900 transition-colors">Fonctionnalités</Link>
                <Link href="#pricing" className="block hover:text-zinc-900 transition-colors">Tarifs</Link>
                <Link href="/app?bypass=true" className="block hover:text-zinc-900 transition-colors">Démo</Link>
              </div>
              <div className="space-y-2">
                <p className="font-semibold text-zinc-600 mb-3">Légal</p>
                <Link href="#" className="block hover:text-zinc-900 transition-colors">Conditions</Link>
                <Link href="#" className="block hover:text-zinc-900 transition-colors">Confidentialité</Link>
              </div>
            </div>
          </div>
          <div className="max-w-7xl mx-auto px-6 pt-8 mt-8 border-t border-zinc-100">
            <p className="text-xs text-zinc-400">&copy; {new Date().getFullYear()} Wrangle Inc. Tous droits réservés.</p>
          </div>
        </footer>

      </div>

    </div>
  );
}
