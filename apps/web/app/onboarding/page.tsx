'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
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
  Upload, 
  Loader2, 
  Sparkles,
  Calendar,
  Search,
  ChevronRight
} from 'lucide-react';

type Step = 0 | 1 | 2 | 3 | 4;

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(0);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  
  // Step 0 states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [emailNotifications, setEmailNotifications] = useState(true);

  // Step 1 states
  const [googleConnected, setGoogleConnected] = useState(false);
  const [connectingGoogle, setConnectingGoogle] = useState(false);

  // Step 2 & 3 states
  const [workspaceName, setWorkspaceName] = useState('');
  const [workspaceSlug, setWorkspaceSlug] = useState('');
  const [workspaceLogo, setWorkspaceLogo] = useState<string | null>(null);

  // Step 4 states
  const [teammates, setTeammates] = useState('');
  const [allowDomainJoin, setAllowDomainJoin] = useState(false);

  useEffect(() => {
    // Fetch current user email
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setEmail(user.email || '');
      } else {
        // Fallback email for mock development
        setEmail('kael@wrangle.com');
      }
    };
    fetchUser();
  }, []);

  // Sync workspace slug from name
  useEffect(() => {
    if (workspaceName) {
      const slug = workspaceName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setWorkspaceSlug(slug);
    } else {
      setWorkspaceSlug('');
    }
  }, [workspaceName]);

  const handleConnectGoogle = () => {
    setConnectingGoogle(true);
    setTimeout(() => {
      setGoogleConnected(true);
      setConnectingGoogle(false);
      // Auto-advance after successful simulated connection
      setTimeout(() => setStep(2), 800);
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
        if (workspaceName) {
          // Create workspace in Supabase
          const { data: ws, error: wsError } = await supabase
            .from('workspaces')
            .insert({
              name: workspaceName,
              slug: workspaceSlug || workspaceName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
              logo_url: workspaceLogo
            })
            .select()
            .single();
          
          if (wsError) throw wsError;
          if (ws) workspaceId = ws.id;
        }

        // Update profile schema
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            first_name: firstName,
            last_name: lastName,
            workspace_id: workspaceId,
            google_connected: googleConnected,
            onboarding_completed: true,
            tour_completed: false // triggers tour guide
          })
          .eq('id', user.id);

        if (profileError) throw profileError;
      } else {
        // Mock save to localStorage
        localStorage.setItem('first_name', firstName);
        localStorage.setItem('last_name', lastName);
        localStorage.setItem('workspace_name', workspaceName);
        localStorage.setItem('google_connected', String(googleConnected));
        localStorage.setItem('onboarding_completed', 'true');
        localStorage.setItem('tour_completed', 'false'); // triggers tour guide
      }

      router.push('/app');
    } catch (err) {
      console.error('Error during onboarding execution:', err);
      // Ensure we redirect even if DB queries fail
      router.push('/app');
    } finally {
      setLoading(false);
    }
  };

  const formattedDate = () => {
    const d = new Date();
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
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
                <Sparkles className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-extrabold tracking-tight text-zinc-900">
                Faisons connaissance 👋
              </h2>
              <p className="text-sm text-zinc-500 mt-2">
                Configurez vos informations personnelles pour commencer.
              </p>
            </div>

            {/* Form */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-xs font-bold uppercase text-zinc-400">Prénom</Label>
                  <Input 
                    id="firstName"
                    placeholder="Kael"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="border-zinc-200 focus-visible:ring-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-xs font-bold uppercase text-zinc-400">Nom</Label>
                  <Input 
                    id="lastName"
                    placeholder="Belceus"
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
                W
              </div>
              <span className="text-lg font-bold tracking-tight text-zinc-900">Wrangle</span>
            </div>

            {/* Center Content */}
            <div className="max-w-[460px] w-full mx-auto my-8">
              
              {/* STEP 1: Connect Google */}
              {step === 1 && (
                <div className="space-y-6 animate-fade-in">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-extrabold tracking-tight text-zinc-900">
                      Connectez votre compte Google
                    </h2>
                    <p className="text-sm text-zinc-500">
                      Synchronisez vos e-mails pour analyser les conversions et planifier les relances intelligemment.
                    </p>
                  </div>

                  {/* Bullet benefits */}
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Mail className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-zinc-800">Suivi des e-mails prospects</span>
                        <p className="text-[11px] text-zinc-400 mt-0.5">Scanne les réponses positives et automatise le scoring d'intérêt.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Calendar className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-zinc-800">Planification des rendez-vous</span>
                        <p className="text-[11px] text-zinc-400 mt-0.5">Insère des liens d'appel dynamiques synchronisés avec vos disponibilités.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Search className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-zinc-800">Personnalisation contextuelle</span>
                        <p className="text-[11px] text-zinc-400 mt-0.5">Adapte le contenu en fonction des interactions e-mails passées.</p>
                      </div>
                    </div>
                  </div>

                  {/* Security shield box */}
                  <div className="flex items-start gap-3 p-4 rounded-xl border border-zinc-100 bg-zinc-50/50">
                    <Shield className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-bold text-zinc-800">Vos données sont sécurisées</span>
                      <p className="text-[11px] text-zinc-400 mt-0.5">Wrangle utilise uniquement les permissions minimales requises. Aucun e-mail n'est partagé ou vendu.</p>
                    </div>
                  </div>

                  {/* Google sync buttons */}
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
                      onClick={handleConnectGoogle}
                      disabled={connectingGoogle || googleConnected}
                      className={`flex-1 font-bold h-11 text-xs gap-2 ${
                        googleConnected 
                          ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border border-emerald-200' 
                          : 'bg-primary text-white hover:bg-primary/95'
                      }`}
                    >
                      {connectingGoogle ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Connexion...
                        </>
                      ) : googleConnected ? (
                        <>
                          <Check className="h-4 w-4 text-emerald-600" />
                          Google Synchronisé
                        </>
                      ) : (
                        <>
                          Synchroniser Google Account
                        </>
                      )}
                    </Button>

                    {!googleConnected && (
                      <Button
                        variant="ghost"
                        onClick={() => setStep(2)}
                        className="text-zinc-400 hover:text-zinc-600 h-11 text-xs px-3"
                      >
                        Passer
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 2: Join or Create Workspace */}
              {step === 2 && (
                <div className="space-y-6 animate-fade-in">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-extrabold tracking-tight text-zinc-900">
                      Configuration du Workspace
                    </h2>
                    <p className="text-sm text-zinc-500">
                      Rejoignez un espace existant créé par votre équipe ou lancez une nouvelle organisation.
                    </p>
                  </div>

                  {/* Option 1: Join workspace */}
                  <div className="p-4 rounded-xl border border-zinc-200 bg-zinc-50/50 flex flex-col gap-1">
                    <span className="text-xs font-bold text-zinc-800">Rejoindre un espace existant</span>
                    <p className="text-[11px] text-zinc-400">Demandez à un coéquipier de vous envoyer une invitation depuis les paramètres.</p>
                  </div>

                  {/* Separator */}
                  <div className="relative flex py-2 items-center">
                    <div className="flex-grow border-t border-zinc-200"></div>
                    <span className="flex-shrink mx-4 text-xs font-bold text-zinc-400">OU</span>
                    <div className="flex-grow border-t border-zinc-200"></div>
                  </div>

                  {/* Option 2: Create new card */}
                  <button
                    onClick={handleNextStep}
                    className="w-full text-left p-5 rounded-xl border border-primary bg-primary/5 hover:bg-primary/10 transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-lg bg-primary text-white flex items-center justify-center shrink-0">
                        <Building2 className="h-5 w-5" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-primary">Créer une nouvelle organisation</span>
                        <p className="text-[11px] text-zinc-500 mt-0.5">Configurer un espace de travail dédié pour vous et vos collègues.</p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-primary transition-transform group-hover:translate-x-1" />
                  </button>

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
                  </div>
                </div>
              )}

              {/* STEP 3: Create Workspace name & slug */}
              {step === 3 && (
                <div className="space-y-6 animate-fade-in">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-extrabold tracking-tight text-zinc-900">
                      Configurez votre espace
                    </h2>
                    <p className="text-sm text-zinc-500">
                      Donnez un nom et définissez l'adresse de votre espace de travail.
                    </p>
                  </div>

                  {/* Logo uploader */}
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-xl border-2 border-dashed border-zinc-300 bg-zinc-50 flex flex-col items-center justify-center shrink-0 text-zinc-400 hover:border-primary hover:text-primary cursor-pointer transition-all">
                      <Upload className="h-5 w-5" />
                      <span className="text-[9px] mt-1 font-bold">Upload</span>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-zinc-800">Logo de l'entreprise</span>
                      <p className="text-[10px] text-zinc-400">Format carré (1:1), 10MB maximum.</p>
                    </div>
                  </div>

                  {/* Form */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="wsName" className="text-xs font-bold uppercase text-zinc-400">Nom de l'organisation</Label>
                      <Input 
                        id="wsName"
                        placeholder="Wrangle Inc."
                        value={workspaceName}
                        onChange={(e) => setWorkspaceName(e.target.value)}
                        className="border-zinc-200 focus-visible:ring-primary"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="wsSlug" className="text-xs font-bold uppercase text-zinc-400">URL personnalisée (Slug)</Label>
                      <div className="flex rounded-md shadow-sm">
                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-zinc-200 bg-zinc-50 text-zinc-400 text-xs select-none">
                          wrangle.ai/
                        </span>
                        <Input 
                          id="wsSlug"
                          placeholder="wrangle-inc"
                          value={workspaceSlug}
                          onChange={(e) => setWorkspaceSlug(e.target.value)}
                          className="rounded-l-none border-zinc-200 focus-visible:ring-primary flex-1"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 flex items-center gap-3">
                    <Button 
                      variant="outline"
                      onClick={() => setStep(2)}
                      className="border-zinc-200 h-11 text-xs px-4"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Retour
                    </Button>

                    <Button
                      onClick={handleNextStep}
                      disabled={!workspaceName}
                      className="flex-1 bg-primary text-white hover:bg-primary/95 font-bold h-11 text-xs"
                    >
                      Continuer
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* STEP 4: Invite Teammates */}
              {step === 4 && (
                <div className="space-y-6 animate-fade-in">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-extrabold tracking-tight text-zinc-900">
                      Invitez vos collaborateurs
                    </h2>
                    <p className="text-sm text-zinc-500">
                      Entrez les e-mails de vos coéquipiers pour qu'ils puissent collaborer dans cet espace.
                    </p>
                  </div>

                  {/* Form */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="emails" className="text-xs font-bold uppercase text-zinc-400">Adresses E-mail (Séparez par des virgules)</Label>
                      <textarea
                        id="emails"
                        placeholder="coeq1@entreprise.com, coeq2@entreprise.com"
                        value={teammates}
                        onChange={(e) => setTeammates(e.target.value)}
                        rows={3}
                        className="flex w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 dark:border-zinc-800 dark:bg-zinc-950"
                      />
                    </div>

                    {/* Auto Domain Join switch */}
                    <div className="flex items-center justify-between p-4 rounded-xl border border-zinc-100 bg-zinc-50/50">
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-zinc-800">Autoriser l'accès par domaine</span>
                        <p className="text-[10px] text-zinc-400">
                          Permettre à toute personne ayant un e-mail @{email.split('@')[1] || 'entreprise.com'} de rejoindre automatiquement.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setAllowDomainJoin(!allowDomainJoin)}
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          allowDomainJoin ? 'bg-primary' : 'bg-zinc-200'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            allowDomainJoin ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
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
                          Finaliser et Rejoindre
                          <Check className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>

                    <Button
                      variant="ghost"
                      onClick={handleComplete}
                      disabled={loading}
                      className="text-zinc-400 hover:text-zinc-600 h-11 text-xs px-3"
                    >
                      Passer
                    </Button>
                  </div>
                </div>
              )}

            </div>

            {/* Footer */}
            <div className="text-[10px] text-zinc-400 text-center">
              Wrangle &copy; {new Date().getFullYear()} &middot; Privacy &amp; Terms
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
                  {firstName && lastName ? `${firstName[0]}${lastName[0]}`.toUpperCase() : 'KB'}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-bold text-zinc-800 truncate block">
                    {firstName && lastName ? `${firstName} ${lastName}` : 'Kael Belceus'}
                  </span>
                  <span className="text-[10px] text-zinc-400 truncate block">
                    {workspaceName ? workspaceName : 'Wrangle'}
                  </span>
                </div>
              </div>

              {/* Status checklist */}
              <div className="py-4 space-y-4">
                
                {/* Check 1 */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${googleConnected ? 'bg-emerald-500' : 'bg-primary animate-pulse'}`} />
                    <span className="text-xs font-bold text-zinc-700">Google Integration</span>
                  </div>
                  <span className={`text-[10px] font-bold ${
                    googleConnected ? 'text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded' : 'text-primary bg-primary/5 px-2 py-0.5 rounded'
                  }`}>
                    {googleConnected ? 'Connected' : 'Awaiting permission...'}
                  </span>
                </div>

                {/* Check 2 */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${
                      step >= 4 ? 'bg-emerald-500' : step >= 2 ? 'bg-amber-500 animate-pulse' : 'bg-zinc-300'
                    }`} />
                    <span className="text-xs font-bold text-zinc-700">Workspace Setup</span>
                  </div>
                  <span className={`text-[10px] font-bold ${
                    step >= 4 
                      ? 'text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded' 
                      : step >= 2 
                        ? 'text-amber-600 bg-amber-50 px-2 py-0.5 rounded' 
                        : 'text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded'
                  }`}>
                    {step >= 4 ? 'Completed' : step >= 2 ? 'Setting up...' : 'Not started'}
                  </span>
                </div>

                {/* Check 3 */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${
                      step === 4 && teammates ? 'bg-emerald-500' : step === 4 ? 'bg-amber-500 animate-pulse' : 'bg-zinc-300'
                    }`} />
                    <span className="text-xs font-bold text-zinc-700">Invite Teammates</span>
                  </div>
                  <span className={`text-[10px] font-bold ${
                    step === 4 && teammates
                      ? 'text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded' 
                      : step === 4 
                        ? 'text-amber-600 bg-amber-50 px-2 py-0.5 rounded' 
                        : 'text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded'
                  }`}>
                    {step === 4 && teammates ? 'Completed' : step === 4 ? 'Inviting...' : 'Not started'}
                  </span>
                </div>

              </div>

              {/* Card Footer info */}
              {workspaceSlug && (
                <div className="mt-2 pt-3 border-t border-zinc-100 text-[10px] text-zinc-400 flex items-center justify-between">
                  <span>URL Espace :</span>
                  <span className="font-mono text-zinc-600 truncate max-w-[160px]">wrangle.ai/{workspaceSlug}</span>
                </div>
              )}
            </div>

            {/* Footer logo & date */}
            <div className="flex items-center justify-between text-[10px] text-zinc-400 select-none">
              <span className="font-bold">Wrangle Portal</span>
              <span>{formattedDate()}</span>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
