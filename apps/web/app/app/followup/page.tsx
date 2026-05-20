'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@workspace/ui/components/button';
import { Badge } from '@workspace/ui/components/badge';
import { Input } from '@workspace/ui/components/input';
import {
  CalendarClock,
  Download,
  Plus,
  ExternalLink,
  Clock,
  Filter
} from 'lucide-react';
import { getLeads, getFollowUps, saveFollowUp, Lead, FollowUpEntry, FollowUpStatus } from '@/lib/db-fallback';

const STATUS_COLORS: Record<FollowUpStatus, string> = {
  prospect: 'bg-zinc-100 text-zinc-700 border-zinc-200',
  qualifie: 'bg-blue-50 text-blue-700 border-blue-200',
  message_envoye: 'bg-purple-50 text-purple-700 border-purple-200',
  reponse_recue: 'bg-amber-50 text-amber-700 border-amber-200',
  appel_planifie: 'bg-orange-50 text-orange-700 border-orange-200',
  deal_conclu: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

const STATUS_LABELS: Record<FollowUpStatus, string> = {
  prospect: 'Prospect',
  qualifie: 'Qualifié',
  message_envoye: 'Message envoyé',
  reponse_recue: 'Réponse reçue',
  appel_planifie: 'Appel planifié',
  deal_conclu: 'Deal conclu',
};

export default function FollowUpPage() {
  const router = useRouter();
  
  const [leads, setLeads] = useState<Lead[]>([]);
  const [followUps, setFollowUps] = useState<Record<string, FollowUpEntry>>({});
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<FollowUpStatus | 'all'>('all');
  const [campaignFilter, setCampaignFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'this_week' | 'this_month' | 'overdue'>('all');

  useEffect(() => {
    async function loadData() {
      const fetchedLeads = await getLeads();
      setLeads(fetchedLeads);
      
      const fetchedFollowUps = await getFollowUps();
      const followUpMap: Record<string, FollowUpEntry> = {};
      fetchedFollowUps.forEach(f => {
        followUpMap[f.leadId] = f;
      });
      setFollowUps(followUpMap);
    }
    loadData();
  }, []);

  const handleUpdateFollowUp = async (leadId: string, updates: Partial<FollowUpEntry>) => {
    const existing = followUps[leadId] || {
      leadId,
      status: 'prospect',
      followUpDate: null,
      notes: ''
    };
    const newEntry = { ...existing, ...updates };
    
    // Optimistic update
    setFollowUps(prev => ({ ...prev, [leadId]: newEntry }));
    
    // Save
    await saveFollowUp(newEntry);
  };

  const isOverdue = (dateStr: string | null) => {
    if (!dateStr) return false;
    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  // Filter logic
  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const entry = followUps[lead.id];
      const status = entry?.status || 'prospect';
      const dateStr = entry?.followUpDate;

      // Status filter
      if (statusFilter !== 'all' && status !== statusFilter) return false;
      
      // Campaign filter
      if (campaignFilter !== 'all' && lead.campaign_id !== campaignFilter) return false;
      
      // Date filter
      if (dateFilter !== 'all') {
        if (!dateStr) return false;
        const date = new Date(dateStr);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (dateFilter === 'overdue') {
          if (date >= today) return false;
        } else if (dateFilter === 'this_week') {
          const nextWeek = new Date(today);
          nextWeek.setDate(nextWeek.getDate() + 7);
          if (date < today || date > nextWeek) return false;
        } else if (dateFilter === 'this_month') {
          const nextMonth = new Date(today);
          nextMonth.setMonth(nextMonth.getMonth() + 1);
          if (date < today || date > nextMonth) return false;
        }
      }

      return true;
    });
  }, [leads, followUps, statusFilter, campaignFilter, dateFilter]);

  const overdueCount = useMemo(() => {
    return leads.filter(l => isOverdue(followUps[l.id]?.followUpDate ?? null)).length;
  }, [leads, followUps]);

  // Unique campaigns for filter
  const campaigns = useMemo(() => {
    const ids = new Set(leads.map(l => l.campaign_id).filter(Boolean));
    return Array.from(ids) as string[];
  }, [leads]);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white text-zinc-950 font-sans">
      
      {/* Header */}
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-zinc-200 bg-white px-6">
        <div className="flex items-center gap-2 text-sm text-zinc-500 select-none">
          <CalendarClock className="h-4 w-4 mr-1 text-primary" />
          <span className="font-semibold text-zinc-900">Follow-up Tracker</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-xs font-medium text-zinc-500">
            <span className="text-zinc-900 font-bold">{filteredLeads.length}</span> leads
            {overdueCount > 0 && (
              <span className="ml-2 text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                {overdueCount} en retard
              </span>
            )}
          </div>
          <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 border-zinc-200">
            <Download className="h-3.5 w-3.5" />
            Exporter CSV
          </Button>
          <Button size="sm" className="h-8 text-xs gap-1.5 bg-primary hover:bg-primary/90">
            <Plus className="h-3.5 w-3.5" />
            Ajouter un lead
          </Button>
        </div>
      </header>

      {/* Filters Bar */}
      <div className="p-4 border-b border-zinc-100 bg-zinc-50 flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2 text-zinc-500 font-medium text-xs">
          <Filter className="h-4 w-4" />
          Filtres :
        </div>
        
        <select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="h-8 rounded-md border-zinc-200 text-xs px-2 focus:ring-primary focus:border-primary"
        >
          <option value="all">Tous les statuts</option>
          {Object.entries(STATUS_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>

        <select 
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value as any)}
          className="h-8 rounded-md border-zinc-200 text-xs px-2 focus:ring-primary focus:border-primary"
        >
          <option value="all">Toutes les dates</option>
          <option value="overdue">En retard</option>
          <option value="this_week">Cette semaine</option>
          <option value="this_month">Ce mois-ci</option>
        </select>
        
        {campaigns.length > 0 && (
          <select 
            value={campaignFilter}
            onChange={(e) => setCampaignFilter(e.target.value)}
            className="h-8 rounded-md border-zinc-200 text-xs px-2 focus:ring-primary focus:border-primary"
          >
            <option value="all">Toutes les campagnes</option>
            {campaigns.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        )}
      </div>

      {/* Main Table Area */}
      <div className="flex-1 overflow-auto bg-white p-6">
        {filteredLeads.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-zinc-400">
            <CalendarClock className="h-12 w-12 mb-4 text-zinc-200" />
            <p className="font-medium text-sm text-zinc-500">Aucun lead à suivre</p>
            <p className="text-xs mt-1">Ajustez vos filtres ou ajoutez des candidats depuis le Sourcing.</p>
          </div>
        ) : (
          <div className="border border-zinc-200 rounded-lg overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 font-medium">Lead</th>
                  <th className="px-4 py-3 font-medium">Statut</th>
                  <th className="px-4 py-3 font-medium">Prochaine relance</th>
                  <th className="px-4 py-3 font-medium">Notes</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredLeads.map(lead => {
                  const entry = followUps[lead.id] || { status: 'prospect', followUpDate: null, notes: '' };
                  const overdue = isOverdue(entry.followUpDate);
                  
                  return (
                    <tr key={lead.id} className="hover:bg-zinc-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                            {lead.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-semibold text-zinc-900">{lead.name}</div>
                            <div className="text-xs text-zinc-500">{lead.company}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={entry.status}
                          onChange={(e) => handleUpdateFollowUp(lead.id, { status: e.target.value as FollowUpStatus })}
                          className={`h-7 rounded-md text-xs font-bold px-2 pr-6 appearance-none cursor-pointer focus:ring-2 focus:ring-primary/20 focus:outline-none border ${STATUS_COLORS[entry.status as FollowUpStatus]}`}
                          style={{
                            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                            backgroundPosition: 'right 0.25rem center',
                            backgroundRepeat: 'no-repeat',
                            backgroundSize: '1.2em 1.2em'
                          }}
                        >
                          {Object.entries(STATUS_LABELS).map(([k, v]) => (
                            <option key={k} value={k}>{v}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Input
                            type="date"
                            value={entry.followUpDate || ''}
                            onChange={(e) => handleUpdateFollowUp(lead.id, { followUpDate: e.target.value || null })}
                            className={`h-8 text-xs w-36 ${overdue ? 'border-red-300 text-red-700 bg-red-50 focus-visible:ring-red-500' : ''}`}
                          />
                          {overdue && (
                            <Badge variant="destructive" className="text-[10px] bg-red-100 text-red-700 border-red-200 hover:bg-red-100 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              En retard
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Input
                          type="text"
                          defaultValue={entry.notes}
                          placeholder="Ajouter une note..."
                          onBlur={(e) => handleUpdateFollowUp(lead.id, { notes: e.target.value })}
                          className="h-8 text-xs border-transparent hover:border-zinc-200 focus-visible:border-primary bg-transparent focus-visible:bg-white w-full max-w-[240px]"
                        />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-zinc-400 hover:text-primary"
                          onClick={() => router.push('/app/outreach')}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
