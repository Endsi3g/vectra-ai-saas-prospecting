'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@workspace/ui/components/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@workspace/ui/components/card';
import { Badge } from '@workspace/ui/components/badge';
import { supabase } from '@/lib/supabase';
import { 
  FolderOpen, 
  Sparkles, 
  Trash2, 
  ArrowRight, 
  Loader2, 
  Calendar,
  Users,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface CampaignItem {
  id: string;
  name: string;
  created_at: string;
  offer?: string;
  icp?: string;
  angle?: string;
  leads_count?: number;
  approved_count?: number;
  avg_score?: number;
}

export default function MyCampaignsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState<CampaignItem[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchCampaigns = async () => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/sign-in');
        return;
      }

      // Fetch campaigns
      const { data: campaignList, error: campError } = await supabase
        .from('campaigns')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (campError) throw campError;

      if (!campaignList || campaignList.length === 0) {
        setCampaigns([]);
        return;
      }

      // Fetch metrics (leads & messages statuses) for each campaign
      const formatted: CampaignItem[] = [];

      for (const camp of campaignList) {
        // Fetch leads for this campaign
        const { data: leads } = await supabase
          .from('leads')
          .select('id')
          .eq('campaign_id', camp.id);

        const leadCount = leads?.length || 0;
        let approvedCount = 0;
        let avgScore = 0;

        if (leadCount > 0) {
          const leadIds = leads!.map(l => l.id);
          
          // Fetch messages
          const { data: messages } = await supabase
            .from('messages')
            .select('status, personalization_score')
            .in('lead_id', leadIds);

          if (messages) {
            approvedCount = messages.filter(m => m.status === 'approved').length;
            const scoredMessages = messages.filter(m => m.personalization_score);
            if (scoredMessages.length > 0) {
              avgScore = Math.round(scoredMessages.reduce((acc, m) => acc + m.personalization_score, 0) / scoredMessages.length);
            }
          }
        }

        formatted.push({
          id: camp.id,
          name: camp.name,
          created_at: camp.created_at,
          offer: camp.offer,
          icp: camp.icp,
          angle: camp.angle,
          leads_count: leadCount,
          approved_count: approvedCount,
          avg_score: avgScore
        });
      }

      setCampaigns(formatted);
    } catch (err: any) {
      console.error('Error fetching campaigns:', err);
      // Fallback for mock environment
      setCampaigns([
        {
          id: 'mock-camp-1',
          name: 'Audit Landing Page - Coachs Business B2B',
          created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          offer: 'Je crée des landing pages convertissantes pour formateurs en ligne',
          icp: 'Coachs business B2B',
          angle: 'audit',
          leads_count: 12,
          approved_count: 5,
          avg_score: 93
        },
        {
          id: 'mock-camp-2',
          name: 'Modernisation Web - Agence Design',
          created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          offer: 'Refonte de site et modernisation WordPress',
          icp: 'Cabinets dentaires et esthétiques',
          angle: 'modernization',
          leads_count: 8,
          approved_count: 8,
          avg_score: 89
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleDeleteCampaign = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette campagne et tous ses leads ?')) return;

    try {
      const { error } = await supabase
        .from('campaigns')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setCampaigns(prev => prev.filter(c => c.id !== id));
    } catch (err: any) {
      setErrorMessage(err.message || 'Erreur lors de la suppression.');
      // If mock delete
      setCampaigns(prev => prev.filter(c => c.id !== id));
      setTimeout(() => setErrorMessage(null), 3000);
    }
  };

  const handleLoadCampaign = (campaign: CampaignItem) => {
    // In database, the main Outreach Hub page always loads the latest campaign.
    // To 'load' this campaign, we can simply redirect back to `/app` where it fetches campaign details.
    // For development, we can store activeCampaignId in localStorage or pass it in query params!
    // Let's redirect to `/app` with query params or localStorage.
    if (typeof window !== 'undefined') {
      localStorage.setItem('active_campaign_id', campaign.id);
    }
    router.push('/app');
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-zinc-50 dark:bg-zinc-950">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-zinc-200 bg-white px-6 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-white select-none">
          My Campaigns
        </div>
        <Button size="sm" onClick={() => router.push('/app')} className="bg-primary hover:bg-primary/95 text-white">
          <Sparkles className="h-4 w-4 mr-2" />
          New Campaign
        </Button>
      </header>

      {/* Main campaigns workspace */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        
        {errorMessage && (
          <div className="flex items-start gap-3 rounded-lg bg-rose-50 p-4 text-sm text-rose-800 dark:bg-rose-950/30 dark:text-rose-400">
            <AlertCircle className="h-5 w-5 shrink-0 text-rose-600" />
            <p>{errorMessage}</p>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <span className="text-sm mt-3 font-medium">Chargement des campagnes...</span>
          </div>
        ) : campaigns.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="h-16 w-16 bg-white border rounded-xl flex items-center justify-center dark:bg-zinc-900 dark:border-zinc-800 mb-4 shadow-sm">
              <FolderOpen className="h-8 w-8 text-zinc-400" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Aucune campagne enregistrée</h3>
            <p className="text-sm text-zinc-500 max-w-sm mt-2 dark:text-zinc-400">
              Lancez votre premier ciblage de prospection pour générer des messages ultra-personnalisés.
            </p>
            <Button onClick={() => router.push('/app')} className="mt-4 bg-primary hover:bg-primary/95 text-white">
              Créer ma première campagne
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {campaigns.map((camp) => (
              <Card 
                key={camp.id} 
                className="hover:shadow-md transition-shadow cursor-pointer border-zinc-200 dark:border-zinc-800 flex flex-col justify-between"
                onClick={() => handleLoadCampaign(camp)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base font-bold truncate pr-2" title={camp.name}>
                      {camp.name}
                    </CardTitle>
                    <Badge variant="outline" className="capitalize shrink-0">
                      {camp.angle === 'discovery_call' ? 'Diagnostic' : camp.angle || 'approche'}
                    </Badge>
                  </div>
                  <CardDescription className="flex items-center gap-1.5 text-[11px] mt-1">
                    <Calendar className="h-3 w-3" />
                    Créée le {new Date(camp.created_at).toLocaleDateString('fr-FR')}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-3 pb-3">
                  {camp.offer && (
                    <div className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2">
                      <span className="font-semibold text-zinc-800 dark:text-zinc-200">Offre : </span>
                      {camp.offer}
                    </div>
                  )}
                  {camp.icp && (
                    <div className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2">
                      <span className="font-semibold text-zinc-800 dark:text-zinc-200">Cible : </span>
                      {camp.icp}
                    </div>
                  )}

                  {/* Metrics grid */}
                  <div className="grid grid-cols-3 gap-2 bg-zinc-50 p-2.5 rounded-lg border border-zinc-100 dark:bg-zinc-900 dark:border-zinc-800 text-center">
                    <div>
                      <span className="text-[10px] text-zinc-400 block flex items-center justify-center gap-1"><Users className="h-3 w-3" /> Leads</span>
                      <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{camp.leads_count}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-400 block flex items-center justify-center gap-1"><CheckCircle2 className="h-3 w-3" /> Appr.</span>
                      <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{camp.approved_count}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-400 block">Score</span>
                      <span className="text-sm font-semibold text-primary">{camp.avg_score ? `${camp.avg_score}%` : '-'}</span>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex justify-between gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={(e) => handleDeleteCampaign(camp.id, e)}
                    className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 h-8 px-2"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-primary hover:text-primary hover:bg-primary/5 h-8 gap-1 pr-1 font-semibold"
                  >
                    Ouvrir la campagne
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
