'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { MessageSquare, Coins, ChevronRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import NotificationDropdown from '@/components/NotificationDropdown';

export default function SettingsSubLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [userEmail, setUserEmail] = useState<string>('');
  const [creditsCount, setCreditsCount] = useState<number>(2000);

  useEffect(() => {
    const fetchUserAndProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserEmail(user.email || '');
          const { data: profile } = await supabase
            .from('profiles')
            .select('credits_count')
            .eq('id', user.id)
            .single();
          if (profile && profile.credits_count !== undefined && profile.credits_count !== null) {
            setCreditsCount(profile.credits_count);
          }
        }
      } catch (err) {
        console.error('Error fetching settings layout user info:', err);
      }
    };
    fetchUserAndProfile();
  }, [pathname]);

  // Determine current page tab name for breadcrumbs
  let pageName = 'Connections';
  if (pathname.includes('/integrations')) pageName = 'Integrations';
  else if (pathname.includes('/mailboxes')) pageName = 'Mailboxes';
  else if (pathname.includes('/plans')) pageName = 'Plans';
  else if (pathname.includes('/members')) pageName = 'Members';
  else if (pathname.includes('/branding')) pageName = 'Branding';
  else if (pathname.includes('/referrals')) pageName = 'Referrals';
  else if (pathname.includes('/api-mcp')) pageName = 'API/MCP';
  else if (pathname.includes('/brevo')) pageName = 'Brevo';

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white">
      {/* Top Header Row */}
      <header className="h-14 border-b border-zinc-150 flex items-center justify-between px-4 sm:px-6 shrink-0 bg-white">
        {/* Breadcrumb breadcrumbs */}
        <div className="flex items-center gap-2 text-xs text-zinc-500 font-bold select-none">
          <button
            onClick={() => window.dispatchEvent(new Event('vectra-toggle-sidebar'))}
            className="md:hidden p-1.5 -ml-1 rounded-lg text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 transition-all focus:outline-none shrink-0"
            aria-label="Open settings menu"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
          <span className="hover:text-zinc-800 cursor-pointer hidden xs:inline">Settings</span>
          <ChevronRight className="h-3 w-3 text-zinc-300 hidden xs:inline" />
          <span className="text-zinc-800 font-extrabold">{pageName}</span>
        </div>

        {/* Right side tools */}
        <div className="flex items-center gap-4">
          {/* Notification bell button */}
          <NotificationDropdown />

          {/* Ask Button */}
          <button className="h-8 rounded-lg flex items-center gap-2 px-3 border border-zinc-200 bg-white hover:bg-zinc-50 text-xs font-bold text-zinc-700 transition-colors">
            <MessageSquare className="h-3.5 w-3.5 text-zinc-400" />
            <span>Ask</span>
          </button>

          {/* Coin / Credit pill indicator */}
          <div className="h-8 rounded-lg flex items-center gap-2 px-3 border border-zinc-200 bg-white text-xs font-bold text-zinc-700 select-none">
            <Coins className="h-4 w-4 text-amber-500" />
            <span>{creditsCount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")}</span>
          </div>

          {/* Avatar avatar */}
          <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-extrabold text-primary select-none cursor-pointer" title={userEmail}>
            {userEmail ? userEmail.slice(0, 2).toUpperCase() : 'KB'}
          </div>
        </div>
      </header>

      {/* Main Content Area container */}
      <div className="flex-1 overflow-y-auto bg-white">
        {children}
      </div>
    </div>
  );
}
