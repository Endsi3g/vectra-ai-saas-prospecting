'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Badge } from '@workspace/ui/components/badge';
import { Card, CardContent } from '@workspace/ui/components/card';
import { 
  Globe, 
  Share2, 
  Plus, 
  Check, 
  UserPlus, 
  Copy, 
  Lock, 
  ShieldAlert, 
  Upload, 
  ChevronRight,
  Database,
  Tag,
  FolderPlus,
  Trash2,
  FolderOpen,
  Search,
  ExternalLink,
  ChevronDown,
  X,
  Download,
  MessageSquare
} from 'lucide-react';
import { 
  getCollections, 
  createCollection, 
  getLeads, 
  assignLeadToCollections,
  getFollowUps,
  getMessages,
  Collection,
  Lead
} from '@/lib/db-fallback';
import LeadCommentsDrawer from '@/components/LeadCommentsDrawer';

const LinkedinIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={props.className}
    {...props}
  >
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
  </svg>
);

function LibraryPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const collectionFilterId = searchParams ? searchParams.get('collection') : null;

  const [copied, setCopied] = useState(false);
  const [privacy, setPrivacy] = useState('link_search');
  const [inviteUrl] = useState('https://wrangle.ai/invite/network-kael-821');

  // Interactive Database States
  const [leads, setLeads] = useState<Lead[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [activeCollection, setActiveCollection] = useState<Collection | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Selection and Popover States
  const [selectedLeadIdForPopover, setSelectedLeadIdForPopover] = useState<string | null>(null);
  const [showCreateCollectionInline, setShowCreateCollectionInline] = useState(false);
  const [newColName, setNewColName] = useState('');
  const [newColDesc, setNewColDesc] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  // Comments Drawer States
  const [selectedLeadForComments, setSelectedLeadForComments] = useState<Lead | null>(null);
  const [isCommentsDrawerOpen, setIsCommentsDrawerOpen] = useState(false);

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      // 1. Fetch followups and messages in parallel
      const followUps = await getFollowUps();
      const messagesPromises = filteredLeads.map(lead => getMessages(lead.id));
      const messages = await Promise.all(messagesPromises);

      // Create maps for quick lookup
      const followUpMap = new Map(followUps.map(f => [f.leadId, f]));
      const messageMap = new Map();
      messages.forEach((msg, idx) => {
        if (msg) {
          const lead = filteredLeads[idx];
          if (lead) messageMap.set(lead.id, msg);
        }
      });

      // 2. Build CSV Headers
      const headers = [
        'name',
        'company',
        'email',
        'website',
        'notes',
        'follow_up_status',
        'follow_up_date',
        'personalization_score',
        'message_status',
        'collections'
      ];

      // Helper to escape values for CSV compatibility
      const escapeCSV = (val: any) => {
        if (val === undefined || val === null) return '';
        let str = String(val).replace(/"/g, '""');
        if (str.includes(',') || str.includes('\n') || str.includes('"')) {
          return `"${str}"`;
        }
        return str;
      };

      // 3. Build CSV Rows
      const rows = filteredLeads.map(lead => {
        const followUp = followUpMap.get(lead.id);
        const msg = messageMap.get(lead.id);

        const colNames = (lead.collections || [])
          .map(colId => collections.find(c => c.id === colId)?.name)
          .filter(Boolean)
          .join('; ');

        return [
          escapeCSV(lead.name),
          escapeCSV(lead.company),
          escapeCSV(lead.email),
          escapeCSV(lead.website),
          escapeCSV(lead.notes),
          escapeCSV(followUp?.status || 'prospect'),
          escapeCSV(followUp?.followUpDate || ''),
          escapeCSV(msg?.personalization_score || ''),
          escapeCSV(msg?.status || ''),
          escapeCSV(colNames)
        ];
      });

      // Combine headers and rows
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');

      // 4. Download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      const filename = activeCollection 
        ? `vectra_leads_${activeCollection.name.toLowerCase().replace(/\s+/g, '_')}.csv` 
        : 'vectra_leads_all.csv';
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting CSV:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const loadData = async () => {
    const allCols = await getCollections();
    setCollections(allCols);

    const allLeads = await getLeads(collectionFilterId || undefined);
    setLeads(allLeads);

    if (collectionFilterId) {
      const active = allCols.find(c => c.id === collectionFilterId);
      setActiveCollection(active || null);
    } else {
      setActiveCollection(null);
    }
  };

  useEffect(() => {
    loadData();

    // Listen to changes in layouts
    const handleCollectionsSync = () => {
      loadData();
    };

    window.addEventListener('vectra-collections-updated', handleCollectionsSync);
    return () => {
      window.removeEventListener('vectra-collections-updated', handleCollectionsSync);
    };
  }, [collectionFilterId]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleCollection = async (leadId: string, colId: string, currentCols: string[]) => {
    let newCols = [];
    if (currentCols.includes(colId)) {
      newCols = currentCols.filter(id => id !== colId);
    } else {
      newCols = [...currentCols, colId];
    }
    
    await assignLeadToCollections(leadId, newCols);
    await loadData();
    
    // Sync sidebar counts
    window.dispatchEvent(new Event('vectra-collections-updated'));
  };

  const handleInlineCreateCollection = async () => {
    if (!newColName.trim()) return;
    try {
      const created = await createCollection(newColName.trim(), newColDesc.trim());
      setNewColName('');
      setNewColDesc('');
      setShowCreateCollectionInline(false);
      
      // Refresh list
      await loadData();
      
      // Sync sidebar
      window.dispatchEvent(new Event('vectra-collections-updated'));
      
      // Automatically assign it to the active lead popover
      if (selectedLeadIdForPopover) {
        const lead = leads.find(l => l.id === selectedLeadIdForPopover);
        if (lead) {
          await handleToggleCollection(lead.id, created.id, lead.collections || []);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Filter leads by search query locally
  const filteredLeads = leads.filter(l => {
    const q = searchQuery.toLowerCase();
    return (
      l.name.toLowerCase().includes(q) ||
      l.company.toLowerCase().includes(q) ||
      (l.role && l.role.toLowerCase().includes(q)) ||
      (l.notes && l.notes.toLowerCase().includes(q))
    );
  });

  return (
    <>
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white text-zinc-950 font-sans">
      
      {/* Header */}
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-zinc-200 bg-white px-6 z-10">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-zinc-500 select-none">
          <span className="hover:text-zinc-950 cursor-pointer transition-colors" onClick={() => router.push('/app/library')}>Library</span>
          <span className="text-zinc-300 font-normal">/</span>
          {activeCollection ? (
            <>
              <span className="font-semibold text-zinc-900 truncate max-w-[240px]">
                {activeCollection.name}
              </span>
              <Badge variant="outline" className="ml-2 bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
                Collection
              </Badge>
            </>
          ) : (
            <>
              <span className="font-semibold text-zinc-900 truncate max-w-[240px]">
                Kael's Shared Network
              </span>
              <Badge variant="outline" className="ml-2 bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
                Active
              </Badge>
            </>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {activeCollection && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => router.push('/app/library')}
              className="h-8 text-xs gap-1.5 border-zinc-200 hover:bg-zinc-50"
            >
              Show all leads
            </Button>
          )}

          <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 border-zinc-200 hover:bg-zinc-50">
            <Globe className="h-3.5 w-3.5 text-zinc-500" />
            Sources
          </Button>

          <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 border-zinc-200 hover:bg-zinc-50">
            <Share2 className="h-3.5 w-3.5 text-zinc-500" />
            Share
          </Button>

          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleExportCSV} 
            disabled={isExporting || filteredLeads.length === 0}
            id="library-export-csv-btn"
            className="h-8 text-xs gap-1.5 border-zinc-200 hover:bg-zinc-50 font-bold"
          >
            <Download className="h-3.5 w-3.5 text-zinc-500" />
            {isExporting ? 'Exporting...' : 'Export CSV'}
          </Button>

          <Button 
            onClick={() => router.push('/app/sourcing')}
            className="bg-primary hover:bg-primary/95 text-white h-8 text-xs font-bold gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            New search
          </Button>
        </div>

      </header>

      {/* Main split window content */}
      <div className="flex-1 flex overflow-hidden bg-zinc-50">
        
        {/* Left Side: Networks list, Connected Accounts, Members Table, and Leads Table */}
        <div className="flex-grow overflow-y-auto p-8 space-y-6">
          
          {/* Add Network Intro Box */}
          <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm space-y-3">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-lg bg-emerald-50 text-primary flex items-center justify-center shrink-0">
                <UserPlus className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-zinc-900">Add Networks to Expand Search</h3>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Invite your team, advisors, and founders to sync their professional LinkedIn networks. 
                  This aggregates your connections into a shared pool, allowing the sourcing agent to search candidates and find warm introductions.
                </p>
              </div>
            </div>
          </div>

          {/* Qualified Candidates Section & Dynamic Leads Table */}
          <div id="library-database-container" className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                {activeCollection ? `Candidates in "${activeCollection.name}"` : 'Qualified Candidates Database'}
              </h4>
              
              {/* Local search input */}
              <div className="relative w-64">
                <Input
                  type="text"
                  placeholder="Rechercher des leads..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-8 pl-8 text-xs border-zinc-200 focus-visible:ring-1 focus-visible:ring-primary rounded-lg bg-white"
                />
                <Search className="absolute left-2.5 top-2.5 h-3 w-3 text-zinc-400" />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-2.5 text-zinc-400 hover:text-zinc-600">
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>

            {filteredLeads.length === 0 ? (
              <div className="bg-white border border-zinc-200 rounded-xl p-8 shadow-sm flex flex-col items-center justify-center text-center">
                <div className="h-12 w-12 rounded-full bg-zinc-100 flex items-center justify-center mb-4">
                  <Database className="h-6 w-6 text-zinc-400" />
                </div>
                <h5 className="text-sm font-bold text-zinc-800">Aucun lead trouvé</h5>
                <p className="text-xs text-zinc-400 max-w-sm mt-1 mb-6 leading-relaxed">
                  {searchQuery 
                    ? "Aucun résultat ne correspond à votre recherche. Essayez d'autres mots-clés."
                    : "Votre base de données de collection est vide. Qualifiez des profils depuis le Sourcing Copilot."
                  }
                </p>
                {!searchQuery && (
                  <Button 
                    onClick={() => router.push('/app/sourcing')}
                    className="bg-primary hover:bg-primary/95 text-white h-8 text-xs font-bold"
                  >
                    Aller au Sourcing Copilot
                  </Button>
                )}
              </div>
            ) : (
              <div className="bg-white border border-zinc-200 rounded-xl overflow-visible shadow-sm">
                <table className="w-full text-left border-collapse table-fixed">
                  <thead>
                    <tr className="border-b border-zinc-100 bg-zinc-50/50 text-[10px] font-bold text-zinc-400 uppercase tracking-wider select-none">
                      <th className="py-3 px-4 w-1/3">Candidate</th>
                      <th className="py-3 px-4 w-1/4">Company Details</th>
                      <th className="py-3 px-4 w-1/4">Assigned Folders</th>
                      <th className="py-3 px-4 text-right w-[100px]">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 text-xs text-zinc-700">
                    {filteredLeads.map((lead) => (
                      <tr key={lead.id} className="hover:bg-zinc-50/50 transition-colors">
                        
                        {/* Candidate Column */}
                        <td className="py-3.5 px-4 font-sans align-top">
                          <div className="flex items-start gap-3">
                            <div className="h-8 w-8 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold text-xs shrink-0 select-none">
                              {lead.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                            </div>
                            <div className="space-y-0.5 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="font-extrabold text-zinc-900 text-xs truncate block">{lead.name}</span>
                                <a 
                                  href="https://linkedin.com" 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="text-[#0A66C2] hover:scale-110 transition-transform shrink-0"
                                >
                                  <LinkedinIcon className="h-3 w-3" />
                                </a>
                              </div>
                              <span className="text-[10px] font-semibold text-zinc-500 block truncate">{lead.role || 'Prospect'}</span>
                              <span className="text-[9px] text-zinc-400 font-medium bg-zinc-100 px-1.5 py-0.5 rounded-full inline-block mt-1">
                                {lead.location || 'Canada'}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Company Details Column */}
                        <td className="py-3.5 px-4 align-top">
                          <div className="space-y-1">
                            <span className="font-bold text-zinc-800 text-xs block truncate">{lead.company}</span>
                            <a 
                              href={lead.website} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="text-[10px] text-primary font-bold hover:underline inline-flex items-center gap-0.5"
                            >
                              {lead.website.replace(/^https?:\/\//, '')}
                              <ExternalLink className="h-2 w-2" />
                            </a>
                            <span className="text-[10px] text-zinc-400 block truncate font-mono mt-0.5">{lead.email}</span>
                          </div>
                        </td>

                        {/* Assigned Folders Column */}
                        <td className="py-3.5 px-4 align-top">
                          <div className="flex flex-wrap gap-1">
                            {(!lead.collections || lead.collections.length === 0) ? (
                              <span className="text-[10px] text-zinc-400 italic">Sans dossier</span>
                            ) : (
                              lead.collections.map((colId) => {
                                const col = collections.find(c => c.id === colId);
                                if (!col) return null;
                                return (
                                  <Badge 
                                    key={colId}
                                    variant="secondary" 
                                    className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100/80 border-emerald-100/50 text-[9px] font-bold py-0.5 px-1.5"
                                  >
                                    {col.name}
                                  </Badge>
                                );
                              })
                            )}
                          </div>
                        </td>

                        {/* Actions & Popover Trigger Column */}
                        <td className="py-3.5 px-4 text-right align-top relative">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Comments drawer button */}
                            <Button
                              size="icon"
                              variant="outline"
                              onClick={() => {
                                setSelectedLeadForComments(lead);
                                setIsCommentsDrawerOpen(true);
                              }}
                              className="h-7 w-7 border-zinc-200 hover:bg-emerald-50 hover:border-emerald-300"
                              title="Discussions et notes"
                            >
                              <MessageSquare className="h-3.5 w-3.5 text-zinc-500" />
                            </Button>
                            {/* Toggle Folder assignment button */}
                            <Button 
                              size="icon" 
                              variant="outline" 
                              onClick={() => {
                                setSelectedLeadIdForPopover(
                                  selectedLeadIdForPopover === lead.id ? null : lead.id
                                );
                                setShowCreateCollectionInline(false);
                              }}
                              className={`h-7 w-7 border-zinc-200 hover:bg-zinc-50 ${
                                selectedLeadIdForPopover === lead.id ? 'bg-zinc-100 border-zinc-300' : ''
                              }`}
                              title="Assign folder"
                            >
                              <FolderPlus className="h-3.5 w-3.5 text-zinc-500" />
                            </Button>
                          </div>

                          {/* Beautiful direct checklist popover widget */}
                          {selectedLeadIdForPopover === lead.id && (
                            <div className="absolute right-4 top-11 z-50 w-60 text-left bg-white border border-zinc-200 shadow-2xl rounded-2xl p-3 space-y-3.5 animate-in fade-in slide-in-from-top-2 duration-150">
                              
                              <div className="flex justify-between items-center pb-1.5 border-b border-zinc-100">
                                <span className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider block">Associer aux dossiers</span>
                                <button 
                                  onClick={() => setSelectedLeadIdForPopover(null)} 
                                  className="text-zinc-400 hover:text-zinc-700"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>

                              {/* Interactive Collections list */}
                              <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                                {collections.map((col) => {
                                  const isAssigned = (lead.collections || []).includes(col.id);
                                  return (
                                    <button
                                      key={col.id}
                                      onClick={() => handleToggleCollection(lead.id, col.id, lead.collections || [])}
                                      className="w-full flex items-center justify-between p-1.5 rounded-lg text-left text-xs font-semibold hover:bg-zinc-50 transition-colors"
                                    >
                                      <span className="truncate max-w-[150px]">{col.name}</span>
                                      <div className={`h-4 w-4 rounded flex items-center justify-center border transition-all ${
                                        isAssigned 
                                          ? 'bg-primary border-primary text-white' 
                                          : 'border-zinc-300 bg-white'
                                      }`}>
                                        {isAssigned && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>

                              {/* Create folder inline trigger */}
                              {!showCreateCollectionInline ? (
                                <button
                                  onClick={() => setShowCreateCollectionInline(true)}
                                  className="w-full h-8 flex items-center justify-center border border-dashed border-zinc-200 text-xs font-bold text-primary hover:bg-emerald-50/50 hover:border-primary/50 rounded-lg transition-all"
                                >
                                  <Plus className="h-3.5 w-3.5 mr-1" />
                                  Créer une collection
                                </button>
                              ) : (
                                <div className="space-y-2 pt-1 border-t border-zinc-100 animate-in fade-in duration-200">
                                  <input 
                                    type="text"
                                    placeholder="Nom du dossier..."
                                    value={newColName}
                                    onChange={(e) => setNewColName(e.target.value)}
                                    className="w-full h-7 border border-zinc-200 rounded px-2 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                                  />
                                  <div className="flex gap-1 justify-end">
                                    <Button 
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => setShowCreateCollectionInline(false)}
                                      className="h-6 text-[10px] px-2 font-bold text-zinc-500 hover:bg-zinc-50"
                                    >
                                      Annuler
                                    </Button>
                                    <Button 
                                      size="sm"
                                      onClick={handleInlineCreateCollection}
                                      disabled={!newColName.trim()}
                                      className="h-6 text-[10px] px-2 font-bold bg-primary text-white hover:bg-primary/90"
                                    >
                                      Créer
                                    </Button>
                                  </div>
                                </div>
                              )}

                            </div>
                          )}

                        </td>

                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Connected Professional Accounts */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Connected Professional Accounts</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border-zinc-200 shadow-sm bg-white">
                <CardContent className="p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-50 text-[#0A66C2] flex items-center justify-center font-bold text-sm shrink-0">
                      <LinkedinIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-zinc-900 block">Kael Belceus (You)</span>
                      <span className="text-[10px] text-zinc-400 block mt-0.5">LinkedIn Profile Sync &middot; Connected today</span>
                    </div>
                  </div>
                  <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-emerald-200 text-[10px] font-bold">
                    Active
                  </Badge>
                </CardContent>
              </Card>

              {/* Placeholder for adding network connection */}
              <div className="border border-dashed border-zinc-300 rounded-xl bg-white p-4 flex items-center justify-center text-center cursor-pointer hover:border-primary hover:bg-zinc-50/50 transition-all select-none">
                <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-primary">
                  <Plus className="h-4 w-4" />
                  <span>Link another LinkedIn Profile</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Side: Network configurations context settings panel */}
        <div className="hidden lg:flex w-80 border-l border-zinc-200 bg-white flex-col shrink-0 p-6 space-y-6">
          
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-zinc-900">Network Configuration</h4>
            <p className="text-[11px] text-zinc-500 leading-normal font-medium">
              Manage permissions, privacy and sharing constraints for this aggregated network.
            </p>
          </div>

          {/* Field: Network type */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block font-sans">Network Sync Mode</span>
            <select className="w-full text-xs rounded-md border border-zinc-200 bg-white p-2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary font-semibold text-zinc-800">
              <option>LinkedIn Connections Only</option>
              <option>Aggregated CRM Contacts</option>
              <option>Combined Shared Database</option>
            </select>
          </div>

          {/* Field: Privacy control */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block font-sans">Privacy &amp; Accessibility</span>
            <select 
              value={privacy}
              onChange={(e) => setPrivacy(e.target.value)}
              className="w-full text-xs rounded-md border border-zinc-200 bg-white p-2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary font-semibold text-zinc-800"
            >
              <option value="link_search">Anyone with link can search</option>
              <option value="members_only">Members of this organization only</option>
              <option value="private">Strictly Private (Just me)</option>
            </select>
          </div>

          {/* Invite URL block */}
          {privacy === 'link_search' && (
            <div className="space-y-2 p-3 bg-zinc-50 rounded-xl border border-zinc-100 animate-in slide-in-from-top-2 duration-200">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block font-sans">Direct Search Link</span>
              <p className="text-[10px] text-zinc-500 leading-normal font-medium">Allow advisors/partners to search without logging into Vectra.</p>
              <div className="flex gap-1.5 mt-2">
                <Input 
                  value={inviteUrl} 
                  readOnly 
                  className="h-8 text-[10px] border-zinc-200 bg-white focus-visible:ring-0 select-all font-mono text-zinc-600"
                />
                <Button 
                  size="icon" 
                  variant="outline" 
                  onClick={handleCopyLink} 
                  className="h-8 w-8 border-zinc-200 shrink-0 hover:bg-zinc-50"
                  title="Copy link"
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5 text-emerald-600 animate-in zoom-in" />
                  ) : (
                    <Copy className="h-3.5 w-3.5 text-zinc-500" />
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Divider */}
          <div className="border-t border-zinc-100 my-2" />

          {/* Security details alert banner */}
          <div className="p-4 bg-amber-50/50 border border-amber-200/50 rounded-xl space-y-2">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-700 uppercase">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              <span>Data Protection</span>
            </div>
            <p className="text-[10px] text-amber-600 leading-normal font-medium">
              Syncing a professional network respects user accounts. The system does not cache personal login passwords or perform actions outside designated search parameters.
            </p>
          </div>

        </div>

      </div>

    </div>

      {/* Lead Comments Slide-over Drawer */}
      <LeadCommentsDrawer
        lead={selectedLeadForComments}
        isOpen={isCommentsDrawerOpen}
        onClose={() => {
          setIsCommentsDrawerOpen(false);
          setSelectedLeadForComments(null);
        }}
      />
    </>
  );
}

export default function LibraryPage() {
  return (
    <React.Suspense fallback={
      <div className="flex-1 flex items-center justify-center bg-white text-zinc-500 font-sans text-xs">
        Loading library...
      </div>
    }>
      <LibraryPageContent />
    </React.Suspense>
  );
}
