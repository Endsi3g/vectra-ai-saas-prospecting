'use client';

import React, { useState } from 'react';
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
  ChevronDown
} from 'lucide-react';
import { captureAnalyticsEvent } from '@/lib/analytics';

export default function AnalyticsPage() {
  const router = useRouter();
  const [selectedTimeframe, setSelectedTimeframe] = useState<'7d' | '30d' | 'all'>('7d');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    captureAnalyticsEvent('analytics_refreshed', { timeframe: selectedTimeframe });
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  // Funnel steps data
  const funnelSteps = [
    { name: 'Leads Importés', value: '2 000', percentage: '100%', color: 'bg-primary/20 text-primary border-primary/30' },
    { name: 'Candidats Qualifiés (IA)', value: '1 850', percentage: '92.5%', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { name: 'Messages Approchés', value: '1 452', percentage: '72.6%', color: 'bg-zinc-900 text-white border-zinc-950' },
    { name: 'Réponses Reçues', value: '327', percentage: '16.3%', color: 'bg-amber-50 text-amber-700 border-amber-200' },
    { name: 'Appels Planifiés', value: '36', percentage: '1.8%', color: 'bg-emerald-600 text-white border-emerald-700' }
  ];

  // Daily activity mock data
  const dailyActivity = [
    { date: '13 Mai', sent: 120, replies: 14 },
    { date: '14 Mai', sent: 145, replies: 18 },
    { date: '15 Mai', sent: 190, replies: 28 },
    { date: '16 Mai', sent: 80, replies: 12 },
    { date: '17 Mai', sent: 40, replies: 5 },
    { date: '18 Mai', sent: 210, replies: 42 },
    { date: '19 Mai', sent: 240, replies: 49 }
  ];

  const maxSentVal = Math.max(...dailyActivity.map(d => d.sent));

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
        <div className="flex items-center gap-2">
          {/* Timeframe selector */}
          <div className="flex bg-zinc-100 p-0.5 rounded-lg border border-zinc-200 text-xs">
            {(['7d', '30d', 'all'] as const).map((t) => (
              <button
                key={t}
                onClick={() => {
                  setSelectedTimeframe(t);
                  captureAnalyticsEvent('analytics_timeframe_changed', { timeframe: t });
                }}
                className={`px-3 py-1.5 rounded-md font-bold uppercase transition-all ${
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
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="h-8 border-zinc-200 text-xs font-bold"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </div>
      </header>

      {/* Main scrollable body workspace */}
      <div className="flex-1 overflow-y-auto bg-[#FAFAFA] p-6 space-y-6">
        
        {/* Row 1: KPI Stat Cards Grid */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 max-w-5xl">
          
          {/* Card 1: Total Outreach */}
          <Card className="border-zinc-200 shadow-sm bg-white">
            <CardContent className="p-5 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Messages Envoyés</span>
                <div className="h-7 w-7 rounded-lg bg-zinc-50 border flex items-center justify-center text-zinc-500">
                  <Mail className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3">
                <h3 className="text-2xl font-black text-zinc-900">1 452</h3>
                <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold mt-1.5">
                  <ArrowUpRight className="h-3 w-3" />
                  <span>+12.4% vs last week</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Open Rate */}
          <Card className="border-zinc-200 shadow-sm bg-white">
            <CardContent className="p-5 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Taux d'Ouverture</span>
                <div className="h-7 w-7 rounded-lg bg-zinc-50 border flex items-center justify-center text-zinc-500">
                  <TrendingUp className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3">
                <h3 className="text-2xl font-black text-zinc-900">84.2%</h3>
                <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold mt-1.5">
                  <ArrowUpRight className="h-3 w-3" />
                  <span>+4.1% vs last week</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Reply Rate */}
          <Card className="border-zinc-200 shadow-sm bg-white">
            <CardContent className="p-5 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Taux de Réponse</span>
                <div className="h-7 w-7 rounded-lg bg-zinc-50 border flex items-center justify-center text-zinc-500">
                  <MessageSquare className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3">
                <h3 className="text-2xl font-black text-zinc-900">22.5%</h3>
                <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold mt-1.5">
                  <ArrowUpRight className="h-3 w-3" />
                  <span>+3.2% vs last week</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 4: Booked Calls */}
          <Card className="border-zinc-200 shadow-sm bg-white">
            <CardContent className="p-5 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Appels Planifiés</span>
                <div className="h-7 w-7 rounded-lg bg-zinc-50 border flex items-center justify-center text-zinc-500">
                  <Calendar className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3">
                <h3 className="text-2xl font-black text-zinc-900">36</h3>
                <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold mt-1.5">
                  <ArrowUpRight className="h-3 w-3" />
                  <span>+18.7% vs last week</span>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Row 2: Graph and Funnel Split layout */}
        <div className="grid gap-6 lg:grid-cols-2 max-w-5xl">
          
          {/* Graph: Weekly Activities */}
          <Card className="border-zinc-200 shadow-sm bg-white flex flex-col justify-between">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold">Activité de Prospection Hebdomadaire</CardTitle>
              <CardDescription className="text-[11px]">
                Comparaison entre les messages envoyés et les réponses obtenues par jour.
              </CardDescription>
            </CardHeader>

            <CardContent className="pb-6">
              {/* Custom SVG/HTML Bar Chart layout */}
              <div className="space-y-4 pt-2">
                <div className="flex items-end justify-between h-48 pt-4 pb-2 border-b border-zinc-150 relative">
                  
                  {/* Chart guide lines */}
                  <div className="absolute left-0 right-0 top-1/4 border-t border-zinc-100" />
                  <div className="absolute left-0 right-0 top-2/4 border-t border-zinc-100" />
                  <div className="absolute left-0 right-0 top-3/4 border-t border-zinc-100" />

                  {dailyActivity.map((day, idx) => {
                    const sentHeight = (day.sent / maxSentVal) * 100;
                    const repliesHeight = ((day.replies * 4) / maxSentVal) * 100; // Multiplied for scale visibility

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
          <Card className="border-zinc-200 shadow-sm bg-white flex flex-col justify-between">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold">Entonnoir de Conversion de Prospection</CardTitle>
              <CardDescription className="text-[11px]">
                Suivi des taux de qualification et de conversion du funnel.
              </CardDescription>
            </CardHeader>

            <CardContent className="pb-6">
              {/* Stacked Funnel layout */}
              <div className="space-y-2.5 pt-2">
                {funnelSteps.map((step, idx) => {
                  // Decreasing widths representing a visual funnel
                  const widths = ['w-full', 'w-[92%]', 'w-[84%]', 'w-[76%]', 'w-[68%]'];
                  return (
                    <div key={idx} className="flex items-center gap-3 text-xs">
                      
                      {/* Name Label */}
                      <span className="w-32 font-bold text-[10px] text-zinc-500 truncate select-none uppercase tracking-wide">
                        {step.name}
                      </span>
                      
                      {/* Funnel Stage block */}
                      <div className={`flex-1 flex items-center justify-between px-4 py-2 rounded-xl border text-[11px] font-bold shadow-sm ${widths[idx]} ${step.color}`}>
                        <span>{step.value}</span>
                        <span>{step.percentage}</span>
                      </div>

                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Row 3: Campaign summary performance comparison */}
        <Card className="border-zinc-200 shadow-sm bg-white max-w-5xl">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold">Performance par Campagne</CardTitle>
              <CardDescription className="text-[11px]">
                Comparatif d'efficacité des approches d'outreach actives.
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-[10px] font-semibold">2 Campagnes actives</Badge>
          </CardHeader>

          <CardContent className="p-0 border-t border-zinc-100 overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[600px]">
              <thead className="bg-[#FAFAFA] border-b border-zinc-100 text-[10px] font-bold text-zinc-400 uppercase tracking-wider select-none">
                <tr>
                  <th className="py-3 px-6">Nom de la Campagne</th>
                  <th className="py-3 px-6 text-center">Score d'Adequation Moyen</th>
                  <th className="py-3 px-6 text-center">Ouverture</th>
                  <th className="py-3 px-6 text-center">Réponse</th>
                  <th className="py-3 px-6 text-center">Appels Bookés</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 font-medium">
                <tr className="hover:bg-zinc-50/50">
                  <td className="py-4 px-6 font-bold text-zinc-900">
                    Audit Landing Page - Coachs Business B2B
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className="bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full font-bold">93% Fit</span>
                  </td>
                  <td className="py-4 px-6 text-center text-zinc-700 font-bold">84%</td>
                  <td className="py-4 px-6 text-center text-zinc-700 font-bold">22%</td>
                  <td className="py-4 px-6 text-center text-primary font-bold">3 Calls</td>
                </tr>
                <tr className="hover:bg-zinc-50/50">
                  <td className="py-4 px-6 font-bold text-zinc-900">
                    Modernisation Web - Agence Design
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className="bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full font-bold">89% Fit</span>
                  </td>
                  <td className="py-4 px-6 text-center text-zinc-700 font-bold">78%</td>
                  <td className="py-4 px-6 text-center text-zinc-700 font-bold">12%</td>
                  <td className="py-4 px-6 text-center text-primary font-bold">1 Call</td>
                </tr>
              </tbody>
            </table>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
