'use client';

import React, { useState, useEffect } from 'react';
import { Mail, Plus, Send, RefreshCw, BarChart3, Users, LayoutTemplate, FileSpreadsheet, PlusCircle, Settings, Check, CheckCircle2, ChevronRight, Sparkles } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Card, CardContent } from '@workspace/ui/components/card';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { supabase } from '@/lib/supabase';

// TipTap Editor toolbar component
const EditorToolbar = ({ editor }: { editor: any }) => {
  if (!editor) return null;

  return (
    <div className="flex flex-wrap gap-1 border-b border-zinc-200 p-2 bg-zinc-50 rounded-t-xl select-none">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`px-2 py-1 text-xs font-bold rounded ${editor.isActive('bold') ? 'bg-zinc-200 text-zinc-950' : 'text-zinc-600 hover:bg-zinc-100'}`}
      >
        Gras
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`px-2 py-1 text-xs font-bold rounded ${editor.isActive('italic') ? 'bg-zinc-200 text-zinc-950' : 'text-zinc-600 hover:bg-zinc-100'}`}
      >
        Italique
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`px-2 py-1 text-xs font-bold rounded ${editor.isActive('heading', { level: 2 }) ? 'bg-zinc-200 text-zinc-950' : 'text-zinc-600 hover:bg-zinc-100'}`}
      >
        Titre
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setParagraph().run()}
        className={`px-2 py-1 text-xs font-bold rounded ${editor.isActive('paragraph') ? 'bg-zinc-200 text-zinc-950' : 'text-zinc-600 hover:bg-zinc-100'}`}
      >
        Texte
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().insertContent(' {{contact.FIRSTNAME}} ').run()}
        className="px-2.5 py-1 text-xs font-extrabold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded border border-emerald-200 flex items-center gap-0.5 ml-auto"
      >
        <Sparkles className="h-3 w-3" />
        <span>Prénom</span>
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().insertContent(' {{contact.COMPANY}} ').run()}
        className="px-2.5 py-1 text-xs font-extrabold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded border border-emerald-200 flex items-center gap-0.5"
      >
        <Sparkles className="h-3 w-3" />
        <span>Entreprise</span>
      </button>
    </div>
  );
};

