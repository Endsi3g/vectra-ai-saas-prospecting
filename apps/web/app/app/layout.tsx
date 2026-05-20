'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@workspace/ui/components/button';
import { supabase } from '@/lib/supabase';
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
  ChevronDown
} from 'lucide-react';
import TourGuide from '@/components/TourGuide';
import ProfileDropdown from '@/components/ProfileDropdown';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [showTour, setShowTour] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [userEmail, setUserEmail] = useState<string>('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [creditsCount, setCreditsCount] = useState<number>(2000);
  const [creditsLimit, setCreditsLimit] = useState<number>(2000);

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
      name: 'Agents',
      href: '#',
      icon: Bot,
    },
  ];

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
                className="w-full h-8 rounded-lg border border-zinc-200 bg-[#FAFAFA] pl-8 pr-10 text-[11px] text-zinc-500 placeholder-zinc-400 focus-visible:outline-none cursor-pointer hover:bg-zinc-100/50 transition-all"
              />
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-400" />
              <div className="absolute right-2 top-1.5 flex gap-0.5 items-center select-none text-[8px] font-bold text-zinc-400 bg-zinc-200/50 px-1 py-0.5 rounded">
                <span>⌘</span>
                <span>K</span>
              </div>
            </div>

            {/* Quick action button */}
            <button className="w-full h-8 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 flex items-center justify-between px-3 text-[11px] text-zinc-600 font-bold transition-all shadow-sm">
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
                <Plus className="h-3.5 w-3.5 text-zinc-400 hover:text-zinc-600 cursor-pointer" />
              </div>
              <p className="text-[10px] text-zinc-400 italic px-3">No collections added yet</p>
            </div>
          )}
        </nav>

        {/* Bottom Widgets & Account Section */}
        <div className="p-3 border-t border-zinc-100 space-y-3 bg-[#FAFAFA]/50 shrink-0">
          
          {/* Monthly Credits Balance widget */}
          {!isCollapsed && (
            <div className="flex items-center justify-between text-xs px-2 select-none border-b border-zinc-100 pb-2">
              <div className="flex items-center gap-2 text-zinc-500 font-medium">
                <Coins className="h-4 w-4 text-amber-500 shrink-0" />
                <span>Monthly Credits</span>
              </div>
              <span className="font-extrabold text-zinc-800">{creditsCount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</span>
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
              <p className="text-[9px] text-zinc-400 leading-normal">
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
                <div className="h-8 w-8 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold text-xs shrink-0 select-none">
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

      {showTour && <TourGuide onClose={handleTourClose} />}
    </div>
  );
}
