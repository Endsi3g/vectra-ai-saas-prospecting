'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { Textarea } from '@workspace/ui/components/textarea';
import { supabase } from '@/lib/supabase';
import { 
  Lock, 
  Check, 
  ArrowRight, 
  ArrowLeft, 
  Shield, 
  Building2, 
  Plus, 
  Mail, 
  Loader2, 
  Sparkles,
  Search,
  Compass,
  Zap,
  Globe,
  Users
} from 'lucide-react';

type Step = 0 | 1 | 2 | 3 | 4;

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(0);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  
  // Step 0: Personal Info
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [emailNotifications, setEmailNotifications] = useState(true);

  // Step 1: Enterprise Profile & Offer
  const [companyName, setCompanyName] = useState('');
  const [businessType, setBusinessType] = useState('solopreneur');
  const [offerPitch, setOfferPitch] = useState('');

  // Step 2: ICP Targets
  const [icpTarget, setIcpTarget] = useState('');
  const [icpLocation, setIcpLocation] = useState('France');
  const [icpHeadcount, setIcpHeadcount] = useState('1-10');

  // Step 3: Simulated Nylas Mailbox Connection
  const [mailboxProvider, setMailboxProvider] = useState<'gmail' | 'outlook' | 'icloud' | null>(null);
  const [mailboxConnected, setMailboxConnected] = useState(false);
  const [connectingMailbox, setConnectingMailbox] = useState(false);

  // Step 4: Plan Trial & Completion
  const [selectedPlan, setSelectedPlan] = useState<'starter' | 'solo'>('starter');

  useEffect(() => {
    // Fetch current user email
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setEmail(user.email || '');
      } else {
        setEmail('alex@vectra.ai');
      }
    };
    fetchUser();
  }, []);

  const handleConnectMailbox = (provider: 'gmail' | 'outlook' | 'icloud') => {
    setMailboxProvider(provider);
    setConnectingMailbox(true);
    setTimeout(() => {
      setMailboxConnected(true);
      setConnectingMailbox(false);
      // Auto-advance after successful connection simulation
      setTimeout(() => setStep(4), 800);
    }, 1500);
  };

  const handleNextStep = () => {
    if (step < 4) {
      setStep((step + 1) as Step);
    }
  };

  const handlePrevStep = () => {
    if (step > 0) {
      setStep((step - 1) as Step);
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        let workspaceId = null;
        if (companyName) {
          // Create workspace in Supabase
          const { data: ws } = await supabase
            .from('workspaces')
            .insert({
              name: companyName,
              slug: companyName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
            })
            .select()
            .single();
          
          if (ws) workspaceId = ws.id;
        }

        // Update profile
        await supabase
          .from('profiles')
          .update({
            first_name: firstName,
            last_name: lastName,
            workspace_id: workspaceId,
            google_connected: mailboxConnected,
            onboarding_completed: true,
            tour_completed: false // triggers tour guide on dashboard
          })
          .eq('id', user.id);
      } else {
        // Mock save to localStorage
        localStorage.setItem('first_name', firstName);
        localStorage.setItem('last_name', lastName);
        localStorage.setItem('workspace_name', companyName);
        localStorage.setItem('google_connected', String(mailboxConnected));
        localStorage.setItem('onboarding_completed', 'true');
        localStorage.setItem('tour_completed', 'false'); // triggers tour guide
      }

      router.push('/app');
    } catch (err) {
      console.error('Error during onboarding completion:', err);
      router.push('/app');
    } finally {
      setLoading(false);
    }
  };

  const formattedDate = () => {
    const d = new Date();
    return d.toLocaleDateString('fr-FR', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="flex min-h-screen bg-[#FAFAFA] text-zinc-950 font-sans select-none">
      
      {/* STEP 0: Centered single column welcome layout */}
      {step === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="w-full max-w-[480px] bg-white border border-zinc-200 rounded-2xl p-8 shadow-xl">
            
            {/* Header */}
            <div className="text-center mb-6">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-3">
                <Sparkles className="h-6 w-6 animate-pulse" />
              </div>
              <h2 className="text-2xl font-extrabold tracking-tight text-zinc-900">
                Faisons connaissance 👋
              </h2>
              <p className="text-sm text-zinc-500 mt-2">
                Configurez vos informations personnelles pour commencer sur Vectra.
              </p>
            </div>

            {/* Form */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-xs font-bold uppercase text-zinc-400">Prénom</Label>
                  <Input 
                    id="firstName"
                    placeholder="Alex"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="border-zinc-200 focus-visible:ring-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-xs font-bold uppercase text-zinc-400">Nom</Label>
                  <Input 
                    id="lastName"
                    placeholder="Dupont"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="border-zinc-200 focus-visible:ring-primary"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-bold uppercase text-zinc-400">Adresse E-mail</Label>
                <div className="relative">
                  <Input 
                    id="email"
                    type="email"
                    value={email}
                    disabled
                    className="border-zinc-200 bg-zinc-50 pl-10 pr-4 text-zinc-400 cursor-not-allowed"
                  />
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                </div>
              </div>

              {/* Notification toggle */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-zinc-100 bg-zinc-50/50 mt-2">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-zinc-800">Notifications E-mail</span>
                  <p className="text-[10px] text-zinc-400">Recevoir des analyses et alertes de prospection.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setEmailNotifications(!emailNotifications)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    emailNotifications ? 'bg-primary' : 'bg-zinc-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      emailNotifications ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Action */}
            <div className="mt-8">
              <Button
                onClick={handleNextStep}
                disabled={!firstName || !lastName}
                className="w-full bg-primary hover:bg-primary/95 text-white font-bold h-11"
              >
                Continuer
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

          </div>
        </div>
      ) : (
        /* STEPS 1 TO 4: Split screen layout */
        <div className="flex-1 flex min-h-screen">
          
          {/* LEFT PANEL: Form interactive action panel */}
          <div className="w-[55%] flex flex-col justify-between p-12 bg-white border-r border-zinc-200">
            
            {/* Header: Logo */}
            <div className="flex items-center gap-2 select-none">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white font-bold">
                V
              </div>
              <span className="text-lg font-bold tracking-tight text-zinc-900">Vectra</span>
            </div>

            {/* Center Content */}
            <div className="max-w-[460px] w-full mx-auto my-8">
              
              {/* STEP 1: Enterprise Profile & Offer */}
              {step === 1 && (
                <div className="space-y-6 animate-fade-in">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-extrabold tracking-tight text-zinc-900">
                      Profil de votre entreprise
                    </h2>
                    <p className="text-sm text-zinc-500">
                      Définissons qui vous êtes et ce que vous proposez pour orienter les rédactions d'IA.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="compName" className="text-xs font-bold uppercase text-zinc-400">Nom de votre entreprise *</Label>
                      <Input 
                        id="compName"
                        placeholder="Vectra Corp"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="border-zinc-200 focus-visible:ring-primary"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="busType" className="text-xs font-bold uppercase text-zinc-400">Type d'activité</Label>
                      <select
                        id="busType"
                        value={businessType}
                        onChange={(e) => setBusinessType(e.target.value)}
                        className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      >
                        <option value="solopreneur">Solopreneur / Freelance</option>
                        <option value="agency">Petite Agence</option>
                        <option value="saas">SaaS early-stage</option>
                        <option value="other">Autre / E-commerce</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="pitch" className="text-xs font-bold uppercase text-zinc-400">Votre offre commerciale (Langage Naturel)</Label>
                      <Textarea 
                        id="pitch"
                        placeholder="Ex: Je crée des landing pages pour les infopreneurs et coachs business B2B..."
                        rows={4}
                        value={offerPitch}
                        onChange={(e) => setOfferPitch(e.target.value)}
                        className="border-zinc-200 focus-visible:ring-primary text-sm font-normal"
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 flex items-center gap-3">
                    <Button 
                      variant="outline"
                      onClick={handlePrevStep}
                      className="border-zinc-200 h-11 text-xs px-4"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Retour
                    </Button>

                    <Button
                      onClick={handleNextStep}
                      disabled={!companyName || !offerPitch}
                      className="flex-1 bg-primary text-white hover:bg-primary/95 font-bold h-11 text-xs"
                    >
                      Continuer
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* STEP 2: ICP Target Settings */}
              {step === 2 && (
                <div className="space-y-6 animate-fade-in">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-extrabold tracking-tight text-zinc-900">
                      Définissons votre client idéal (ICP)
                    </h2>
                    <p className="text-sm text-zinc-500">
                      Spécifiez les entreprises et décideurs à cibler pour notre moteur de sourcing IA.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="icp" className="text-xs font-bold uppercase text-zinc-400">Cible / Rôle recherché *</Label>
                      <Input 
                        id="icp"
                        placeholder="Ex: SaaS Founders B2B"
                        value={icpTarget}
                        onChange={(e) => setIcpTarget(e.target.value)}
                        className="border-zinc-200 focus-visible:ring-primary"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="icp-loc" className="text-xs font-bold uppercase text-zinc-400">Géographie</Label>
                        <Input 
                          id="icp-loc"
                          placeholder="Canada / France"
                          value={icpLocation}
                          onChange={(e) => setIcpLocation(e.target.value)}
                          className="border-zinc-200 focus-visible:ring-primary"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="icp-hc" className="text-xs font-bold uppercase text-zinc-400">Taille d'équipe</Label>
                        <select
                          id="icp-hc"
                          className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        >
                          <option value="1-10">1-10 personnes</option>
                          <option value="11-50">11-50 personnes</option>
                          <option value="51-200">51-200 personnes</option>
                          <option value="200+">Plus de 200 personnes</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 flex items-center gap-3">
                    <Button 
                      variant="outline"
                      onClick={handlePrevStep}
                      className="border-zinc-200 h-11 text-xs px-4"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Retour
                    </Button>

                    <Button
                      onClick={handleNextStep}
                      disabled={!icpTarget}
                      className="flex-1 bg-primary text-white hover:bg-primary/95 font-bold h-11 text-xs"
                    >
                      Continuer
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* STEP 3: Connect Mailbox Simulator */}
              {step === 3 && (
                <div className="space-y-6 animate-fade-in">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-extrabold tracking-tight text-zinc-900">
                      Connectez votre boîte mail (Nylas)
                    </h2>
                    <p className="text-sm text-zinc-500">
                      Liez votre messagerie pour planifier, suivre vos e-mails de prospection et gérer les réponses en direct.
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => handleConnectMailbox('gmail')}
                      disabled={connectingMailbox}
                      className="border border-zinc-200 rounded-xl p-4 flex flex-col items-center gap-2 hover:bg-zinc-50 hover:border-primary transition-all duration-200"
                    >
                      <Building2 className="h-6 w-6 text-red-500" />
                      <span className="text-xs font-semibold">Google Workspace</span>
                    </button>
                    <button
                      onClick={() => handleConnectMailbox('outlook')}
                      disabled={connectingMailbox}
                      className="border border-zinc-200 rounded-xl p-4 flex flex-col items-center gap-2 hover:bg-zinc-50 hover:border-primary transition-all duration-200"
                    >
                      <Mail className="h-6 w-6 text-blue-500" />
                      <span className="text-xs font-semibold">Outlook</span>
                    </button>
                    <button
                      onClick={() => handleConnectMailbox('icloud')}
                      disabled={connectingMailbox}
                      className="border border-zinc-200 rounded-xl p-4 flex flex-col items-center gap-2 hover:bg-zinc-50 hover:border-primary transition-all duration-200"
                    >
                      <Globe className="h-6 w-6 text-zinc-700" />
                      <span className="text-xs font-semibold">iCloud / IMAP</span>
                    </button>
                  </div>

                  {connectingMailbox && (
                    <div className="border border-zinc-100 bg-zinc-50 p-4 rounded-xl flex items-center justify-center gap-3">
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      <span className="text-xs text-zinc-600 font-medium">Connexion sécurisée en cours...</span>
                    </div>
                  )}

                  {mailboxConnected && (
                    <div className="border border-emerald-100 bg-emerald-50/50 p-4 rounded-xl flex items-center justify-center gap-3">
                      <Check className="h-5 w-5 text-emerald-600" />
                      <span className="text-xs text-emerald-800 font-semibold">Messagerie connectée avec succès !</span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="pt-4 flex items-center gap-3">
                    <Button 
                      variant="outline"
                      onClick={handlePrevStep}
                      disabled={connectingMailbox}
                      className="border-zinc-200 h-11 text-xs px-4"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Retour
                    </Button>

                    <Button
                      variant="ghost"
                      onClick={() => setStep(4)}
                      disabled={connectingMailbox}
                      className="text-zinc-400 hover:text-zinc-600 h-11 text-xs px-3"
                    >
                      Passer pour l'instant
                    </Button>
                  </div>
                </div>
              )}

              {/* STEP 4: Choose Trial plan & Complete */}
              {step === 4 && (
                <div className="space-y-6 animate-fade-in">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-extrabold tracking-tight text-zinc-900">
                      Votre essai d'évaluation Starter 🎁
                    </h2>
                    <p className="text-sm text-zinc-500">
                      Activez votre pack de bienvenue gratuit pour commencer à sourcer immédiatement.
                    </p>
                  </div>

                  <div className="border-2 border-primary bg-primary/5 rounded-2xl p-6 relative overflow-hidden">
                    <div className="absolute top-4 right-4 bg-primary text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">
                      Gratuit
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-primary fill-primary" />
                      <span className="text-sm font-extrabold text-primary uppercase tracking-wider">Starter Pack</span>
                    </div>
                    
                    <div className="mt-4 space-y-3">
                      <div className="flex items-center gap-2 text-xs font-semibold text-zinc-800">
                        <Check className="h-4 w-4 text-primary" />
                        <span>2000 crédits de sourcing inclus</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-semibold text-zinc-800">
                        <Check className="h-4 w-4 text-primary" />
                        <span>IA Copilot de recherche active</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-semibold text-zinc-800">
                        <Check className="h-4 w-4 text-primary" />
                        <span>1 connexion de boîte mail</span>
                      </div>
                    </div>

                    <div className="border-t border-primary/20 mt-5 pt-4 text-[10px] text-zinc-500">
                      Aucune carte bancaire requise. Vous pourrez passer à un forfait supérieur à tout moment.
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 flex items-center gap-3">
                    <Button 
                      variant="outline"
                      onClick={handlePrevStep}
                      disabled={loading}
                      className="border-zinc-200 h-11 text-xs px-4"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Retour
                    </Button>

                    <Button
                      onClick={handleComplete}
                      disabled={loading}
                      className="flex-1 bg-primary text-white hover:bg-primary/95 font-bold h-11 text-xs"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Finalisation...
                        </>
                      ) : (
                        <>
                          Lancer mon essai gratuit
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}

            </div>

            {/* Footer */}
            <div className="text-[10px] text-zinc-400 text-center">
              Vectra &copy; {new Date().getFullYear()} &middot; Privacy &amp; Terms
            </div>

          </div>

          {/* RIGHT PANEL: Status info tracker */}
          <div className="w-[45%] flex flex-col justify-between p-12 bg-[#F9F9FB] border-l border-zinc-200">
            
            {/* Top counter */}
            <div className="flex justify-end select-none">
              <span className="text-xs font-bold text-zinc-400 bg-zinc-200/50 px-2.5 py-1 rounded-full">
                {step <= 1 ? '1/3' : step <= 3 ? '2/3' : '3/3'}
              </span>
            </div>

            {/* Central widget card */}
            <div className="max-w-[340px] w-full mx-auto bg-white border border-zinc-200 rounded-2xl p-6 shadow-md">
              
              {/* User Block */}
              <div className="flex items-center gap-3 border-b border-zinc-100 pb-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                  {firstName && lastName ? `${firstName[0]}${lastName[0]}`.toUpperCase() : 'AD'}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-bold text-zinc-800 truncate block">
                    {firstName && lastName ? `${firstName} ${lastName}` : 'Alex Dupont'}
                  </span>
                  <span className="text-[10px] text-zinc-400 truncate block">
                    {companyName ? companyName : 'Vectra'}
                  </span>
                </div>
              </div>

              {/* Status checklist */}
              <div className="py-4 space-y-4">
                
                {/* Check 1 */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${step >= 1 ? 'bg-emerald-500' : 'bg-primary animate-pulse'}`} />
                    <span className="text-xs font-bold text-zinc-700">Profil Commercial</span>
                  </div>
                  <span className={`text-[10px] font-bold ${
                    step >= 1 ? 'text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded' : 'text-primary bg-primary/5 px-2 py-0.5 rounded'
                  }`}>
                    {step >= 1 ? 'Configure' : 'En cours...'}
                  </span>
                </div>

                {/* Check 2 */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${
                      step >= 3 ? 'bg-emerald-500' : step === 2 ? 'bg-amber-500 animate-pulse' : 'bg-zinc-300'
                    }`} />
                    <span className="text-xs font-bold text-zinc-700">Cible (ICP)</span>
                  </div>
                  <span className={`text-[10px] font-bold ${
                    step >= 3 
                      ? 'text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded' 
                      : step === 2 
                        ? 'text-amber-600 bg-amber-50 px-2 py-0.5 rounded' 
                        : 'text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded'
                  }`}>
                    {step >= 3 ? 'Configure' : step === 2 ? 'En cours...' : 'Non commence'}
                  </span>
                </div>

                {/* Check 3 */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${
                      mailboxConnected ? 'bg-emerald-500' : step === 3 ? 'bg-amber-500 animate-pulse' : 'bg-zinc-300'
                    }`} />
                    <span className="text-xs font-bold text-zinc-700">Messagerie</span>
                  </div>
                  <span className={`text-[10px] font-bold ${
                    mailboxConnected
                      ? 'text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded' 
                      : step === 3 
                        ? 'text-amber-600 bg-amber-50 px-2 py-0.5 rounded' 
                        : 'text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded'
                  }`}>
                    {mailboxConnected ? 'Connecte' : step === 3 ? 'En cours...' : 'Non commence'}
                  </span>
                </div>

              </div>

              {/* Card Footer info */}
              {companyName && (
                <div className="mt-2 pt-3 border-t border-zinc-100 text-[10px] text-zinc-400 flex items-center justify-between">
                  <span>Organisation :</span>
                  <span className="font-mono text-zinc-600 truncate max-w-[160px]">{companyName}</span>
                </div>
              )}
            </div>

            {/* Footer logo & date */}
            <div className="flex items-center justify-between text-[10px] text-zinc-400 select-none">
              <span className="font-bold">Portail Vectra</span>
              <span>{formattedDate()}</span>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