export default function BrevoHubPage() {
  const [activeTab, setActiveTab] = useState<'campaigns' | 'lists' | 'templates' | 'stats'>('campaigns');
  
  const [connected, setConnected] = useState(false);
  const [stats, setStats] = useState<any>({
    sentCount: 12450,
    deliveredRate: 99.4,
    openRate: 42.8,
    clickRate: 8.5,
    unsubscribeRate: 0.2
  });
  
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [lists, setLists] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [segments, setSegments] = useState<any[]>([]);
  const [collections, setCollections] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showSegmentModal, setShowSegmentModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);

  // Form states
  const [campaignForm, setCampaignForm] = useState({
    name: '',
    subject: '',
    templateId: '',
    listId: '',
    scheduledAt: ''
  });

  const [exportForm, setExportForm] = useState({
    collectionId: '',
    listId: ''
  });

  const [segmentForm, setSegmentForm] = useState({
    name: '',
    minScore: '80',
    collectionId: ''
  });

  const [templateForm, setTemplateForm] = useState({
    name: '',
    subject: ''
  });

  // TipTap HTML Template Editor
  const editor = useEditor({
    extensions: [StarterKit],
    content: `<p>Bonjour {{contact.FIRSTNAME}},</p><p>J'espère que vous allez bien.</p><p>J'ai visité le site web de {{contact.COMPANY}} et je pense que nous pourrions optimiser vos pipelines de prospection...</p><p>Disponibles pour en parler ?</p><p>Cordialement,<br>L'équipe Vectra</p>`,
    editorProps: {
      attributes: {
        class: 'p-4 outline-none min-h-[240px] text-xs leading-relaxed text-zinc-800'
      }
    }
  });

  useEffect(() => {
    fetchBrevoData();
    fetchCollections();
  }, []);

  const fetchBrevoData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Stats & Connection
      const statsRes = await fetch('/api/brevo/stats');
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setConnected(statsData.connected);
        if (statsData.stats) setStats(statsData.stats);
      }

      // 2. Fetch Campaigns
      const campRes = await fetch('/api/brevo/campaigns');
      if (campRes.ok) {
        const campData = await campRes.json();
        setCampaigns(campData.campaigns || []);
      }

      // 3. Fetch Lists
      const listsRes = await fetch('/api/brevo/lists');
      if (listsRes.ok) {
        const listsData = await listsRes.json();
        setLists(listsData.lists || []);
        if (listsData.lists?.length > 0) {
          setExportForm(prev => ({ ...prev, listId: listsData.lists[0].id.toString() }));
          setCampaignForm(prev => ({ ...prev, listId: listsData.lists[0].id.toString() }));
        }
      }

      // 4. Fetch Templates
      const tempRes = await fetch('/api/brevo/templates');
      if (tempRes.ok) {
        const tempData = await tempRes.json();
        setTemplates(tempData.templates || []);
        if (tempData.templates?.length > 0) {
          setCampaignForm(prev => ({ ...prev, templateId: tempData.templates[0].id.toString() }));
        }
      }

      // 5. Fetch Segments
      const segRes = await fetch('/api/brevo/segments');
      if (segRes.ok) {
        const segData = await segRes.json();
        setSegments(segData.segments || []);
      }

    } catch (err) {
      console.error('Error fetching Brevo Hub data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCollections = async () => {
    try {
      const { data } = await supabase.from('collections').select('id, name').order('name');
      if (data && data.length > 0) {
        setCollections(data);
        setExportForm(prev => ({ ...prev, collectionId: data[0]!.id }));
        setSegmentForm(prev => ({ ...prev, collectionId: data[0]!.id }));
      }
    } catch (err) {
      console.error('Error fetching collections:', err);
    }
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/brevo/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(campaignForm)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert('Campagne créée avec succès !');
        setShowCampaignModal(false);
        setCampaignForm({ name: '', subject: '', templateId: '', listId: '', scheduledAt: '' });
        fetchBrevoData();
      } else {
        alert(data.error || 'Erreur lors de la création de la campagne.');
      }
    } catch (err: any) {
      alert(err.message || 'Erreur réseau.');
    }
  };

  const handleExportContacts = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/brevo/lists/add-contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(exportForm)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert(`Exportation complétée ! ${data.count} prospects ajoutés.`);
        setShowExportModal(false);
        fetchBrevoData();
      } else {
        alert(data.error || 'Erreur lors de l\'exportation.');
      }
    } catch (err: any) {
      alert(err.message || 'Erreur réseau.');
    }
  };

  const handleCreateSegment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/brevo/segments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: segmentForm.name,
          filterOpts: { minScore: segmentForm.minScore, collectionId: segmentForm.collectionId }
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert('Segment créé dans Brevo !');
        setShowSegmentModal(false);
        setSegmentForm({ name: '', minScore: '80', collectionId: collections[0]?.id || '' });
        fetchBrevoData();
      } else {
        alert(data.error || 'Erreur de création du segment.');
      }
    } catch (err: any) {
      alert(err.message || 'Erreur réseau.');
    }
  };

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editor) return;

    try {
      const res = await fetch('/api/brevo/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: templateForm.name,
          subject: templateForm.subject,
          htmlContent: editor.getHTML()
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert('Template enregistré avec succès !');
        setShowTemplateModal(false);
        setTemplateForm({ name: '', subject: '' });
        fetchBrevoData();
      } else {
        alert(data.error || 'Erreur de création du template.');
      }
    } catch (err: any) {
      alert(err.message || 'Erreur réseau.');
    }
  };

  return (
    <div className="flex-grow flex flex-col h-full bg-zinc-50 overflow-hidden font-sans">
      {/* Header */}
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-zinc-200 bg-white px-6">
        <div>
          <h2 className="text-sm font-bold text-zinc-950 flex items-center gap-1.5 select-none">
            <Mail className="h-4 w-4 text-primary" />
            <span>Email Marketing (Brevo)</span>
          </h2>
        </div>

        {/* Global Connection Badge */}
        <div className="flex items-center gap-2 select-none">
          {!connected && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold">
              Mode Démo Actif
            </span>
          )}
          <a href="/app/settings/brevo" className="p-2 text-zinc-450 hover:text-zinc-800 rounded-lg hover:bg-zinc-50 transition-colors">
            <Settings className="h-4 w-4" />
          </a>
        </div>
      </header>

      {/* Tabs list */}
      <div className="bg-white border-b border-zinc-200 px-6 shrink-0 flex items-center gap-6 text-xs font-bold text-zinc-500 select-none">
        {[
          { id: 'campaigns', label: 'Campagnes', icon: Send },
          { id: 'lists', label: 'Listes & Segments', icon: Users },
          { id: 'templates', label: 'Templates', icon: LayoutTemplate },
          { id: 'stats', label: 'Statistiques', icon: BarChart3 }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-1.5 py-4 border-b-2 transition-all ${
              activeTab === tab.id
                ? 'border-primary text-zinc-950 font-extrabold'
                : 'border-transparent hover:text-zinc-800'
            }`}
          >
            <tab.icon className="h-3.5 w-3.5" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {loading ? (
          <div className="h-full flex items-center justify-center text-xs font-bold text-zinc-400">
            Chargement des données...
          </div>
        ) : (
          <>
            {/* 1. Campaigns TAB */}
            {activeTab === 'campaigns' && (
              <div className="space-y-6 select-none">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <h3 className="font-extrabold text-sm text-zinc-900">Campagnes de prospection</h3>
                    <p className="text-xs text-zinc-400 font-medium">Gérez et planifiez vos envois de courriels massifs.</p>
                  </div>
                  <Button
                    onClick={() => setShowCampaignModal(true)}
                    className="h-9 text-xs font-bold bg-zinc-900 hover:bg-zinc-800 text-white flex items-center gap-1"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Nouvelle Campagne</span>
                  </Button>
                </div>

                <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden divide-y divide-zinc-150">
                  {campaigns.length === 0 ? (
                    <div className="p-8 text-center text-xs text-zinc-400 font-bold">
                      Aucune campagne active. Créez-en une pour démarrer votre prospection.
                    </div>
                  ) : (
                    campaigns.map((camp) => (
                      <div key={camp.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-zinc-50/20 transition-all gap-4">
                        <div className="space-y-1">
                          <span className="font-extrabold text-xs text-zinc-850 block">{camp.name}</span>
                          <div className="flex items-center gap-3 text-[10px] text-zinc-400 font-semibold">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold capitalize ${
                              camp.status === 'sent' ? 'bg-emerald-50 text-emerald-700 border border-emerald-250' : 'bg-amber-50 text-amber-700 border border-amber-250'
                            }`}>
                              {camp.status}
                            </span>
                            <span>{camp.date}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-6 text-center">
                          <div className="space-y-0.5">
                            <span className="text-xs font-extrabold text-zinc-800">{camp.sent}</span>
                            <span className="text-[9px] text-zinc-400 font-bold block uppercase tracking-wider">Envoyés</span>
                          </div>
                          <div className="space-y-0.5">
                            <span className="text-xs font-extrabold text-emerald-600">{camp.openRate}%</span>
                            <span className="text-[9px] text-zinc-400 font-bold block uppercase tracking-wider">Ouverture</span>
                          </div>
                          <div className="space-y-0.5">
                            <span className="text-xs font-extrabold text-primary">{camp.clickRate}%</span>
                            <span className="text-[9px] text-zinc-400 font-bold block uppercase tracking-wider">Clics</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* 2. Lists & Segments TAB */}
            {activeTab === 'lists' && (
              <div className="space-y-8 select-none">
                {/* Lists Card */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <h3 className="font-extrabold text-sm text-zinc-900">Listes de diffusion</h3>
                      <p className="text-xs text-zinc-400 font-medium font-semibold">Vos listes de contacts actives dans Brevo.</p>
                    </div>
                    <Button
                      onClick={() => setShowExportModal(true)}
                      className="h-9 text-xs font-bold bg-zinc-900 hover:bg-zinc-800 text-white flex items-center gap-1"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Exporter leads vers Brevo</span>
                    </Button>
                  </div>

                  <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden divide-y divide-zinc-150">
                    {lists.length === 0 ? (
                      <div className="p-6 text-center text-xs text-zinc-400 font-bold">Aucune liste trouvée.</div>
                    ) : (
                      lists.map((l) => (
                        <div key={l.id} className="flex items-center justify-between p-4 bg-white hover:bg-zinc-55/10 transition-colors">
                          <div>
                            <span className="font-extrabold text-xs text-zinc-850 block">{l.name}</span>
                            <span className="text-[10px] text-zinc-400 font-bold">ID: {l.id} • {l.totalSubscribers} abonnés</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Segments Card */}
                <div className="space-y-4 pt-4 border-t border-zinc-200">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <h3 className="font-extrabold text-sm text-zinc-900">Segments dynamiques</h3>
                      <p className="text-xs text-zinc-400 font-medium">Filtrez vos prospects sur des critères personnalisés.</p>
                    </div>
                    <Button
                      onClick={() => setShowSegmentModal(true)}
                      className="h-9 text-xs font-bold border-zinc-200 text-zinc-700 bg-white hover:bg-zinc-50 flex items-center gap-1"
                    >
                      <PlusCircle className="h-3.5 w-3.5 text-zinc-500" />
                      <span>Créer un segment depuis Vectra</span>
                    </Button>
                  </div>

                  <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden divide-y divide-zinc-150">
                    {segments.length === 0 ? (
                      <div className="p-6 text-center text-xs text-zinc-400 font-bold">Aucun segment configuré.</div>
                    ) : (
                      segments.map((s) => (
                        <div key={s.id} className="flex items-center justify-between p-4 bg-white hover:bg-zinc-55/10 transition-colors">
                          <div>
                            <span className="font-extrabold text-xs text-zinc-850 block">{s.name}</span>
                            <span className="text-[10px] text-zinc-400 font-bold">{s.count} profils correspondants</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 3. Templates TAB */}
            {activeTab === 'templates' && (
              <div className="space-y-6 select-none">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <h3 className="font-extrabold text-sm text-zinc-900">Templates HTML</h3>
                    <p className="text-xs text-zinc-400 font-medium">Modèles d'emails transactionnels et marketing.</p>
                  </div>
                  <Button
                    onClick={() => setShowTemplateModal(true)}
                    className="h-9 text-xs font-bold bg-zinc-900 hover:bg-zinc-800 text-white flex items-center gap-1"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Nouveau Template</span>
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {templates.length === 0 ? (
                    <div className="col-span-full p-8 text-center text-xs text-zinc-400 font-bold">
                      Aucun modèle d'email enregistré.
                    </div>
                  ) : (
                    templates.map((temp) => (
                      <div key={temp.id} className="border border-zinc-200 rounded-2xl bg-white p-5 space-y-4 hover:shadow-md transition-all flex flex-col justify-between">
                        <div className="space-y-2">
                          <div className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-150 text-zinc-650 h-10 w-10 flex items-center justify-center">
                            <LayoutTemplate className="h-4 w-4" />
                          </div>
                          <span className="font-extrabold text-xs text-zinc-900 block truncate">{temp.name}</span>
                          <p className="text-[10px] text-zinc-450 font-bold leading-relaxed truncate">Sujet : {temp.subject}</p>
                        </div>

                        <div className="pt-4 border-t border-zinc-100 flex justify-between items-center text-[10px] text-zinc-400 font-bold select-none">
                          <span>ID: {temp.id}</span>
                          <button
                            onClick={() => {
                              alert("Visualisation en cours...\nLe template est enregistré dans votre compte.");
                            }}
                            className="text-primary hover:underline flex items-center gap-0.5"
                          >
                            <span>Voir l'aperçu</span>
                            <ChevronRight className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* 4. Statistics TAB */}
            {activeTab === 'stats' && (
              <div className="space-y-8 select-none">
                {/* Stats grid KPI */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { label: 'Mails envoyés', val: stats.sentCount, rate: null },
                    { label: "Délivrabilité", val: `${stats.deliveredRate}%`, rate: 'Excellent' },
                    { label: "Taux d'ouverture", val: `${stats.openRate}%`, rate: 'Moyenne sectorielle: 22%' },
                    { label: "Taux de clics", val: `${stats.clickRate}%`, rate: 'Moyenne sectorielle: 2.5%' }
                  ].map((kpi, idx) => (
                    <Card key={idx} className="border-zinc-200 shadow-sm rounded-2xl bg-white overflow-hidden">
                      <CardContent className="p-6 space-y-2">
                        <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{kpi.label}</h4>
                        <span className="text-xl font-black text-zinc-950 block">{kpi.val}</span>
                        {kpi.rate && (
                          <span className="text-[9px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded-full select-none">
                            {kpi.rate}
                          </span>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Recents */}
                <div className="space-y-4">
                  <h3 className="font-extrabold text-sm text-zinc-900">Activité récente des campagnes</h3>
                  <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden divide-y divide-zinc-100">
                    {campaigns.slice(0, 3).map((c) => (
                      <div key={c.id} className="flex justify-between items-center p-4 hover:bg-zinc-50/20 text-xs">
                        <div>
                          <span className="font-bold text-zinc-800 block">{c.name}</span>
                          <span className="text-[10px] text-zinc-400">Date d'envoi : {c.date}</span>
                        </div>
                        <span className="font-extrabold text-emerald-600">Ouvertures : {c.opens} ({c.openRate}%)</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Campaign Composition Modal */}
      {showCampaignModal && (
        <div className="fixed inset-0 z-50 bg-zinc-950/60 flex items-center justify-center p-4 select-none">
          <form onSubmit={handleCreateCampaign} className="bg-white border border-zinc-200 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <h3 className="font-black text-sm text-zinc-950">Nouvelle Campagne</h3>
            
            <div className="space-y-3 text-xs font-bold text-zinc-500">
              <div className="space-y-1">
                <label>Nom de la campagne</label>
                <Input
                  value={campaignForm.name}
                  onChange={(e) => setCampaignForm({ ...campaignForm, name: e.target.value })}
                  placeholder="Ex: SaaS Launch Promotion"
                  required
                />
              </div>

              <div className="space-y-1">
                <label>Objet du message</label>
                <Input
                  value={campaignForm.subject}
                  onChange={(e) => setCampaignForm({ ...campaignForm, subject: e.target.value })}
                  placeholder="Ex: Découvrez le futur du SaaS B2B"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label>Template</label>
                  <select
                    value={campaignForm.templateId}
                    onChange={(e) => setCampaignForm({ ...campaignForm, templateId: e.target.value })}
                    className="w-full border border-zinc-200 rounded-lg p-2 bg-white font-bold"
                    required
                  >
                    {templates.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label>Mailing List cible</label>
                  <select
                    value={campaignForm.listId}
                    onChange={(e) => setCampaignForm({ ...campaignForm, listId: e.target.value })}
                    className="w-full border border-zinc-200 rounded-lg p-2 bg-white font-bold"
                    required
                  >
                    {lists.map(l => (
                      <option key={l.id} value={l.id}>{l.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label>Planifier (Optionnel)</label>
                <Input
                  type="datetime-local"
                  value={campaignForm.scheduledAt}
                  onChange={(e) => setCampaignForm({ ...campaignForm, scheduledAt: e.target.value })}
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <Button type="submit" className="h-9 text-xs font-bold bg-zinc-900 hover:bg-zinc-800 text-white">
                Planifier l'envoi
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCampaignModal(false)}
                className="h-9 text-xs font-bold border-zinc-200 hover:bg-zinc-50"
              >
                Annuler
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Export contacts modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 bg-zinc-950/60 flex items-center justify-center p-4 select-none">
          <form onSubmit={handleExportContacts} className="bg-white border border-zinc-200 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <h3 className="font-black text-sm text-zinc-950">Exporter leads vers Brevo</h3>
            
            <div className="space-y-3 text-xs font-bold text-zinc-500">
              <div className="space-y-1">
                <label>Choisir la collection Vectra</label>
                <select
                  value={exportForm.collectionId}
                  onChange={(e) => setExportForm({ ...exportForm, collectionId: e.target.value })}
                  className="w-full border border-zinc-200 rounded-lg p-2.5 bg-white font-bold"
                  required
                >
                  {collections.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label>Mailing List Brevo cible</label>
                <select
                  value={exportForm.listId}
                  onChange={(e) => setExportForm({ ...exportForm, listId: e.target.value })}
                  className="w-full border border-zinc-200 rounded-lg p-2.5 bg-white font-bold"
                  required
                >
                  {lists.map(l => (
                    <option key={l.id} value={l.id}>{l.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <Button type="submit" className="h-9 text-xs font-bold bg-zinc-900 hover:bg-zinc-800 text-white">
                Exporter
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowExportModal(false)}
                className="h-9 text-xs font-bold border-zinc-200 hover:bg-zinc-50"
              >
                Annuler
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Segment modal */}
      {showSegmentModal && (
        <div className="fixed inset-0 z-50 bg-zinc-950/60 flex items-center justify-center p-4 select-none">
          <form onSubmit={handleCreateSegment} className="bg-white border border-zinc-200 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <h3 className="font-black text-sm text-zinc-950">Créer un segment personnalisé</h3>
            
            <div className="space-y-3 text-xs font-bold text-zinc-500">
              <div className="space-y-1">
                <label>Nom du segment</label>
                <Input
                  value={segmentForm.name}
                  onChange={(e) => setSegmentForm({ ...segmentForm, name: e.target.value })}
                  placeholder="Ex: Startups à fort score"
                  required
                />
              </div>

              <div className="space-y-1">
                <label>Vectra Collection</label>
                <select
                  value={segmentForm.collectionId}
                  onChange={(e) => setSegmentForm({ ...segmentForm, collectionId: e.target.value })}
                  className="w-full border border-zinc-200 rounded-lg p-2 bg-white font-bold"
                  required
                >
                  {collections.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label>Score d'adéquation minimum ({segmentForm.minScore}%)</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={segmentForm.minScore}
                  onChange={(e) => setSegmentForm({ ...segmentForm, minScore: e.target.value })}
                  className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <Button type="submit" className="h-9 text-xs font-bold bg-zinc-900 hover:bg-zinc-800 text-white">
                Générer le segment
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowSegmentModal(false)}
                className="h-9 text-xs font-bold border-zinc-200 hover:bg-zinc-50"
              >
                Annuler
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Templates composer modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 z-50 bg-zinc-950/60 flex items-center justify-center p-4">
          <form onSubmit={handleCreateTemplate} className="bg-white border border-zinc-200 rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200 select-none">
            <h3 className="font-black text-sm text-zinc-950">Nouveau modèle d'email</h3>
            
            <div className="space-y-3 text-xs font-bold text-zinc-500">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label>Nom du template</label>
                  <Input
                    value={templateForm.name}
                    onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                    placeholder="Ex: SaaS Pitch - Tech"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label>Objet du mail</label>
                  <Input
                    value={templateForm.subject}
                    onChange={(e) => setTemplateForm({ ...templateForm, subject: e.target.value })}
                    placeholder="Ex: Optimize your sales pipelines"
                    required
                  />
                </div>
              </div>

              {/* Tiptap WYSIWYG Composer wrapper */}
              <div className="space-y-1">
                <label>Contenu de l'email</label>
                <div className="border border-zinc-200 rounded-xl overflow-hidden focus-within:border-primary/50 transition-all bg-white mt-1">
                  <EditorToolbar editor={editor} />
                  <EditorContent editor={editor} className="bg-white" />
                </div>
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <Button type="submit" className="h-9 text-xs font-bold bg-zinc-900 hover:bg-zinc-800 text-white">
                Enregistrer le template
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowTemplateModal(false)}
                className="h-9 text-xs font-bold border-zinc-200 hover:bg-zinc-50"
              >
                Annuler
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
