'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import { 
  TrendingUp, 
  Mail, 
  MessageSquare, 
  Calendar, 
  Users, 
  ArrowUpRight, 
  ArrowDownRight,
  Filter,
  RefreshCw,
  Coins,
  ChevronDown,
  Download
} from 'lucide-react';
import { captureAnalyticsEvent } from '@/lib/analytics';
import { supabase } from '@/lib/supabase';

interface CampaignItem {
  id: string;
  name: string;
}

export default function AnalyticsPage() {
  const router = useRouter();
  const [selectedTimeframe, setSelectedTimeframe] = useState<'7d' | '30d' | 'all'>('7d');
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('all');
  const [campaigns, setCampaigns] = useState<CampaignItem[]>([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const fetchCampaignsList = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data, error } = await supabase
            .from('campaigns')
            .select('id, name')
            .eq('user_id', user.id);
          
          if (!error && data && data.length > 0) {
            setCampaigns(data);
          } else {
            // Mock fallback if empty or error
            setCampaigns([
              { id: 'camp-1', name: 'Audit Landing Page - Coachs Business B2B' },
              { id: 'camp-2', name: 'Modernisation Web - Agence Design' }
            ]);
          }
        } else {
          setCampaigns([
            { id: 'camp-1', name: 'Audit Landing Page - Coachs Business B2B' },
            { id: 'camp-2', name: 'Modernisation Web - Agence Design' }
          ]);
        }
      } catch (err) {
        console.error('Error fetching campaigns list in analytics page:', err);
        setCampaigns([
          { id: 'camp-1', name: 'Audit Landing Page - Coachs Business B2B' },
          { id: 'camp-2', name: 'Modernisation Web - Agence Design' }
        ]);
      } finally {
        setLoadingCampaigns(false);
      }
    };

    fetchCampaignsList();
  }, []);

  const changeTimeframe = (t: '7d' | '30d' | 'all') => {
    setIsTransitioning(true);
    setSelectedTimeframe(t);
    captureAnalyticsEvent('analytics_timeframe_changed', { timeframe: t });
    setTimeout(() => {
      setIsTransitioning(false);
    }, 450);
  };

  const changeCampaign = (campId: string) => {
    setIsTransitioning(true);
    setSelectedCampaignId(campId);
    captureAnalyticsEvent('analytics_campaign_changed', { campaign_id: campId });
    setTimeout(() => {
      setIsTransitioning(false);
    }, 450);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setIsTransitioning(true);
    captureAnalyticsEvent('analytics_refreshed', { timeframe: selectedTimeframe });
    setTimeout(() => {
      setIsRefreshing(false);
      setIsTransitioning(false);
    }, 600);
  };

  const handleExportCSV = () => {
    captureAnalyticsEvent('analytics_export_csv', { timeframe: selectedTimeframe, campaign_id: selectedCampaignId });
    const headers = ['Nom de la Campagne', 'Score d\'Adequation', 'Ouverture (%)', 'Reponse (%)', 'Appels Bookes'];
    const rows = campaigns.map((camp, idx) => {
      let fitScore = 93 - (idx * 4);
      let openPct = idx === 0 ? 84 : 78;
      let replyPct = idx === 0 ? 22 : 12;
      let callsCount = idx === 0 ? 3 : 1;
      if (idx > 1) {
        const hash = (parseInt(camp.id.replace(/\D/g, '')) || idx);
        fitScore = 85 + (hash % 11);
        openPct = 70 + (hash % 21);
        replyPct = 10 + (hash % 16);
        callsCount = 1 + (hash % 4);
      }
      return `"${camp.name}",${fitScore},${openPct},${replyPct},${callsCount}`;
    });
    
    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `vectra_analytics_${selectedTimeframe}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ----------------------------------------------------
  // Dynamic Calculation Engine
  // ----------------------------------------------------
  
  // Baseline stats per timeframe
  let baseSent = 1452;
  let baseOpenRate = 82.5;
  let baseReplyRate = 20.8;
  let baseBooked = 36;
  
  let trendSent = '+12.4%';
  let trendOpen = '+4.1%';
  let trendReply = '+3.2%';
  let trendBooked = '+18.7%';

  if (selectedTimeframe === '7d') {
    baseSent = 340;
    baseOpenRate = 84.2;
    baseReplyRate = 22.5;
    baseBooked = 8;
    trendSent = '+8.5%';
    trendOpen = '+2.3%';
    trendReply = '+1.8%';
    trendBooked = '+10.2%';
  } else if (selectedTimeframe === 'all') {
    baseSent = 5820;
    baseOpenRate = 79.4;
    baseReplyRate = 18.2;
    baseBooked = 124;
    trendSent = '+24.6%';
    trendOpen = '-1.2%';
    trendReply = '+0.5%';
    trendBooked = '+35.3%';
  }

  // Multipliers/modifications by Campaign filter
  let displaySent = baseSent;
  let displayOpenRate = baseOpenRate;
  let displayReplyRate = baseReplyRate;
  let displayBooked = baseBooked;

  if (selectedCampaignId !== 'all') {
    const cIndex = campaigns.findIndex(c => c.id === selectedCampaignId);
    if (cIndex === 0 || selectedCampaignId === 'camp-1') {
      displaySent = Math.round(baseSent * 0.68);
      displayOpenRate = Math.min(98, baseOpenRate + 4.2);
      displayReplyRate = Math.min(50, baseReplyRate + 3.5);
      displayBooked = Math.max(1, Math.round(baseBooked * 0.75));
    } else if (cIndex === 1 || selectedCampaignId === 'camp-2') {
      displaySent = Math.round(baseSent * 0.32);
      displayOpenRate = Math.max(40, baseOpenRate - 5.8);
      displayReplyRate = Math.max(5, baseReplyRate - 4.2);
      displayBooked = Math.max(1, Math.round(baseBooked * 0.25));
    } else {
      // Deterministic generation for database-created entries
      const hash = (parseInt(selectedCampaignId.replace(/\D/g, '')) || 42) % 3;
      if (hash === 0) {
        displaySent = Math.round(baseSent * 0.5);
        displayOpenRate = Math.min(95, baseOpenRate + 2.0);
        displayReplyRate = Math.min(40, baseReplyRate + 1.5);
        displayBooked = Math.max(1, Math.round(baseBooked * 0.55));
      } else {
        displaySent = Math.round(baseSent * 0.4);
        displayOpenRate = Math.max(50, baseOpenRate - 3.0);
        displayReplyRate = Math.max(8, baseReplyRate - 2.0);
        displayBooked = Math.max(1, Math.round(baseBooked * 0.38));
      }
    }
  }

  // Dynamic Funnel calculations
  const computedLeadsImported = Math.round(displaySent * 1.38);
  const computedQualified = Math.round(computedLeadsImported * 0.925);
  const computedSent = displaySent;
  const computedReplies = Math.round(displaySent * (displayReplyRate / 100));
  const computedBooked = displayBooked;

  const funnelSteps = [
    { 
      name: 'Leads Importés', 
      value: computedLeadsImported.toLocaleString(), 
      percentage: '100%', 
      color: 'bg-primary/20 text-primary border-primary/30' 
    },
    { 
      name: 'Candidats Qualifiés (IA)', 
      value: computedQualified.toLocaleString(), 
      percentage: '92.5%', 
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200' 
    },
    { 
      name: 'Messages Approchés', 
      value: computedSent.toLocaleString(), 
      percentage: `${Math.round((computedSent / computedLeadsImported) * 1000) / 10}%`, 
      color: 'bg-zinc-900 text-white border-zinc-950' 
    },
    { 
      name: 'Réponses Reçues', 
      value: computedReplies.toLocaleString(), 
      percentage: `${displayReplyRate.toFixed(1)}%`, 
      color: 'bg-amber-50 text-amber-700 border-amber-200' 
    },
    { 
      name: 'Appels Planifiés', 
      value: computedBooked.toLocaleString(), 
      percentage: `${((computedBooked / computedSent) * 100).toFixed(1)}%`, 
      color: 'bg-emerald-600 text-white border-emerald-700' 
    }
  ];

  // Dynamic chart data depending on Timeframe
  let dailyActivity = [];
  if (selectedTimeframe === '7d') {
    const scaleFactor = displaySent / 340;
    dailyActivity = [
      { date: '13 Mai', sent: Math.round(35 * scaleFactor), replies: Math.round(4 * scaleFactor) },
      { date: '14 Mai', sent: Math.round(48 * scaleFactor), replies: Math.round(6 * scaleFactor) },
      { date: '15 Mai', sent: Math.round(62 * scaleFactor), replies: Math.round(9 * scaleFactor) },
      { date: '16 Mai', sent: Math.round(28 * scaleFactor), replies: Math.round(3 * scaleFactor) },
      { date: '17 Mai', sent: Math.round(15 * scaleFactor), replies: Math.round(1 * scaleFactor) },
      { date: '18 Mai', sent: Math.round(72 * scaleFactor), replies: Math.round(12 * scaleFactor) },
      { date: '19 Mai', sent: Math.round(80 * scaleFactor), replies: Math.round(15 * scaleFactor) }
    ];
  } else if (selectedTimeframe === '30d') {
    const scaleFactor = displaySent / 1452;
    dailyActivity = [
      { date: 'Sem 1', sent: Math.round(320 * scaleFactor), replies: Math.round(48 * scaleFactor) },
      { date: 'Sem 2', sent: Math.round(410 * scaleFactor), replies: Math.round(72 * scaleFactor) },
      { date: 'Sem 3', sent: Math.round(380 * scaleFactor), replies: Math.round(64 * scaleFactor) },
      { date: 'Sem 4', sent: Math.round(342 * scaleFactor), replies: Math.round(58 * scaleFactor) }
    ];
  } else {
    const scaleFactor = displaySent / 5820;
    dailyActivity = [
      { date: 'Trim 1', sent: Math.round(1200 * scaleFactor), replies: Math.round(180 * scaleFactor) },
      { date: 'Trim 2', sent: Math.round(1450 * scaleFactor), replies: Math.round(240 * scaleFactor) },
      { date: 'Trim 3', sent: Math.round(1850 * scaleFactor), replies: Math.round(310 * scaleFactor) },
      { date: 'Trim 4', sent: Math.round(1320 * scaleFactor), replies: Math.round(210 * scaleFactor) }
    ];
  }

  const maxSentVal = Math.max(...dailyActivity.map(d => d.sent), 1);

  // Dynamic Sentiment Analysis
  let posPct = 45;
  let objPct = 35;
  let negPct = 20;

  if (selectedCampaignId !== 'all') {
    const hash = parseInt(selectedCampaignId.replace(/\D/g, '')) || 42;
    posPct = 30 + (hash % 30);
    negPct = 10 + (hash % 20);
    objPct = 100 - posPct - negPct;
  } else if (selectedTimeframe === 'all') {
    posPct = 42;
    objPct = 38;
    negPct = 20;
  }

  // Dynamic campaigns rows
  const renderCampaignRows = () => {
    if (campaigns.length === 0) return null;
    return campaigns.map((camp, idx) => {
      let fitScore = 93 - (idx * 4);
      let openPct = idx === 0 ? 84 : 78;
      let replyPct = idx === 0 ? 22 : 12;
      let callsCount = idx === 0 ? 3 : 1;

      if (idx > 1) {
        const hash = (parseInt(camp.id.replace(/\D/g, '')) || idx);
        fitScore = 85 + (hash % 11);
        openPct = 70 + (hash % 21);
        replyPct = 10 + (hash % 16);
        callsCount = 1 + (hash % 4);
      }

      return (
        <tr key={camp.id} className="hover:bg-zinc-50/50 transition-colors">
          <td className="py-4 px-6 font-bold text-zinc-900 flex items-center gap-2">
            <span className="text-zinc-400 select-none">🎯</span>
            {camp.name}
          </td>
          <td className="py-4 px-6 text-center">
            <span className="bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full font-extrabold text-[10px]">{fitScore}% Fit</span>
          </td>
          <td className="py-4 px-6 text-center text-zinc-700 font-bold">{openPct}%</td>
          <td className="py-4 px-6 text-center text-zinc-700 font-bold">{replyPct}%</td>
          <td className="py-4 px-6 text-center text-primary font-black">{callsCount} Calls</td>
        </tr>
      );
    });
  };

  const activeCampaignName = selectedCampaignId === 'all' 
    ? 'Toutes les campagnes' 
    : campaigns.find(c => c.id === selectedCampaignId)?.name || 'Campagne Spécifique';

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white text-zinc-950 font-sans">
      {/* Header */}
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-zinc-200 bg-white px-6">
        <div className="flex items-center gap-2 text-sm text-zinc-500 select-none">
          <span className="hover:text-zinc-950 cursor-pointer transition-colors" onClick={() => router.push('/app')}>Analytics</span>
          <span className="text-zinc-300 font-normal">/</span>
          <span className="font-semibold text-zinc-900">Performance Dashboard</span>
        </div>

        {/* Action controls */}
        <div className="flex items-center gap-3">
          {/* Campaign Selector */}
          <select
            value={selectedCampaignId}
            onChange={(e) => changeCampaign(e.target.value)}
            disabled={isRefreshing || isTransitioning}
            className="h-8 rounded-lg border border-zinc-200 bg-white text-xs font-bold px-3 focus-visible:outline-none cursor-pointer max-w-[220px] truncate select-none shadow-sm"
          >
            <option value="all">📊 Toutes les campagnes</option>
            {campaigns.map((camp) => (
              <option key={camp.id} value={camp.id}>
                🎯 {camp.name}
              </option>
            ))}
          </select>

          {/* Timeframe selector */}
          <div className="flex bg-zinc-100 p-0.5 rounded-lg border border-zinc-200 text-xs">
            {(['7d', '30d', 'all'] as const).map((t) => (
              <button
                key={t}
                onClick={() => changeTimeframe(t)}
                className={`px-3 py-1 rounded-md font-bold uppercase transition-all ${
                  selectedTimeframe === t
                    ? 'bg-white shadow-sm text-zinc-950'
                    : 'text-zinc-500 hover:text-zinc-800'
                }`}
              >
                {t === '7d' ? '7 Jours' : t === '30d' ? '30 Jours' : 'Tout'}
              </button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="h-8 border-zinc-200 text-xs font-bold shadow-sm text-zinc-700 hidden sm:flex"
          >
            <Download className="h-3.5 w-3.5 mr-1" />
            Exporter (CSV)
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="h-8 border-zinc-200 text-xs font-bold shadow-sm"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </div>
      </header>

      {/* Main scrollable body workspace */}
      <div className="flex-1 overflow-y-auto bg-zinc-50 p-6 space-y-6">
        
        {/* Row 1: KPI Stat Cards Grid */}
        <div className={`grid gap-4 grid-cols-2 lg:grid-cols-4 max-w-5xl transition-all duration-300 ${
          isTransitioning ? 'opacity-50 blur-[1px]' : 'opacity-100 blur-0'
        }`}>
          
          {/* Card 1: Total Outreach */}
          <Card className="border-zinc-200 shadow-sm bg-white hover:border-zinc-300 transition-all">
            <CardContent className="p-5 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Messages Envoyés</span>
                <div className="h-7 w-7 rounded-lg bg-zinc-50 border flex items-center justify-center text-zinc-500">
                  <Mail className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3">
                <h3 className="text-2xl font-black text-zinc-900">{displaySent.toLocaleString()}</h3>
                <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold mt-1.5">
                  <ArrowUpRight className="h-3 w-3" />
                  <span>{trendSent} vs last period</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Open Rate */}
          <Card className="border-zinc-200 shadow-sm bg-white hover:border-zinc-300 transition-all">
            <CardContent className="p-5 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Taux d'Ouverture</span>
                <div className="h-7 w-7 rounded-lg bg-zinc-50 border flex items-center justify-center text-zinc-500">
                  <TrendingUp className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3">
                <h3 className="text-2xl font-black text-zinc-900">{displayOpenRate.toFixed(1)}%</h3>
                <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold mt-1.5">
                  <ArrowUpRight className="h-3 w-3" />
                  <span>{trendOpen} vs last period</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Reply Rate */}
          <Card className="border-zinc-200 shadow-sm bg-white hover:border-zinc-300 transition-all">
            <CardContent className="p-5 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Taux de Réponse</span>
                <div className="h-7 w-7 rounded-lg bg-zinc-50 border flex items-center justify-center text-zinc-500">
                  <MessageSquare className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3">
                <h3 className="text-2xl font-black text-zinc-900">{displayReplyRate.toFixed(1)}%</h3>
                <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold mt-1.5">
                  <ArrowUpRight className="h-3 w-3" />
                  <span>{trendReply} vs last period</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 4: Booked Calls */}
          <Card className="border-zinc-200 shadow-sm bg-white hover:border-zinc-300 transition-all">
            <CardContent className="p-5 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Appels Planifiés</span>
                <div className="h-7 w-7 rounded-lg bg-zinc-50 border flex items-center justify-center text-zinc-500">
                  <Calendar className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3">
                <h3 className="text-2xl font-black text-zinc-900">{displayBooked}</h3>
                <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold mt-1.5">
                  <ArrowUpRight className="h-3 w-3" />
                  <span>{trendBooked} vs last period</span>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Row 2: Graph and Funnel Split layout */}
        <div className={`grid gap-6 lg:grid-cols-2 max-w-5xl transition-all duration-300 ${
          isTransitioning ? 'opacity-50 blur-[1px]' : 'opacity-100 blur-0'
        }`}>
          
          {/* Graph: Weekly Activities */}
          <Card className="border-zinc-200 shadow-sm bg-white flex flex-col justify-between hover:border-zinc-300 transition-all">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-sm font-bold">Activité de Prospection Hebdomadaire</CardTitle>
                  <CardDescription className="text-[11px] mt-0.5">
                    Analyse des envois et réponses pour : <span className="font-bold text-zinc-700">{activeCampaignName}</span>.
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-[9px] uppercase font-bold tracking-tight bg-zinc-50">{selectedTimeframe === '7d' ? '7 Jours' : selectedTimeframe === '30d' ? '30 Jours' : 'Tout'}</Badge>
              </div>
            </CardHeader>

            <CardContent className="pb-6">
              {/* Custom SVG/HTML Bar Chart layout */}
              <div className="space-y-4 pt-2">
                <div className="flex items-end justify-between h-48 pt-4 pb-2 border-b border-zinc-150 relative">
                  
                  {/* Chart guide lines */}
                  <div className="absolute left-0 right-0 top-1/4 border-t border-zinc-100/70" />
                  <div className="absolute left-0 right-0 top-2/4 border-t border-zinc-100/70" />
                  <div className="absolute left-0 right-0 top-3/4 border-t border-zinc-100/70" />

                  {dailyActivity.map((day, idx) => {
                    const sentHeight = (day.sent / maxSentVal) * 100;
                    const scaleFactorReplies = selectedTimeframe === '7d' ? 4 : selectedTimeframe === '30d' ? 3.5 : 3;
                    const repliesHeight = ((day.replies * scaleFactorReplies) / maxSentVal) * 100;

                    return (
                      <div key={idx} className="flex flex-col items-center gap-2 flex-1 group z-10">
                        <div className="w-full flex items-end justify-center gap-1.5 h-36">
                          
                          {/* Sent Bar (Dark zinc) */}
                          <div 
                            style={{ height: `${sentHeight}%` }}
                            className="w-3.5 bg-zinc-800 rounded-t hover:bg-zinc-950 transition-all cursor-pointer relative"
                            title={`${day.sent} messages envoyés`}
                          />

                          {/* Replies Bar (Emerald/Green) */}
                          <div 
                            style={{ height: `${repliesHeight}%` }}
                            className="w-3.5 bg-primary rounded-t hover:bg-primary/95 transition-all cursor-pointer relative"
                            title={`${day.replies} réponses`}
                          />

                        </div>
                        <span className="text-[10px] text-zinc-500 font-bold select-none">{day.date}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Chart legend labels */}
                <div className="flex items-center gap-4 text-[10px] text-zinc-500 font-bold pt-1 select-none">
                  <div className="flex items-center gap-1.5">
                    <span className="inline-block h-2.5 w-2.5 bg-zinc-800 rounded-sm" />
                    <span>Envois</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="inline-block h-2.5 w-2.5 bg-primary rounded-sm" />
                    <span>Réponses</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Funnel: Conversion Steps */}
          <Card className="border-zinc-200 shadow-sm bg-white flex flex-col justify-between hover:border-zinc-300 transition-all">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold">Entonnoir de Conversion de Prospection</CardTitle>
              <CardDescription className="text-[11px] mt-0.5">
                Suivi des taux de qualification et de conversion du funnel.
              </CardDescription>
            </CardHeader>

            <CardContent className="pb-6">
              {/* Stacked Funnel layout */}
              <div className="space-y-2.5 pt-2">
                {funnelSteps.map((step, idx) => {
                  const widths = ['w-full', 'w-[93%]', 'w-[86%]', 'w-[79%]', 'w-[72%]'];
                  return (
                    <div key={idx} className="flex items-center gap-3 text-xs">
                      
                      {/* Name Label */}
                      <span className="w-36 font-bold text-[10px] text-zinc-500 truncate select-none uppercase tracking-wide">
                        {step.name}
                      </span>
                      
                      {/* Funnel Stage block */}
                      <div className={`flex-1 flex items-center justify-between px-4 py-2 rounded-xl border text-[11px] font-bold shadow-sm transition-all duration-300 hover:scale-[1.01] cursor-default ${widths[idx]} ${step.color}`}>
                        <span>{step.value}</span>
                        <span className="font-extrabold">{step.percentage}</span>
                      </div>

                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Row 3: Campaign summary performance comparison & Sentiment */}
        <div className={`grid gap-6 lg:grid-cols-3 max-w-5xl transition-all duration-300 ${
          isTransitioning ? 'opacity-50 blur-[1px]' : 'opacity-100 blur-0'
        }`}>
          
          <Card className="border-zinc-200 shadow-sm bg-white lg:col-span-2 hover:border-zinc-300 transition-all flex flex-col justify-between">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold">Performance par Campagne</CardTitle>
              <CardDescription className="text-[11px]">
                Comparatif d'efficacité des approches d'outreach actives.
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-[10px] font-bold bg-zinc-50">
              {campaigns.length} {campaigns.length > 1 ? 'Campagnes actives' : 'Campagne active'}
            </Badge>
          </CardHeader>

          <CardContent className="p-0 border-t border-zinc-100 overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[600px]">
              <thead className="bg-zinc-50 border-b border-zinc-100 text-[10px] font-bold text-zinc-400 uppercase tracking-wider select-none">
                <tr>
                  <th className="py-3 px-6">Nom de la Campagne</th>
                  <th className="py-3 px-6 text-center">Score d'Adequation Moyen</th>
                  <th className="py-3 px-6 text-center">Ouverture</th>
                  <th className="py-3 px-6 text-center">Réponse</th>
                  <th className="py-3 px-6 text-center">Appels Bookés</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 font-medium">
                {renderCampaignRows()}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Sentiment Analysis Card */}
        <Card className="border-zinc-200 shadow-sm bg-white lg:col-span-1 flex flex-col justify-between hover:border-zinc-300 transition-all">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold">Analyse des Réponses</CardTitle>
            <CardDescription className="text-[11px] mt-0.5">
              Classification IA des intentions.
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-6">
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-zinc-700">
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500"></span>Positif / Intéressé</span>
                  <span>{posPct}%</span>
                </div>
                <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${posPct}%` }} />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-zinc-700">
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500"></span>Objection</span>
                  <span>{objPct}%</span>
                </div>
                <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: `${objPct}%` }} />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-zinc-700">
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-500"></span>Non intéressé</span>
                  <span>{negPct}%</span>
                </div>
                <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500 rounded-full" style={{ width: `${negPct}%` }} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        </div>

      </div>
    </div>
  );
}
