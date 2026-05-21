'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@workspace/ui/components/button';
import { Badge } from '@workspace/ui/components/badge';
import { Card, CardContent } from '@workspace/ui/components/card';
import { supabase } from '@/lib/supabase';
import { 
  Folder, 
  UserCheck, 
  Search, 
  Mail, 
  Sparkles, 
  ArrowRight, 
  TrendingUp, 
  Plus, 
  FolderClosed, 
  Compass,
  AlertCircle
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [chartRange, setChartRange] = useState<'daily' | 'weekly'>('daily');
  const [totalLists, setTotalLists] = useState(0);
  const [candidatesSaved, setCandidatesSaved] = useState(0);
  const [totalSearches, setTotalSearches] = useState(0);
  const [candidatesOutreached, setCandidatesOutreached] = useState(0);
  const [latestCampaign, setLatestCampaign] = useState<{ id: string; name: string; icp?: string } | null>(null);
  const [chartDailyData, setChartDailyData] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);
  const [chartWeeklyData, setChartWeeklyData] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);

  useEffect(() => {
    const fetchUserAndStats = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Parallelize profile + campaigns + collections fetches
        const [profileRes, campaignsRes, collectionsRes] = await Promise.all([
          supabase.from('profiles').select('first_name').eq('id', user.id).single(),
          supabase.from('campaigns').select('id, name, icp, created_at').eq('user_id', user.id).order('created_at', { ascending: false }),
          supabase.from('collections').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
        ]);

        setUserName(profileRes.data?.first_name || user.email?.split('@')[0] || 'vous');
        if (collectionsRes.count !== null) setTotalLists(collectionsRes.count);

        const userCampaigns = campaignsRes.data || [];
        setTotalSearches(userCampaigns.length);
        if (userCampaigns.length > 0 && userCampaigns[0]) {
          setLatestCampaign({ id: userCampaigns[0].id, name: userCampaigns[0].name, icp: userCampaigns[0].icp });
        }

        if (userCampaigns.length > 0) {
          const campaignIds = userCampaigns.map(c => c.id);
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

          // Parallelize leads count, outreach count, and leads-over-time
          const [leadsRes, leadsForOutreachRes, recentLeadsRes] = await Promise.all([
            supabase.from('leads').select('*', { count: 'exact', head: true }).in('campaign_id', campaignIds),
            supabase.from('leads').select('id').in('campaign_id', campaignIds),
            supabase.from('leads').select('created_at').in('campaign_id', campaignIds).gte('created_at', sevenDaysAgo.toISOString())
          ]);

          if (leadsRes.count !== null) setCandidatesSaved(leadsRes.count);

          // Build daily chart data (last 7 days)
          const dailyCounts = [0, 0, 0, 0, 0, 0, 0];
          (recentLeadsRes.data || []).forEach((lead: any) => {
            const leadDate = new Date(lead.created_at);
            const dayDiff = Math.floor((Date.now() - leadDate.getTime()) / (1000 * 60 * 60 * 24));
            if (dayDiff >= 0 && dayDiff < 7) {
              dailyCounts[6 - dayDiff] = (dailyCounts[6 - dayDiff] || 0) + 1;
            }
          });
          if (dailyCounts.some(v => v > 0)) setChartDailyData(dailyCounts);

          const leadIds = (leadsForOutreachRes.data || []).map((l: any) => l.id);
          if (leadIds.length > 0) {
            const { count: outreachCount } = await supabase
              .from('messages')
              .select('*', { count: 'exact', head: true })
              .in('lead_id', leadIds)
              .in('status', ['approved', 'sent']);

            if (outreachCount !== null) setCandidatesOutreached(outreachCount);
          }
        }
      } catch (err) {
        console.error('Failed to load dashboard stats:', err);
      }
    };
    fetchUserAndStats();
  }, []);

  const stats = [
    {
      title: 'Total Lists',
      value: totalLists.toLocaleString(),
      description: 'Lead Folders',
      icon: Folder,
      color: 'text-primary',
      bgColor: 'bg-primary/8',
      borderColor: 'border-primary/15'
    },
    {
      title: 'Candidates Saved',
      value: candidatesSaved.toLocaleString(),
      description: 'Qualified Targets',
      icon: UserCheck,
      color: 'text-foreground',
      bgColor: 'bg-muted',
      borderColor: 'border-border'
    },
    {
      title: 'Total Searches',
      value: totalSearches.toLocaleString(),
      description: 'AI Sourcing Runs',
      icon: Search,
      color: 'text-foreground',
      bgColor: 'bg-muted',
      borderColor: 'border-border'
    },
    {
      title: 'Candidates Outreached',
      value: candidatesOutreached.toLocaleString(),
      description: 'Campaigns Contacted',
      icon: Mail,
      color: 'text-foreground',
      bgColor: 'bg-muted',
      borderColor: 'border-border'
    }
  ];

  const activePoints = chartRange === 'daily' ? chartDailyData : chartWeeklyData;
  const maxVal = Math.max(...activePoints) * 1.15;
  const chartHeight = 120;
  const chartWidth = 500;

  // Calculate SVG Line Path
  const pointsString = activePoints.map((val, index) => {
    const x = (index / (activePoints.length - 1)) * chartWidth;
    const y = chartHeight - (val / maxVal) * chartHeight;
    return `${x},${y}`;
  }).join(' ');

  // Calculate Area Under Path
  const areaPath = `0,${chartHeight} ${pointsString} ${chartWidth},${chartHeight}`;

  return (
    <div className="flex-grow flex flex-col overflow-hidden bg-white text-zinc-950 font-sans">
      
      {/* Starter Trial Warning Banner */}
      <div className="bg-amber-50/70 border-b border-amber-200/50 px-6 py-2 flex items-center justify-between text-xs text-amber-700 select-none">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
          <span>You have <strong className="font-extrabold">5 more searches</strong> left on your Starter trial.</span>
        </div>
        <button
          onClick={() => router.push('/app/settings')}
          className="text-xs font-bold text-amber-700 underline hover:text-amber-900 transition-colors"
        >
          Explore plans &rarr;
        </button>
      </div>

      {/* Header */}
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-zinc-200 bg-white px-6 select-none">
        <div className="flex items-center gap-2 text-sm text-zinc-500">
          <span className="font-semibold text-zinc-900">Dashboard</span>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            onClick={() => router.push('/app/sourcing')}
            className="bg-primary hover:bg-primary/95 text-white h-8 text-xs font-bold gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            New search
          </Button>
        </div>
      </header>

      {/* Scrollable Dashboard Body */}
      <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-zinc-50">
        
        {/* Welcome Section */}
        <div className="space-y-1 select-none">
          <h2 className="text-xl font-extrabold tracking-tight text-zinc-950 capitalize">Welcome back, {userName}!</h2>
          <p className="text-xs text-zinc-500">Here is a quick overview of your target sourcing and outreach activity today.</p>
        </div>

        {/* Active searches / Campaign widget */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider select-none">Active Search Campaigns</h3>
          {latestCampaign ? (
            <Card
              onClick={() => router.push('/app/sourcing')}
              className="border-zinc-200 hover:border-primary cursor-pointer transition-all shadow-sm bg-white overflow-hidden group"
            >
              <CardContent className="p-5 flex items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                    <Compass className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-zinc-900">{latestCampaign.name}</span>
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                      <Badge variant="secondary" className="text-xs bg-emerald-50 text-emerald-800 border-none px-1.5 h-4">
                        Sourcing Active
                      </Badge>
                    </div>
                    <p className="text-xs text-zinc-400">{latestCampaign.icp || 'Campagne de prospection active.'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-zinc-400 group-hover:text-primary transition-colors text-xs font-bold select-none">
                  <span>View results</span>
                  <ArrowRight className="h-4 w-4" />
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card
              onClick={() => router.push('/app/campaigns')}
              className="border-dashed border-zinc-200 hover:border-primary cursor-pointer transition-all shadow-none bg-white group"
            >
              <CardContent className="p-5 flex items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-zinc-100 text-zinc-400 flex items-center justify-center shrink-0 group-hover:bg-primary/10 group-hover:text-primary transition-all">
                    <Compass className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <span className="font-bold text-sm text-zinc-500">Aucune campagne active</span>
                    <p className="text-xs text-zinc-400">Créez votre première campagne pour commencer à sourcer des leads.</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-zinc-400 group-hover:text-primary transition-colors text-xs font-bold select-none">
                  <Plus className="h-4 w-4" />
                  <span>Créer</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <Card key={idx} className={`shadow-none bg-white select-none animate-fade-up stagger-${idx + 1}`}>
                <CardContent className="p-5 flex items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold text-zinc-400 block uppercase tracking-wider">{stat.title}</span>
                    <span className="text-2xl font-extrabold text-zinc-900 block leading-none">{stat.value}</span>
                    <span className="text-xs text-zinc-400 block">{stat.description}</span>
                  </div>
                  <div className={`h-11 w-11 rounded-xl ${stat.bgColor} ${stat.color} flex items-center justify-center shrink-0 border ${stat.borderColor}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Double Panel Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left panel: Collections list */}
          <div className="space-y-3">
            <div className="flex items-center justify-between select-none">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Saved Collections</h3>
              <Button variant="ghost" size="sm" className="h-7 text-xs font-bold text-primary hover:text-primary hover:bg-primary/10">
                <Plus className="h-3 w-3 mr-1" />
                Create Collection
              </Button>
            </div>
            
            <Card className="border-zinc-200 bg-white shadow-sm h-64 flex flex-col items-center justify-center text-center p-6">
              <div className="h-12 w-12 rounded-full bg-zinc-100 flex items-center justify-center mb-4 text-zinc-400">
                <FolderClosed className="h-6 w-6" />
              </div>
              <h4 className="text-sm font-bold text-zinc-800">No collections created yet</h4>
              <p className="text-xs text-zinc-400 max-w-xs mt-1 leading-relaxed">
                Collections hold qualified candidate profiles across sourcing targets. Create one to organize prospects.
              </p>
            </Card>
          </div>

          {/* Right panel: Activity Line Chart */}
          <div className="space-y-3">
            
            <div className="flex items-center justify-between select-none">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Candidates Added</h3>
              <div className="flex bg-zinc-200/60 p-0.5 rounded-lg text-xs font-bold text-zinc-500">
                <button 
                  onClick={() => setChartRange('daily')}
                  className={`px-3 py-1 rounded-md transition-all ${
                    chartRange === 'daily' 
                      ? 'bg-white text-zinc-950 shadow-sm' 
                      : 'hover:text-zinc-800'
                  }`}
                >
                  Daily
                </button>
                <button 
                  onClick={() => setChartRange('weekly')}
                  className={`px-3 py-1 rounded-md transition-all ${
                    chartRange === 'weekly' 
                      ? 'bg-white text-zinc-950 shadow-sm' 
                      : 'hover:text-zinc-800'
                  }`}
                >
                  Weekly
                </button>
              </div>
            </div>

            {/* Line chart widget card */}
            <Card className="border-zinc-200 bg-white shadow-sm h-64 p-6 flex flex-col justify-between">
              
              {/* Header metrics info */}
              <div className="flex items-start justify-between select-none">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">Total Profiles Parsed</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-extrabold text-zinc-900">
                      {chartRange === 'daily' ? '148' : '1,980'}
                    </span>
                    <span className="text-xs font-bold text-primary flex items-center gap-0.5">
                      <TrendingUp className="h-3.5 w-3.5" />
                      +28%
                    </span>
                  </div>
                </div>
              </div>

              {/* Custom SVG Line Chart */}
              <div className="flex-1 w-full mt-4 relative">
                <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-full overflow-visible">
                  
                  {/* Grid Lines */}
                  <line x1="0" y1="0" x2={chartWidth} y2="0" stroke="var(--border)" strokeWidth="1" strokeDasharray="3" />
                  <line x1="0" y1={chartHeight / 2} x2={chartWidth} y2={chartHeight / 2} stroke="var(--border)" strokeWidth="1" strokeDasharray="3" />
                  <line x1="0" y1={chartHeight} x2={chartWidth} y2={chartHeight} stroke="var(--border)" strokeWidth="1.5" />

                  {/* Gradient Area Fill under line */}
                  <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.15" />
                      <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <polygon points={areaPath} fill="url(#chartGradient)" />

                  {/* SVG Stroke Line */}
                  <polyline
                    fill="none"
                    stroke="var(--primary)"
                    strokeWidth="2.5"
                    points={pointsString}
                  />

                  {/* SVG dots on points */}
                  {activePoints.map((val, idx) => {
                    const x = (idx / (activePoints.length - 1)) * chartWidth;
                    const y = chartHeight - (val / maxVal) * chartHeight;
                    return (
                      <g key={idx} className="cursor-pointer group/dot">
                        <circle
                          cx={x}
                          cy={y}
                          r="7"
                          fill="var(--primary)"
                          fillOpacity="0"
                          style={{ transition: 'fill-opacity 150ms ease-out' }}
                          className="group-hover/dot:fill-opacity-[0.12]"
                        />
                        <circle
                          cx={x}
                          cy={y}
                          r="3.5"
                          fill="white"
                          stroke="var(--primary)"
                          strokeWidth="2.5"
                        />
                        <title>{`Added: ${val}`}</title>
                      </g>
                    );
                  })}

                </svg>
              </div>

              {/* Chart Footer Dates label */}
              <div className="flex justify-between items-center text-[10px] text-zinc-400 font-bold uppercase select-none mt-2">
                {chartRange === 'daily' ? (
                  <>
                    <span>Mon</span>
                    <span>Tue</span>
                    <span>Wed</span>
                    <span>Thu</span>
                    <span>Fri</span>
                    <span>Sat</span>
                    <span>Sun</span>
                  </>
                ) : (
                  <>
                    <span>Week 1</span>
                    <span>Week 2</span>
                    <span>Week 3</span>
                    <span>Week 4</span>
                    <span>Week 5</span>
                    <span>Week 6</span>
                    <span>Week 7</span>
                  </>
                )}
              </div>

            </Card>

          </div>

        </div>

      </div>

    </div>
  );
}
