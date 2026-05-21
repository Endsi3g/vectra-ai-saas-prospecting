'use client';

import React, { useState, useEffect } from 'react';
import { Mail, Shield, Check, RefreshCw, AlertTriangle, Key, User, Settings, FolderClosed } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { supabase } from '@/lib/supabase';

interface BrevoList {
  id: number;
  name: string;
  totalSubscribers: number;
}

export default function BrevoSettingsPage() {
  const [apiKey, setApiKey] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [senderName, setSenderName] = useState('');
  const [savedApiKey, setSavedApiKey] = useState<string | null>(null);

  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);
  const [testError, setTestError] = useState('');
  
  const [lists, setLists] = useState<BrevoList[]>([]);
  const [listsLoading, setListsLoading] = useState(false);
  
  // Collections list for sync
  const [collections, setCollections] = useState<{ id: string; name: string }[]>([]);
  const [selectedCollectionId, setSelectedCollectionId] = useState('');
  const [syncingListId, setSyncingListId] = useState<number | null>(null);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
    loadCollections();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('brevo_api_key, brevo_sender_email, brevo_sender_name')
        .eq('id', user.id)
        .single();

      if (profile) {
        setSenderEmail(profile.brevo_sender_email || '');
        setSenderName(profile.brevo_sender_name || '');
        if (profile.brevo_api_key) {
          setSavedApiKey(profile.brevo_api_key);
          setApiKey('••••••••••••••••••••••••••••••••');
          fetchLists(); // Fetch Brevo lists since key exists
        }
      }
    } catch (err) {
      console.error('Error loading Brevo settings:', err);
    }
  };

  const loadCollections = async () => {
    try {
      const { data } = await supabase
        .from('collections')
        .select('id, name')
        .order('name');
      
      if (data && data.length > 0) {
        setCollections(data);
        setSelectedCollectionId(data[0]!.id);
      }
    } catch (err) {
      console.error('Error loading collections:', err);
    }
  };

  const fetchLists = async () => {
    setListsLoading(true);
    try {
      const response = await fetch('/api/brevo/lists');
      if (response.ok) {
        const data = await response.json();
        setLists(data.lists || []);
      }
    } catch (err) {
      console.error('Error fetching Brevo lists:', err);
    } finally {
      setListsLoading(false);
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setTesting(true);
    setTestResult(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const updates: any = {
        brevo_sender_email: senderEmail,
        brevo_sender_name: senderName
      };

      // Only update key if modified from masks
      if (apiKey && apiKey !== '••••••••••••••••••••••••••••••••') {
        updates.brevo_api_key = apiKey;
      }

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;

      alert('Configuration de Brevo enregistrée avec succès.');
      setSavedApiKey(apiKey === '••••••••••••••••••••••••••••••••' ? savedApiKey : apiKey);
      if (apiKey && apiKey !== '••••••••••••••••••••••••••••••••') {
        setApiKey('••••••••••••••••••••••••••••••••');
      }
      fetchLists();
    } catch (err: any) {
      alert(`Erreur d'enregistrement: ${err.message}`);
    } finally {
      setTesting(false);
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    setTestError('');

    try {
      const response = await fetch('/api/brevo/stats');
      const data = await response.json();

      if (response.ok && data.connected) {
        setTestResult('success');
      } else {
        setTestResult('error');
        setTestError(data.error || 'Connexion refusée. Vérifiez vos identifiants.');
      }
    } catch (err: any) {
      setTestResult('error');
      setTestError(err.message || 'Erreur réseau lors de la tentative de connexion.');
    } finally {
      setTesting(false);
    }
  };

  const handleSyncLeads = async (listId: number) => {
    if (!selectedCollectionId) {
      alert('Veuillez sélectionner une collection à synchroniser.');
      return;
    }

    setSyncingListId(listId);
    setSyncStatus('Synchronisation en cours...');

    try {
      const response = await fetch('/api/brevo/lists/add-contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          collectionId: selectedCollectionId,
          listId: listId.toString()
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSyncStatus(`Succès ! ${data.count} leads synchronisés.`);
        setTimeout(() => {
          setSyncingListId(null);
          setSyncStatus(null);
          fetchLists(); // Refresh counts
        }, 3000);
      } else {
        alert(data.error || 'Erreur lors de la synchronisation.');
        setSyncingListId(null);
        setSyncStatus(null);
      }
    } catch (err: any) {
      alert(err.message || 'Erreur réseau.');
      setSyncingListId(null);
      setSyncStatus(null);
    }
  };

  return (
    <div className="p-10 bg-white min-h-screen">
      <div className="max-w-4xl space-y-8 select-none">
        <div>
          <h1 className="text-2xl font-extrabold text-zinc-900 tracking-tight">Intégration Brevo (Sendinblue)</h1>
          <p className="text-sm text-zinc-400 font-medium mt-1">
            Connectez votre compte Brevo pour envoyer des campagnes de courriels B2B et synchroniser vos listes de diffusion.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Connection Details Form */}
          <div className="lg:col-span-2 space-y-6">
            <div className="border border-zinc-200 rounded-2xl p-6 bg-white space-y-6">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                  <Mail className="h-4 w-4" />
                </span>
                <h3 className="font-extrabold text-sm text-zinc-900">Paramètres de Connexion</h3>
              </div>

              <form onSubmit={handleSaveConfig} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-500 flex items-center gap-1">
                    <Key className="h-3 w-3" />
                    <span>Clé API v3 de Brevo</span>
                  </label>
                  <Input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="xkeysib-..."
                    className="text-xs h-10 bg-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-500 flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      <span>Email Expéditeur</span>
                    </label>
                    <Input
                      type="email"
                      value={senderEmail}
                      onChange={(e) => setSenderEmail(e.target.value)}
                      placeholder="nom@entreprise.com"
                      className="text-xs h-10 bg-white"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-500 flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <span>Nom Expéditeur</span>
                    </label>
                    <Input
                      type="text"
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      placeholder="Ex: Jean de Vectra"
                      className="text-xs h-10 bg-white"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <Button type="submit" disabled={testing} className="h-10 text-xs font-bold bg-zinc-900 hover:bg-zinc-800 text-white">
                    {testing ? 'Enregistrement...' : 'Enregistrer'}
                  </Button>
                  
                  {savedApiKey && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleTestConnection}
                      disabled={testing}
                      className="h-10 text-xs font-bold border-zinc-200 hover:bg-zinc-50 flex items-center gap-1"
                    >
                      <RefreshCw className={`h-3.5 w-3.5 ${testing ? 'animate-spin' : ''}`} />
                      <span>Tester la connexion</span>
                    </Button>
                  )}
                </div>
              </form>
            </div>

            {/* Sync Leads Section */}
            {savedApiKey && (
              <div className="border border-zinc-200 rounded-2xl p-6 bg-white space-y-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-zinc-150 text-zinc-650">
                      <FolderClosed className="h-4 w-4" />
                    </span>
                    <h3 className="font-extrabold text-sm text-zinc-900">Synchroniser vos prospects</h3>
                  </div>

                  {collections.length > 0 && (
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-zinc-400 font-bold">Source :</span>
                      <select
                        value={selectedCollectionId}
                        onChange={(e) => setSelectedCollectionId(e.target.value)}
                        className="border border-zinc-250 rounded-lg p-1.5 text-xs font-bold text-zinc-700 bg-white"
                      >
                        {collections.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Lists Grid */}
                <div className="border border-zinc-150 rounded-xl overflow-hidden divide-y divide-zinc-100">
                  {listsLoading ? (
                    <div className="p-6 text-center text-xs text-zinc-400 font-bold">Chargement des listes Brevo...</div>
                  ) : lists.length === 0 ? (
                    <div className="p-6 text-center text-xs text-zinc-400 font-bold">Aucune liste trouvée sur votre compte Brevo.</div>
                  ) : (
                    lists.map((list) => (
                      <div key={list.id} className="flex items-center justify-between p-4 bg-white hover:bg-zinc-55/30 transition-colors">
                        <div>
                          <span className="font-extrabold text-xs text-zinc-850 block">{list.name}</span>
                          <span className="text-[10px] text-zinc-400 font-bold">ID: {list.id} • {list.totalSubscribers} abonnés</span>
                        </div>
                        <Button
                          size="sm"
                          disabled={syncingListId === list.id}
                          onClick={() => handleSyncLeads(list.id)}
                          className="h-8 text-xs font-bold bg-zinc-900 hover:bg-zinc-850 text-white"
                        >
                          {syncingListId === list.id ? (
                            <span className="flex items-center gap-1 text-[10px]">
                              <RefreshCw className="h-3 w-3 animate-spin" />
                              <span>{syncStatus}</span>
                            </span>
                          ) : (
                            <span>Pousser les leads</span>
                          )}
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Connection Status panel */}
          <div className="space-y-6">
            <div className="border border-zinc-200 rounded-2xl p-6 bg-zinc-50/50 space-y-4">
              <h3 className="font-extrabold text-xs text-zinc-450 uppercase tracking-wider">État du Service</h3>
              
              <div className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${savedApiKey ? 'bg-emerald-500 animate-pulse' : 'bg-red-400'}`} />
                <span className="text-xs font-extrabold text-zinc-800">
                  {savedApiKey ? 'Intégration Active' : 'Non Connectée'}
                </span>
              </div>

              {testResult === 'success' && (
                <div className="flex items-start gap-2 bg-emerald-50 text-emerald-800 border border-emerald-100 p-3.5 rounded-xl text-xs font-bold animate-in fade-in duration-300">
                  <Check className="h-4 w-4 shrink-0 text-emerald-600" />
                  <span>Connexion établie avec succès ! Vos campagnes Brevo sont prêtes à être déployées.</span>
                </div>
              )}

              {testResult === 'error' && (
                <div className="flex items-start gap-2 bg-red-50 text-red-800 border border-red-100 p-3.5 rounded-xl text-xs font-bold animate-in fade-in duration-300">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-red-600" />
                  <div>
                    <span className="block font-bold">Erreur de connexion</span>
                    <span className="font-medium text-[10px] block mt-0.5">{testError}</span>
                  </div>
                </div>
              )}

              <p className="text-[11px] text-zinc-400 font-semibold leading-relaxed">
                Brevo est synchronisé au niveau de l'espace de travail. Tous les collaborateurs de cet espace partagent la clé API et les templates marketing configurés ici.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
