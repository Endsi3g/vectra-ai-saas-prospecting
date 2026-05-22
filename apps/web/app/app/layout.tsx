'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@workspace/ui/components/button';
import { supabase } from '@/lib/supabase';
import { getCollections, createCollection, getCredits } from '@/lib/db-fallback';
import { 
  Sparkles, 
  FolderOpen, 
  Compass, 
  Link2, 
  SearchCode, 
  Settings, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  LogOut,
  User,
  LayoutDashboard,
  Coins,
  BookOpen,
  Search,
  Bot,
  Mail,
  HelpCircle,
  Building,
  UserPlus,
  ChevronDown,
  ArrowLeft,
  Palette,
  Gift,
  Terminal,
  MessageSquare,
  TrendingUp,
  CalendarClock,
  PhoneCall,
  Send,
  Zap
} from 'lucide-react';
import TourGuide from '@/components/TourGuide';
import ProfileDropdown from '@/components/ProfileDropdown';
import NotificationDropdown from '@/components/NotificationDropdown';

function CollectionsList({ 
  collections, 
  pathname 
}: { 
  collections: any[]; 
  pathname: string; 
}) {
  const searchParams = useSearchParams();
  const activeCollectionId = searchParams ? searchParams.get('collection') : null;

  if (collections.length === 0) {
    return <p className="text-[10px] text-zinc-400 italic px-3">No collections added yet</p>;
  }

  return (
    <div className="space-y-0.5 px-1 animate-in fade-in duration-300">
      {collections.map((col) => {
        const isActive = pathname === '/app/library' && activeCollectionId === col.id;
        return (
          <Link
            key={col.id}
            href={`/app/library?collection=${col.id}`}
            className={`group flex items-center justify-between rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              isActive
                ? 'bg-primary/8 text-primary font-bold'
                : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950'
            }`}
          >
            <span className="truncate max-w-[130px]">{col.name}</span>
            <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold shrink-0 transition-colors ${
              isActive
                ? 'bg-primary/15 text-primary'
                : 'bg-zinc-100 text-zinc-500 group-hover:bg-zinc-200'
            }`}>
              {col.count}
            </span>
          </Link>
        );
      })}
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const [showTour, setShowTour] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string>('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [creditsCount, setCreditsCount] = useState<number>(2000);
  const [creditsLimit, setCreditsLimit] = useState<number>(2000);
  const [userPlan, setUserPlan] = useState<string>('alpha_free');
  const [trialEndsAt, setTrialEndsAt] = useState<string | null>(null);

  const getRemainingTrialDays = () => {
    if (!trialEndsAt) return 0;
    const now = new Date();
    const end = new Date(trialEndsAt);
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const remainingTrialDays = getRemainingTrialDays();
  const isCreditsExhausted = creditsCount <= 0 && userPlan === 'alpha_free' && !pathname.startsWith('/app/settings');

  // Collections & Custom Interactive States
  const [collections, setCollections] = useState<any[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionDescription, setNewCollectionDescription] = useState('');
  const [creditsFlash, setCreditsFlash] = useState(false);

  const fetchCollectionsData = async () => {
    const cols = await getCollections();
    setCollections(cols);
  };

  const fetchCreditsData = async () => {
    const val = await getCredits();
    setCreditsCount(val);
  };

  useEffect(() => {
    fetchCollectionsData();
    fetchCreditsData();

    const handleCollectionsUpdate = () => {
      fetchCollectionsData();
    };

    const handleCreditsUpdate = (e: any) => {
      if (e.detail?.credits !== undefined) {
        setCreditsCount(e.detail.credits);
      } else {
        fetchCreditsData();
      }
    };

    const handleToggleSidebar = () => {
      setIsMobileOpen(prev => !prev);
    };

    window.addEventListener('vectra-collections-updated', handleCollectionsUpdate);
    window.addEventListener('vectra-credits-updated', handleCreditsUpdate);
    window.addEventListener('vectra-toggle-sidebar', handleToggleSidebar);

    return () => {
      window.removeEventListener('vectra-collections-updated', handleCollectionsUpdate);
      window.removeEventListener('vectra-credits-updated', handleCreditsUpdate);
      window.removeEventListener('vectra-toggle-sidebar', handleToggleSidebar);
    };
  }, []);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  const handleCreateCollection = async () => {
    if (!newCollectionName.trim()) return;
    try {
      await createCollection(newCollectionName.trim(), newCollectionDescription.trim());
      setNewCollectionName('');
      setNewCollectionDescription('');
      setShowCreateModal(false);
      
      // Refresh local list and trigger window event
      await fetchCollectionsData();
      window.dispatchEvent(new Event('vectra-collections-updated'));
    } catch (e) {
      console.error(e);
    }
  };

  // Animate credit changes
  const prevCreditsRef = React.useRef(creditsCount);
  useEffect(() => {
    if (creditsCount < prevCreditsRef.current) {
      setCreditsFlash(true);
      const timer = setTimeout(() => setCreditsFlash(false), 1200);
      return () => clearTimeout(timer);
    }
    prevCreditsRef.current = creditsCount;
  }, [creditsCount]);

  useEffect(() => {
    const checkUserAndTour = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserEmail(user.email || '');
          
          const { data: profile } = await supabase
            .from('profiles')
            .select('tour_completed, credits_count, credits_limit, plan, trial_ends_at')
            .eq('id', user.id)
            .single();

          if (profile) {
            if (!profile.tour_completed) {
              setShowTour(true);
            }
            if (profile.credits_count !== undefined && profile.credits_count !== null) {
              setCreditsCount(profile.credits_count);
            }
            if (profile.credits_limit !== undefined && profile.credits_limit !== null) {
              setCreditsLimit(profile.credits_limit);
            }
            if (profile.plan) {
              setUserPlan(profile.plan);
            }
            if (profile.trial_ends_at) {
              setTrialEndsAt(profile.trial_ends_at);
            }
          } else {
            const localTourCompleted = localStorage.getItem('tour_completed') === 'true';
            if (!localTourCompleted) {
              setShowTour(true);
            }
          }
        } else {
          const localTourCompleted = localStorage.getItem('tour_completed') === 'true';
          if (!localTourCompleted) {
            setShowTour(true);
          }
        }
      } catch (err) {
        console.error('Error fetching user or tour status:', err);
        const localTourCompleted = localStorage.getItem('tour_completed') === 'true';
        if (!localTourCompleted) {
          setShowTour(true);
        }
      }
    };
    checkUserAndTour();
  }, []);

  useEffect(() => {
    let channel: any = null;
    let mounted = true;

    const setupRealtime = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      // Guard: if effect was cleaned up before async resolved, bail out
      if (!mounted || !user) return;

      // Remove any pre-existing channel with the same name before subscribing
      const channelName = `profile-layout-${user.id}`;
      await supabase.removeAllChannels();

      channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'profiles',
            filter: `id=eq.${user.id}`,
          },
          (payload) => {
            const newProfile = payload.new as any;
            if (newProfile) {
              if (newProfile.credits_count !== undefined && newProfile.credits_count !== null) {
                setCreditsCount(newProfile.credits_count);
              }
              if (newProfile.credits_limit !== undefined && newProfile.credits_limit !== null) {
                setCreditsLimit(newProfile.credits_limit);
              }
              if (newProfile.trial_ends_at !== undefined) {
                setTrialEndsAt(newProfile.trial_ends_at);
              }
              if (newProfile.plan !== undefined) {
                setUserPlan(newProfile.plan);
              }
            }
          }
        )
        .subscribe();
    };

    setupRealtime();

    return () => {
      mounted = false;
      if (channel) {
        supabase.removeChannel(channel);
        channel = null;
      }
    };
  }, []);

  const handleTourClose = async () => {
    setShowTour(false);
    localStorage.setItem('tour_completed', 'true');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('profiles')
          .update({ tour_completed: true })
          .eq('id', user.id);
      }
    } catch (err) {
      console.error('Failed to save tour completion status to database:', err);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/auth/sign-in');
  };

  const navItems = [
    {
      name: 'Dashboard',
      href: '/app',
      icon: LayoutDashboard,
    },
    {
      name: 'Sourcing',
      href: '/app/sourcing',
      icon: Search,
    },
    {
      name: 'Library',
      href: '/app/library',
      icon: BookOpen,
    },
    {
      name: 'Outreach',
      href: '/app/outreach',
      icon: Mail,
    },
    {
      name: 'Follow-up',
      href: '/app/followup',
      icon: CalendarClock,
    },
    {
      name: 'Inbox',
      href: '/app/inbox',
      icon: MessageSquare,
    },
    {
      name: 'Brevo',
      href: '/app/brevo',
      icon: Send,
    },
    {
      name: 'Séquences',
      href: '/app/sequences',
      icon: Zap,
    },
    {
      name: 'Agents',
      href: '/app/agents',
      icon: Bot,
    },
    {
      name: 'Analytics',
      href: '/app/analytics',
      icon: TrendingUp,
    },
    {
      name: 'Training',
      href: '/app/training',
      icon: PhoneCall,
    },
  ];

  const isSettingsPage = pathname.startsWith('/app/settings');

  const settingsNavItems = [
    { name: 'Connections', href: '/app/settings', icon: Link2 },
    { name: 'Integrations', href: '/app/settings/integrations', icon: FolderOpen },
    { name: 'Mailboxes', href: '/app/settings/mailboxes', icon: Mail },
    { name: 'Plans', href: '/app/settings/plans', icon: Coins },
    { name: 'Members', href: '/app/settings/members', icon: UserPlus },
    { name: 'Branding', href: '/app/settings/branding', icon: Palette },
    { name: 'Referrals', href: '/app/settings/referrals', icon: Gift },
    { name: 'API/MCP', href: '/app/settings/api-mcp', icon: Terminal },
    { name: 'Brevo', href: '/app/settings/brevo', icon: Send },
    { name: 'Developer', href: '/app/settings/developer', icon: Terminal },
  ];

  const isItemActive = (href: string) => {
    if (href === '/app/settings') {
      return pathname === '/app/settings' || pathname === '/app/settings/';
    }
    return pathname.startsWith(href);
  };

  if (isSettingsPage) {
    return (
      <div className="flex flex-col h-screen w-screen overflow-hidden bg-zinc-50 select-none text-zinc-950 font-sans">
        {/* Unified Orange Trial Announcement Bar */}
        {userPlan === 'alpha_free' && (
          <div className="relative w-full border-b border-orange-100 flex items-center justify-center py-2 px-4 z-20 bg-pattern shrink-0 select-none">
            <div className="absolute inset-0 bg-white/60 pointer-events-none"></div>

            <div className="relative flex items-center justify-center gap-2 text-orange-600 font-medium text-xs sm:text-sm">
              <svg className="w-4 h-4 shrink-0 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span className="truncate max-w-[280px] xs:max-w-none">
                {remainingTrialDays > 0 
                  ? `Your trial expires in ${remainingTrialDays} days.` 
                  : 'Your Starter trial is over. Upgrade to keep finding candidates, exporting collections, and sharing with your team.'}
              </span>
              <Link href="/app/settings/plans" className="font-semibold underline hover:text-orange-700 ml-1 transition-colors whitespace-nowrap">Explore plans</Link>
            </div>
          </div>
        )}

        {/* Lower container containing Sidebar and Main Area */}
        <div className="flex-1 flex overflow-hidden relative">
          {/* Mobile Overlay backdrop */}
          {isMobileOpen && (
            <div 
              className="fixed inset-0 z-45 bg-zinc-950/40 backdrop-blur-sm md:hidden animate-in fade-in duration-200"
              onClick={() => setIsMobileOpen(false)}
            />
          )}

          {/* Settings Sidebar */}
          <aside 
            className={`fixed inset-y-0 left-0 z-50 md:relative flex flex-col border-r border-zinc-200 bg-white transition-transform md:transition-all duration-300 shrink-0 ${
              isMobileOpen ? 'translate-x-0' : '-translate-x-full'
            } md:translate-x-0 lg:w-60 md:w-52 w-60 md:flex h-full`}
          >
            {/* Go back button header */}
            <div className="h-14 flex items-center px-4 select-none">
              <Link
                href="/app"
                className="flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-zinc-800 transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Go back</span>
              </Link>
            </div>

            {/* Sidebar navigation list */}
            <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
              {settingsNavItems.map((item) => {
                const isActive = isItemActive(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-all select-none ${
                      isActive
                        ? 'bg-zinc-100 text-zinc-950 font-bold'
                        : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'
                    }`}
                  >
                    <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-zinc-900' : 'text-zinc-400'}`} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Have feedback? button at bottom */}
            <div className="p-4 border-t border-zinc-100 shrink-0">
              <button className="w-full py-2 px-3 bg-white border border-zinc-200 rounded-lg text-xs font-semibold text-zinc-600 hover:bg-zinc-50 hover:text-zinc-800 transition-all text-center">
                Have feedback?
              </button>
            </div>
          </aside>

          {/* Main Area */}
          <main className="flex-1 flex flex-col h-full overflow-hidden bg-white">
            {/* Universal Settings Mobile Header */}
            <div className="md:hidden flex h-14 items-center justify-between px-4 border-b border-zinc-200 bg-white select-none shrink-0">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMobileOpen(true)}
                  className="p-2 -ml-2 rounded-xl text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 transition-all focus:outline-none"
                  aria-label="Open settings menu"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                  </svg>
                </button>
                <Link href="/app" className="flex items-center gap-1.5">
                  <div className="w-6 h-6 bg-emerald-500 rounded text-white flex items-center justify-center text-xs font-bold">V</div>
                  <span className="text-xs font-bold text-zinc-800">Settings</span>
                </Link>
              </div>
              <div className="flex items-center gap-2">
                <NotificationDropdown />
              </div>
            </div>
            {children}
          </main>
        </div>

        {showTour && <TourGuide onClose={handleTourClose} />}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-zinc-50 select-none text-zinc-950 font-sans">
      
      {/* Unified Orange Trial Announcement Bar */}
      {userPlan === 'alpha_free' && (
        <div className="relative w-full border-b border-orange-100 flex items-center justify-center py-2 px-4 z-20 bg-pattern shrink-0 select-none">
          <div className="absolute inset-0 bg-white/60 pointer-events-none"></div>

          <div className="relative flex items-center justify-center gap-2 text-orange-600 font-medium text-xs sm:text-sm">
            <svg className="w-4 h-4 shrink-0 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span className="truncate max-w-[280px] xs:max-w-none">
              {remainingTrialDays > 0 
                ? `Your trial expires in ${remainingTrialDays} days.` 
                : 'Your Starter trial is over. Upgrade to keep finding candidates, exporting collections, and sharing with your team.'}
            </span>
            <Link href="/app/settings/plans" className="font-semibold underline hover:text-orange-700 ml-1 transition-colors whitespace-nowrap">Explore plans</Link>
          </div>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile Overlay backdrop */}
        {isMobileOpen && (
          <div 
            className="fixed inset-0 z-35 bg-zinc-950/40 backdrop-blur-sm md:hidden animate-in fade-in duration-200"
            onClick={() => setIsMobileOpen(false)}
          />
        )}

        {/* Sidebar navigation */}
        <aside 
          className={`fixed inset-y-0 left-0 z-40 md:relative flex flex-col border-r border-zinc-200 bg-[#FBFBFC] transition-transform md:transition-all duration-300 shrink-0 ${
            isMobileOpen ? 'translate-x-0' : '-translate-x-full'
          } md:translate-x-0 ${
            isCollapsed ? 'md:w-16' : 'lg:w-[260px] md:w-56'
          } w-[260px] md:flex h-full`}
        >
          {/* Brand Workspace Header */}
          <div className="p-3 border-b border-zinc-100 select-none">
            {isCollapsed ? (
              <button 
                onClick={() => setIsCollapsed(false)}
                className="flex h-8 w-8 mx-auto items-center justify-center rounded bg-emerald-500 text-white font-bold text-xs select-none hover:opacity-90 transition-opacity"
                title="Expand sidebar"
              >
                V
              </button>
            ) : (
              <div className="flex items-center justify-between">
                <button className="flex items-center gap-2 hover:bg-zinc-100 px-2 py-1.5 rounded-md w-full text-left font-medium transition-colors">
                  <div className="w-5 h-5 bg-emerald-500 rounded text-white flex items-center justify-center text-xs font-bold">V</div>
                  <span className="flex-1 truncate text-zinc-950 text-xs font-semibold">Vectra OS</span>
                  <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>
                <button 
                  onClick={() => setIsCollapsed(true)}
                  className="text-zinc-400 hover:text-zinc-600 ml-1 p-1 transition-colors"
                  title="Collapse sidebar"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7"></path>
                  </svg>
                </button>
              </div>
            )}
          </div>

          {/* Quick Search Shortcut Inputs */}
          {!isCollapsed && (
            <div className="px-3 py-3 space-y-2 select-none border-b border-zinc-100">
              <div className="flex gap-1">
                <button className="flex-1 flex items-center justify-between bg-white border border-zinc-200 rounded-md px-2.5 py-1.5 text-zinc-500 hover:border-zinc-300 shadow-sm text-xs transition-colors">
                  <div className="flex items-center gap-2">
                    <Search className="w-3.5 h-3.5 text-zinc-400" />
                    <span>New search</span>
                  </div>
                  <span className="bg-zinc-100 text-zinc-500 px-1.5 py-0.5 rounded text-[10px] font-medium border border-zinc-200 shadow-sm">⌘ K</span>
                </button>
                <button className="flex items-center justify-center bg-white border border-zinc-200 rounded-md w-8 h-8 text-zinc-500 hover:border-zinc-300 shadow-sm transition-colors">
                  <span className="bg-zinc-100 text-zinc-500 px-1.5 py-0.5 rounded text-[10px] font-medium border border-zinc-200 shadow-sm">⌘ /</span>
                </button>
              </div>
            </div>
          )}

          {/* Nav Navigation List */}
          <nav className="flex-1 space-y-0.5 px-3 py-2 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  id={`sidebar-nav-${item.name.toLowerCase()}`}
                  className={`flex items-center gap-3 rounded-md px-2 py-1.5 text-sm font-medium transition-colors select-none ${
                    isActive 
                      ? 'bg-zinc-200/60 text-zinc-900 font-medium' 
                      : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
                  }`}
                  title={isCollapsed ? item.name : undefined}
                >
                  <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-zinc-800' : 'text-zinc-400'}`} />
                  {!isCollapsed && <span>{item.name}</span>}
                </Link>
              );
            })}

            {/* Collections foldable lists */}
            {!isCollapsed && (
              <div className="pt-6 pb-2">
                <div className="flex items-center justify-between px-2 text-xs font-semibold text-zinc-500 hover:text-zinc-700 transition-colors group cursor-pointer">
                  <span className="flex items-center gap-1.5">
                    Collections
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </span>
                  <Plus 
                    onClick={() => setShowCreateModal(true)} 
                    className="h-4 w-4 text-zinc-400 hover:text-zinc-950 hover:scale-110 transition-all cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-200" 
                  />
                </div>
                <div className="mt-2">
                  <React.Suspense fallback={<p className="text-[10px] text-zinc-400 italic px-3">Loading...</p>}>
                    <CollectionsList collections={collections} pathname={pathname} />
                  </React.Suspense>
                </div>
              </div>
            )}
          </nav>

          {/* Bottom Widgets & Account Section */}
          <div className="p-3 border-t border-zinc-200/60 space-y-1 bg-[#FBFBFC] shrink-0">

            {/* Monthly Credits Balance widget */}
            {!isCollapsed && (
              <div className={`flex items-center justify-between text-xs px-2 select-none border border-transparent transition-all duration-500 rounded-lg ${
                creditsFlash
                  ? 'bg-primary/5 border-primary/20 text-primary scale-[1.02] py-1.5 shadow-sm'
                  : 'pb-2'
              }`}>
                <div className="flex items-center gap-2 text-zinc-500 font-medium">
                  <Coins className={`h-4 w-4 shrink-0 transition-all duration-300 ${
                    creditsFlash ? 'text-primary scale-110' : 'text-amber-500'
                  }`} />
                  <span className={creditsFlash ? 'text-primary font-bold' : ''}>Monthly Credits</span>
                </div>
                <span className={`font-extrabold transition-all duration-300 ${
                  creditsFlash ? 'text-primary scale-105 text-sm' : 'text-zinc-800'
                }`}>
                  {creditsCount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                </span>
              </div>
            )}

            {/* Trial Progress Bar Widget */}
            {userPlan === 'alpha_free' && (!isCollapsed ? (
              <div className="relative overflow-hidden mb-3 p-3 rounded-lg border border-orange-100 shadow-sm bg-white select-none">
                <div className="absolute inset-0 bg-pattern opacity-30 pointer-events-none"></div>
                <div className="absolute top-0 left-0 w-full h-8 bg-gradient-to-b from-green-50/50 to-transparent pointer-events-none"></div>

                <div className="relative z-10 space-y-2">
                  <h4 className="font-medium text-zinc-900 text-xs leading-none">
                    {remainingTrialDays > 0 
                      ? `Trial ends in ${remainingTrialDays} days` 
                      : 'Your Starter trial is complete'}
                  </h4>
                  <p className="text-zinc-500 text-[11px] leading-tight">
                    {remainingTrialDays > 0 
                      ? 'You are on a 14-day free trial. Upgrade to continue using premium features.' 
                      : "You've used all 14 days of your trial, upgrade to continue using all features."}
                  </p>

                  <div className="w-full bg-zinc-100 rounded-full h-1.5 overflow-hidden border border-zinc-200/50">
                    <div 
                      className="bg-gradient-to-r from-orange-400 to-orange-500 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${Math.max(0, Math.min(100, ((14 - remainingTrialDays) / 14) * 100))}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ) : (
              <div
                className="flex justify-center h-8 w-8 items-center rounded-lg bg-orange-50 text-orange-700 border border-orange-200 text-[10px] font-extrabold mx-auto cursor-help mb-2"
                title={remainingTrialDays > 0 
                  ? `Trial ends in ${remainingTrialDays} days` 
                  : "Your Starter trial is complete. Upgrade to continue."}
              >
                {Math.max(0, Math.min(100, Math.round(((14 - remainingTrialDays) / 14) * 100)))}%
              </div>
            ))}
            {isCollapsed ? (
              <div className="flex flex-col items-center gap-3 pb-2 pt-1 border-t border-zinc-150">
                <NotificationDropdown />
                <div className="relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="h-8 w-8 rounded-lg bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold text-xs hover:bg-zinc-100 transition-colors"
                  >
                  </button>
                  <ProfileDropdown 
                    isOpen={isProfileOpen}
                    onClose={() => setIsProfileOpen(false)}
                    userEmail={userEmail}
                    onSignOut={handleSignOut}
                    creditsCount={creditsCount}
                    creditsLimit={creditsLimit}
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 pt-2 border-t border-zinc-100">
                <div className="flex-1 relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="w-full flex items-center justify-between rounded-xl p-1.5 text-left hover:bg-zinc-100/80 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold text-xs shrink-0 select-none">
                        {userEmail ? userEmail.slice(0, 2).toUpperCase() : 'KB'}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold text-zinc-700 truncate capitalize">
                          {userEmail ? userEmail.split('@')[0] : 'Mon compte'}
                        </span>
                        <span className="text-[10px] text-zinc-400 truncate">
                          {userEmail || 'user@vectra.ai'}
                        </span>
                      </div>
                    </div>
                    <ChevronDown className="h-4 w-4 text-zinc-400 shrink-0" />
                  </button>

                  <ProfileDropdown 
                    isOpen={isProfileOpen}
                    onClose={() => setIsProfileOpen(false)}
                    userEmail={userEmail}
                    onSignOut={handleSignOut}
                    creditsCount={creditsCount}
                    creditsLimit={creditsLimit}
                  />
                </div>
                <div className="shrink-0">
                  <NotificationDropdown />
                </div>
              </div>
            )}

          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-grow flex-1 flex flex-col h-full overflow-hidden bg-zinc-50 relative">
          {/* Universal Mobile Header */}
          <div className="md:hidden flex h-14 items-center justify-between px-4 border-b border-zinc-200 bg-white select-none shrink-0">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMobileOpen(true)}
                className="p-2 -ml-2 rounded-xl text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 transition-all focus:outline-none"
                aria-label="Open menu"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                </svg>
              </button>
              <div className="w-6 h-6 bg-emerald-500 rounded text-white flex items-center justify-center text-xs font-bold">V</div>
              <span className="text-xs font-bold text-zinc-800">Vectra OS</span>
            </div>
            <div className="flex items-center gap-2">
              <NotificationDropdown />
            </div>
          </div>
          {children}
        </main>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white border border-zinc-200 rounded-2xl p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200 mx-4">
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-zinc-900">Créer une nouvelle collection</h3>
              <p className="text-xs text-zinc-400">Regroupez vos leads qualifiés dans des dossiers spécifiques pour vos campagnes.</p>
            </div>
            
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-sans">Nom de la collection</label>
                <input 
                  type="text"
                  placeholder="Ex: SaaS Founders - Canada"
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  className="w-full h-9 rounded-lg border border-zinc-200 px-3 text-xs bg-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-sans">Description (Optionnelle)</label>
                <textarea 
                  placeholder="Ex: Cibles prioritaires identifiées via Sourcing Copilot"
                  value={newCollectionDescription}
                  onChange={(e) => setNewCollectionDescription(e.target.value)}
                  className="w-full h-16 rounded-lg border border-zinc-200 p-3 text-xs bg-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  setShowCreateModal(false);
                  setNewCollectionName('');
                  setNewCollectionDescription('');
                }}
                className="h-8 text-xs font-bold border-zinc-200 hover:bg-zinc-50"
              >
                Annuler
              </Button>
              <Button 
                size="sm" 
                onClick={handleCreateCollection}
                disabled={!newCollectionName.trim()}
                className="bg-primary hover:bg-primary/95 text-white h-8 text-xs font-bold"
              >
                Créer la collection
              </Button>
            </div>
          </div>
        </div>
      )}

      {showTour && <TourGuide onClose={handleTourClose} />}

      {/* Credits Exhausted Blocker Overlay */}
      {isCreditsExhausted && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-zinc-950/80 backdrop-blur-xl p-4 text-center select-none animate-in fade-in duration-500">
          <div className="relative max-w-md w-full bg-zinc-900/60 border border-zinc-800 rounded-3xl p-8 shadow-2xl backdrop-blur-md space-y-6">
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 bg-emerald-500/20 border border-emerald-500/30 rounded-2xl flex items-center justify-center animate-bounce shadow-xl">
              <Coins className="h-10 w-10 text-emerald-400" />
            </div>
            
            <div className="pt-8 space-y-2">
              <h2 className="text-2xl font-extrabold text-white tracking-tight">Crédits épuisés ! ⚡</h2>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Vous avez utilisé l'intégralité de vos crédits gratuits pour ce mois. Passez au plan supérieur pour continuer à utiliser Vectra AI sans interruption.
              </p>
            </div>

            <div className="bg-zinc-800/40 rounded-2xl p-4 border border-zinc-800/50 flex justify-between items-center text-left">
              <div>
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Votre plan actuel</p>
                <p className="text-sm font-bold text-zinc-200">Alpha Free (0 crédit restant)</p>
              </div>
              <span className="bg-emerald-500/10 text-emerald-400 text-xs px-2.5 py-1 rounded-full font-bold border border-emerald-500/20">
                Starter
              </span>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <Link href="/app/settings/plans" className="w-full">
                <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-bold h-12 rounded-xl shadow-lg shadow-emerald-500/20 transition-all transform hover:scale-[1.01]">
                  Mettre à niveau mon compte
                </Button>
              </Link>
              <button 
                onClick={handleSignOut}
                className="text-xs text-zinc-500 hover:text-zinc-300 font-semibold py-2 transition-colors"
              >
                Se déconnecter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
