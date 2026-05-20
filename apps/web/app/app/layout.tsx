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
  PhoneCall
} from 'lucide-react';
import TourGuide from '@/components/TourGuide';
import ProfileDropdown from '@/components/ProfileDropdown';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeCollectionId = searchParams ? searchParams.get('collection') : null;

  const [showTour, setShowTour] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [userEmail, setUserEmail] = useState<string>('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [creditsCount, setCreditsCount] = useState<number>(2000);
  const [creditsLimit, setCreditsLimit] = useState<number>(2000);

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

    window.addEventListener('vectra-collections-updated', handleCollectionsUpdate);
    window.addEventListener('vectra-credits-updated', handleCreditsUpdate);

    return () => {
      window.removeEventListener('vectra-collections-updated', handleCollectionsUpdate);
      window.removeEventListener('vectra-credits-updated', handleCreditsUpdate);
    };
  }, []);

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
            .select('tour_completed, credits_count, credits_limit')
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

    const setupRealtime = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        channel = supabase
          .channel(`profile-layout-${user.id}`)
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
              }
            }
          )
          .subscribe();
      }
    };
    setupRealtime();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
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
        {/* Top green trial banner */}
        <div className="h-9 w-full flex items-center justify-center bg-primary/5 text-primary text-xs font-semibold border-b border-primary/15 shrink-0 select-none">
          <span className="flex items-center gap-1.5">
            <span>You have 5 more searches on your Starter trial.</span>
            <Link href="/app/settings/plans" className="underline font-bold hover:opacity-80 ml-1">Explore plans</Link>
          </span>
        </div>

        {/* Lower container containing Sidebar and Main Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Settings Sidebar */}
          <aside className="w-60 flex flex-col border-r border-zinc-200 bg-white shrink-0">
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
            {children}
          </main>
        </div>

        {showTour && <TourGuide onClose={handleTourClose} />}
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-zinc-50 select-none text-zinc-950 font-sans">
      
      {/* Sidebar navigation */}
      <aside 
        className={`flex flex-col border-r border-zinc-200 bg-white transition-all duration-300 shrink-0 relative ${
          isCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        {/* Brand Workspace Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-zinc-100">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-white font-extrabold text-sm shadow-sm select-none">
              W
            </div>
            {!isCollapsed && (
              <div className="flex flex-col min-w-0 select-none">
                <span className="font-extrabold text-zinc-950 text-sm tracking-tight truncate leading-none">
                  Kael's Workspace
                </span>
                <span className="text-[10px] text-zinc-400 font-medium truncate mt-0.5">
                  Building Search
                </span>
              </div>
            )}
          </div>
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex h-6 w-6 items-center justify-center rounded-md border border-zinc-200 bg-zinc-50 text-zinc-500 hover:bg-zinc-100"
          >
            {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
          </button>
        </div>

        {/* Quick Search Shortcut Inputs */}
        {!isCollapsed && (
          <div className="px-3 py-3 space-y-2 select-none border-b border-zinc-100">
            {/* Quick search input */}
            <div className="relative">
              <input
                type="text"
                placeholder="New search"
                readOnly
                className="w-full h-8 rounded-lg border border-zinc-200 bg-zinc-50 pl-8 pr-10 text-xs text-zinc-500 placeholder-zinc-400 focus-visible:outline-none cursor-pointer hover:bg-zinc-100/50 transition-all"
              />
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-400" />
              <div className="absolute right-2 top-1.5 flex gap-0.5 items-center select-none text-[8px] font-bold text-zinc-400 bg-zinc-200/50 px-1 py-0.5 rounded">
                <span>⌘</span>
                <span>K</span>
              </div>
            </div>

            {/* Quick action button */}
            <button className="w-full h-8 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 flex items-center justify-between px-3 text-xs text-zinc-600 font-bold transition-all shadow-sm">
              <span className="flex items-center gap-2">
                <Search className="h-3.5 w-3.5 text-zinc-400 animate-pulse" />
                <span>Search</span>
              </span>
              <div className="flex gap-0.5 items-center select-none text-[8px] font-bold text-zinc-400 bg-zinc-100 border border-zinc-200 px-1 py-0.5 rounded">
                <span>⌘</span>
                <span>/</span>
              </div>
            </button>
          </div>
        )}

        {/* Nav Navigation List */}
        <nav className="flex-1 space-y-1 px-2 py-3 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                id={`sidebar-nav-${item.name.toLowerCase()}`}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-bold transition-colors select-none ${
                  isActive 
                    ? 'bg-primary/10 text-primary' 
                    : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
                }`}
                title={isCollapsed ? item.name : undefined}
              >
                <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-primary' : 'text-zinc-400'}`} />
                {!isCollapsed && <span>{item.name}</span>}
              </Link>
            );
          })}

          {/* Collections foldable lists */}
          {!isCollapsed && (
            <div className="pt-4 border-t border-zinc-100 space-y-2">
              <div className="flex items-center justify-between px-3 text-[10px] font-bold text-zinc-400 uppercase tracking-wider select-none">
                <span>Collections</span>
                <Plus 
                  onClick={() => setShowCreateModal(true)} 
                  className="h-3.5 w-3.5 text-zinc-400 hover:text-zinc-950 hover:scale-110 transition-transform cursor-pointer" 
                />
              </div>
              {collections.length === 0 ? (
                <p className="text-[10px] text-zinc-400 italic px-3">No collections added yet</p>
              ) : (
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
              )}
            </div>
          )}
        </nav>

        {/* Bottom Widgets & Account Section */}
        <div className="p-3 border-t border-zinc-100 space-y-3 bg-zinc-50/50 shrink-0">

          {/* Monthly Credits Balance widget */}
          {!isCollapsed && (
            <div className={`flex items-center justify-between text-xs px-2 select-none border border-transparent transition-all duration-500 rounded-lg ${
              creditsFlash
                ? 'bg-primary/5 border-primary/20 text-primary scale-[1.02] py-1.5 shadow-sm'
                : 'border-b border-zinc-100 pb-2'
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
          {!isCollapsed ? (
            <div className="rounded-xl bg-white border border-zinc-200/80 p-3 shadow-sm space-y-2 select-none">
              <div className="flex justify-between items-center text-[10px] font-bold text-zinc-600">
                <span>Trial Active (Starter)</span>
                <span className="text-primary">14 days left</span>
              </div>
              <div className="w-full bg-zinc-100 rounded-full h-1.5">
                <div className="bg-primary h-1.5 rounded-full w-[80%]" />
              </div>
              <p className="text-[10px] text-zinc-400 leading-normal">
                Upgrade to scale campaigns and unlock unlimited credits.
              </p>
            </div>
          ) : (
            <div 
              className="flex justify-center h-8 w-8 items-center rounded-lg bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-extrabold mx-auto cursor-help"
              title={`${creditsCount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} monthly credits & trial active`}
            >
              {creditsCount >= 1000 ? Math.floor(creditsCount / 1000) + 'K' : creditsCount}
            </div>
          )}

          {/* User profile dropdown triggers */}
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="w-full flex items-center justify-between rounded-xl p-1.5 text-left hover:bg-zinc-100/80 transition-colors"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold text-xs shrink-0 select-none">
                  {userEmail ? userEmail.slice(0, 2).toUpperCase() : 'KB'}
                </div>
                {!isCollapsed && (
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-zinc-700 truncate capitalize">
                      {userEmail ? userEmail.split('@')[0] : 'Kael Belceus'}
                    </span>
                    <span className="text-[10px] text-zinc-400 truncate">
                      {userEmail || 'kael@wrangle.com'}
                    </span>
                  </div>
                )}
              </div>
              {!isCollapsed && (
                <ChevronDown className="h-4 w-4 text-zinc-400 shrink-0" />
              )}
            </button>

            {/* Profile Dropdown Popover */}
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
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-zinc-50">
        {children}
      </main>

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
    </div>
  );
}
