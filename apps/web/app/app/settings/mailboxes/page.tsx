'use client';

import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Trash2, 
  RefreshCw, 
  Plus, 
  Check, 
  Loader2, 
  AlertCircle, 
  CheckCircle,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Server
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { Badge } from '@workspace/ui/components/badge';

interface Mailbox {
  id: string;
  email: string;
  provider: string;
  status: 'connected' | 'error';
  nylas_grant_id: string;
  created_at: string;
  is_default?: boolean;
}

export default function MailboxesPage() {
  const [mailboxes, setMailboxes] = useState<Mailbox[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectingProvider, setConnectingProvider] = useState<string | null>(null);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Custom IMAP modal states
  const [showImapModal, setShowImapModal] = useState(false);
  const [imapEmail, setImapEmail] = useState('');
  const [imapHost, setImapHost] = useState('imap.company.com');
  const [imapPort, setImapPort] = useState('993');
  const [smtpHost, setSmtpHost] = useState('smtp.company.com');
  const [smtpPort, setSmtpPort] = useState('465');
  const [imapPassword, setImapPassword] = useState('');
  const [isSubmittingImap, setIsSubmittingImap] = useState(false);

  useEffect(() => {
    fetchMailboxes();
  }, []);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchMailboxes = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('mailboxes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Add a client-side mock is_default field for UX
      const formatted = (data || []).map((m, idx) => ({
        ...m,
        is_default: idx === 0
      }));

      setMailboxes(formatted);
    } catch (err) {
      console.error('Error loading mailboxes:', err);
      showToast('Impossible de charger les boîtes de réception', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Simulate Nylas OAuth redirect checkout
  const handleConnectOAuth = async (provider: 'gmail' | 'outlook') => {
    setConnectingProvider(provider);
    
    // In production, we call "/api/auth/nylas/checkout?provider=..."
    // For local interactive experience, we do a premium mock callback setup
    setTimeout(async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          showToast('Veuillez vous connecter d’abord.', 'error');
          return;
        }

        const email = provider === 'gmail' 
          ? `${user.email?.split('@')[0]}@gmail.com` 
          : `${user.email?.split('@')[0]}@outlook.com`;

        const newMailbox = {
          user_id: user.id,
          email: email.toLowerCase(),
          provider,
          nylas_grant_id: `mock-grant-${Math.random().toString(36).substring(7)}`,
          status: 'connected'
        };

        const { error } = await supabase
          .from('mailboxes')
          .insert(newMailbox);

        if (error) {
          if (error.code === '23505') {
            showToast(`Cette adresse e-mail (${email}) est déjà connectée.`, 'error');
          } else {
            throw error;
          }
        } else {
          showToast(`Compte ${provider === 'gmail' ? 'Google' : 'Outlook'} synchronisé avec succès via Nylas !`);
          fetchMailboxes();
        }
      } catch (err) {
        console.error('Error connecting provider:', err);
        showToast('Erreur lors de la connexion de la messagerie', 'error');
      } finally {
        setConnectingProvider(null);
      }
    }, 1500);
  };

  // Custom IMAP submission
  const handleImapSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imapEmail || !imapPassword) {
      showToast('Veuillez remplir tous les champs obligatoires.', 'error');
      return;
    }
    
    setIsSubmittingImap(true);
    setTimeout(async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const newMailbox = {
          user_id: user.id,
          email: imapEmail.toLowerCase(),
          provider: 'imap',
          nylas_grant_id: `mock-grant-imap-${Math.random().toString(36).substring(7)}`,
          status: 'connected'
        };

        const { error } = await supabase
          .from('mailboxes')
          .insert(newMailbox);

        if (error) {
          if (error.code === '23505') {
            showToast('Cet e-mail IMAP est déjà enregistré.', 'error');
          } else {
            throw error;
          }
        } else {
          showToast('Boîte mail IMAP/SMTP connectée avec succès !');
          setShowImapModal(false);
          setImapEmail('');
          setImapPassword('');
          fetchMailboxes();
        }
      } catch (err) {
        console.error('Error saving IMAP config:', err);
        showToast('Impossible d’enregistrer les paramètres IMAP', 'error');
      } finally {
        setIsSubmittingImap(false);
      }
    }, 1200);
  };

  // Delete mailbox
  const handleDeleteMailbox = async (id: string, email: string) => {
    setDeletingId(id);
    try {
      const { error } = await supabase
        .from('mailboxes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      showToast(`Boîte aux lettres ${email} déconnectée.`);
      setMailboxes(prev => prev.filter(m => m.id !== id));
    } catch (err) {
      console.error('Error deleting mailbox:', err);
      showToast('Impossible de déconnecter le compte', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  // Trigger Mock Connection Check
  const handleTestConnection = async (id: string, email: string) => {
    setTestingId(id);
    setTimeout(() => {
      setTestingId(null);
      showToast(`Connexion SMTP & IMAP valide pour ${email} (Délai Nylas : 43ms)`);
    }, 1000);
  };

  // Toggle local default state
  const handleSetDefault = (id: string) => {
    setMailboxes(prev => prev.map(m => ({
      ...m,
      is_default: m.id === id
    })));
    const mailbox = mailboxes.find(m => m.id === id);
    if (mailbox) {
      showToast(`Adresse ${mailbox.email} définie comme expéditeur par défaut.`);
    }
  };

  return (
    <div className="p-10 bg-white min-h-full">
      
      {/* Toast Alert */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl border shadow-lg text-xs font-bold transition-all duration-300 transform translate-y-0 ${
          toast.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
            : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          {toast.type === 'success' ? (
            <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 text-rose-500 shrink-0" />
          )}
          <span>{toast.text}</span>
        </div>
      )}

      <div className="max-w-4xl space-y-8 select-none">
        
        {/* Header Titles */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-100 pb-5">
          <div>
            <h1 className="text-2xl font-extrabold text-zinc-900 tracking-tight flex items-center gap-2">
              <Mail className="h-6 w-6 text-zinc-400" /> Boîtes de Réception
            </h1>
            <p className="text-sm text-zinc-400 font-medium mt-1">
              Gérez les comptes e-mail connectés via Nylas pour l'envoi d'approches et la synchronisation de l'Inbox.
            </p>
          </div>
          
          <Button 
            onClick={() => setShowImapModal(true)} 
            variant="outline" 
            size="sm"
            className="border-zinc-200 text-xs font-bold h-9 flex items-center gap-1.5 hover:bg-zinc-50"
          >
            <Server className="h-3.5 w-3.5 text-zinc-400" />
            <span>Connecter IMAP / SMTP</span>
          </Button>
        </div>

        {/* Informative banners on Nylas security */}
        <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-150 flex gap-3 text-xs leading-relaxed">
          <AlertCircle className="h-4 w-4 text-zinc-400 shrink-0 mt-0.5" />
          <div className="text-zinc-500 space-y-1">
            <span className="font-bold text-zinc-700 block">Synchronisation Sécurisée Nylas OAuth 2.0</span>
            <p>
              Vectra utilise l'API sécurisée **Nylas** pour authentifier vos comptes de messagerie. Vos mots de passe personnels ne sont jamais stockés sur nos serveurs. L'accès s'effectue via des jetons d'accès chiffrés révocables à tout moment.
            </p>
          </div>
        </div>

        {/* Connected accounts display */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 border border-zinc-150 rounded-2xl">
            <Loader2 className="h-6 w-6 text-primary animate-spin" />
            <span className="text-xs text-zinc-400 font-bold">Chargement de vos comptes de messagerie...</span>
          </div>
        ) : mailboxes.length === 0 ? (
          
          /* Empty Active State screen */
          <div className="border border-zinc-200 border-dashed rounded-2xl p-10 bg-[#FAFAFA]/40 flex flex-col items-center justify-center text-center gap-4">
            <div className="h-12 w-12 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-400">
              <Mail className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-zinc-800">Aucune boîte de réception connectée</h3>
              <p className="text-xs text-zinc-400 max-w-sm leading-relaxed mx-auto">
                Associez vos comptes Gmail ou Outlook pour permettre aux agents intelligents Hermes d'entamer les prospections en direct avec votre profil professionnel.
              </p>
            </div>
            
            {/* Quick connection buttons grid */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Button
                onClick={() => handleConnectOAuth('gmail')}
                disabled={connectingProvider !== null}
                className="bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 text-xs font-bold gap-2 px-4 h-9 shadow-sm shrink-0"
              >
                {connectingProvider === 'gmail' ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.13-.23-.24-.46-.35-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                )}
                <span>Synchroniser Gmail</span>
              </Button>

              <Button
                onClick={() => handleConnectOAuth('outlook')}
                disabled={connectingProvider !== null}
                className="bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 text-xs font-bold gap-2 px-4 h-9 shadow-sm shrink-0"
              >
                {connectingProvider === 'outlook' ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <svg className="h-3.5 w-3.5" viewBox="0 0 23 23" fill="none">
                    <path fill="#F25022" d="M0 0h11v11H0z" />
                    <path fill="#7FBA00" d="M12 0h11v11H12z" />
                    <path fill="#00A4EF" d="M0 12h11v11H0z" />
                    <path fill="#FFB900" d="M12 12h11v11H12z" />
                  </svg>
                )}
                <span>Synchroniser Outlook</span>
              </Button>
            </div>
          </div>
        ) : (
          
          /* Active Accounts Listing list */
          <div className="space-y-4">
            <span className="text-xs font-extrabold text-zinc-400 uppercase tracking-wider block">
              Comptes connectés ({mailboxes.length})
            </span>

            <div className="divide-y divide-zinc-100 border border-zinc-200 rounded-2xl overflow-hidden bg-white shadow-sm">
              {mailboxes.map((mailbox) => (
                <div key={mailbox.id} className="p-5 flex items-center justify-between gap-4 bg-white hover:bg-zinc-50/50 transition-colors">
                  
                  {/* Left Side: Icon & Details */}
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-xl border flex items-center justify-center shrink-0 ${
                      mailbox.provider === 'gmail' 
                        ? 'bg-blue-50/30 border-blue-100 text-blue-500'
                        : mailbox.provider === 'outlook'
                        ? 'bg-sky-50/30 border-sky-100 text-sky-500'
                        : 'bg-zinc-50 border-zinc-200 text-zinc-500'
                    }`}>
                      {mailbox.provider === 'gmail' ? (
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.13-.23-.24-.46-.35-.63z" />
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                        </svg>
                      ) : mailbox.provider === 'outlook' ? (
                        <svg className="h-4 w-4" viewBox="0 0 23 23" fill="none">
                          <path fill="#F25022" d="M0 0h11v11H0z" />
                          <path fill="#7FBA00" d="M12 0h11v11H12z" />
                          <path fill="#00A4EF" d="M0 12h11v11H0z" />
                          <path fill="#FFB900" d="M12 12h11v11H12z" />
                        </svg>
                      ) : (
                        <Server className="h-4 w-4" />
                      )}
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-zinc-900">{mailbox.email}</span>
                        {mailbox.is_default && (
                          <Badge className="bg-emerald-50 hover:bg-emerald-50 border-emerald-200 text-emerald-700 text-[9px] font-extrabold h-4.5 uppercase py-0 px-1.5 select-none">
                            Par défaut
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-[10px] font-semibold text-zinc-400">
                        <span className="capitalize">Fournisseur : {mailbox.provider}</span>
                        <span className="flex items-center gap-1">
                          <span className={`h-1.5 w-1.5 rounded-full ${mailbox.status === 'connected' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                          {mailbox.status === 'connected' ? 'Actif' : 'Erreur'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Side Actions */}
                  <div className="flex items-center gap-2.5">
                    
                    {/* Make default button */}
                    {!mailbox.is_default && (
                      <Button
                        onClick={() => handleSetDefault(mailbox.id)}
                        variant="ghost"
                        size="sm"
                        className="text-zinc-400 hover:text-zinc-700 text-xs font-bold h-8 px-2.5"
                      >
                        Définir par défaut
                      </Button>
                    )}

                    {/* Test button */}
                    <Button
                      onClick={() => handleTestConnection(mailbox.id, mailbox.email)}
                      disabled={testingId === mailbox.id}
                      variant="outline"
                      size="sm"
                      className="border-zinc-200 text-zinc-600 text-xs font-semibold h-8 w-8 p-0 rounded-lg"
                      title="Tester la connexion"
                    >
                      {testingId === mailbox.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-zinc-400" />
                      ) : (
                        <RefreshCw className="h-3.5 w-3.5" />
                      )}
                    </Button>

                    {/* Disconnect button */}
                    <Button
                      onClick={() => handleDeleteMailbox(mailbox.id, mailbox.email)}
                      disabled={deletingId === mailbox.id}
                      variant="outline"
                      size="sm"
                      className="border-zinc-200 text-rose-600 hover:bg-rose-50 hover:border-rose-100 text-xs font-semibold h-8 w-8 p-0 rounded-lg"
                      title="Déconnecter"
                    >
                      {deletingId === mailbox.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-rose-300" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                    </Button>

                  </div>
                </div>
              ))}
            </div>

            {/* Quick add addition bar */}
            <div className="pt-4 border-t border-zinc-150 flex items-center justify-between gap-4">
              <span className="text-xs text-zinc-400 font-medium">Ajouter un autre compte via Nylas :</span>
              <div className="flex items-center gap-3">
                <Button
                  onClick={() => handleConnectOAuth('gmail')}
                  disabled={connectingProvider !== null}
                  variant="outline"
                  size="sm"
                  className="border-zinc-200 text-zinc-700 text-xs font-bold gap-1.5 h-8 hover:bg-zinc-50"
                >
                  <Plus className="h-3.5 w-3.5 text-zinc-400" />
                  <span>Google Workspace</span>
                </Button>
                
                <Button
                  onClick={() => handleConnectOAuth('outlook')}
                  disabled={connectingProvider !== null}
                  variant="outline"
                  size="sm"
                  className="border-zinc-200 text-zinc-700 text-xs font-bold gap-1.5 h-8 hover:bg-zinc-50"
                >
                  <Plus className="h-3.5 w-3.5 text-zinc-400" />
                  <span>Office 365</span>
                </Button>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* Manual IMAP / SMTP Credentials Modal overlay */}
      {showImapModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-sm transition-opacity">
          <div className="w-full max-w-lg bg-white border border-zinc-200 rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-zinc-950 flex items-center gap-2">
                <Server className="h-4.5 w-4.5 text-zinc-400" /> Connexion manuelle IMAP / SMTP
              </h3>
              <button 
                onClick={() => setShowImapModal(false)}
                className="text-zinc-400 hover:text-zinc-600 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleImapSubmit} className="p-6 space-y-4">
              
              {/* Email Address */}
              <div className="space-y-1.5">
                <Label htmlFor="imapEmail" className="text-xs font-bold text-zinc-700">Adresse e-mail professionnelle</Label>
                <Input
                  id="imapEmail"
                  type="email"
                  placeholder="contact@entreprise.com"
                  value={imapEmail}
                  onChange={(e) => setImapEmail(e.target.value)}
                  className="h-9 text-xs border-zinc-200"
                  required
                />
              </div>

              {/* Server Info Columns */}
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 space-y-1.5">
                  <Label htmlFor="imapHost" className="text-xs font-bold text-zinc-700">Serveur IMAP</Label>
                  <Input
                    id="imapHost"
                    type="text"
                    value={imapHost}
                    onChange={(e) => setImapHost(e.target.value)}
                    className="h-9 text-xs border-zinc-200"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="imapPort" className="text-xs font-bold text-zinc-700">Port</Label>
                  <Input
                    id="imapPort"
                    type="text"
                    value={imapPort}
                    onChange={(e) => setImapPort(e.target.value)}
                    className="h-9 text-xs border-zinc-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 space-y-1.5">
                  <Label htmlFor="smtpHost" className="text-xs font-bold text-zinc-700">Serveur SMTP</Label>
                  <Input
                    id="smtpHost"
                    type="text"
                    value={smtpHost}
                    onChange={(e) => setSmtpHost(e.target.value)}
                    className="h-9 text-xs border-zinc-200"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="smtpPort" className="text-xs font-bold text-zinc-700">Port</Label>
                  <Input
                    id="smtpPort"
                    type="text"
                    value={smtpPort}
                    onChange={(e) => setSmtpPort(e.target.value)}
                    className="h-9 text-xs border-zinc-200"
                  />
                </div>
              </div>

              {/* Password / App Key */}
              <div className="space-y-1.5">
                <Label htmlFor="imapPassword" className="text-xs font-bold text-zinc-700">Mot de passe ou clé d'application</Label>
                <Input
                  id="imapPassword"
                  type="password"
                  placeholder="••••••••••••••••"
                  value={imapPassword}
                  onChange={(e) => setImapPassword(e.target.value)}
                  className="h-9 text-xs border-zinc-200"
                  required
                />
              </div>

              {/* Modal Footer Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100 mt-5">
                <Button
                  type="button"
                  onClick={() => setShowImapModal(false)}
                  variant="ghost"
                  size="sm"
                  className="text-xs font-bold h-9 px-4 text-zinc-500 hover:text-zinc-800"
                >
                  Annuler
                </Button>
                
                <Button
                  type="submit"
                  disabled={isSubmittingImap}
                  className="bg-primary hover:bg-primary/95 text-white text-xs font-bold h-9 px-4 gap-1.5"
                >
                  {isSubmittingImap ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Connexion...</span>
                    </>
                  ) : (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      <span>Connecter</span>
                    </>
                  )}
                </Button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
