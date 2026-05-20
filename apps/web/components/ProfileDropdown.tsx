'use client';

import React, { useRef, useEffect } from 'react';
import { 
  User, 
  Settings, 
  LogOut, 
  HelpCircle, 
  Moon, 
  Sparkles, 
  ChevronRight, 
  Coins 
} from 'lucide-react';

interface ProfileDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
  onSignOut: () => void;
  creditsCount?: number;
  creditsLimit?: number;
}

export default function ProfileDropdown({ 
  isOpen, 
  onClose, 
  userEmail, 
  onSignOut,
  creditsCount = 2000,
  creditsLimit = 2000
}: ProfileDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const userInitials = userEmail ? userEmail.slice(0, 2).toUpperCase() : 'KB';
  const userName = userEmail ? userEmail.split('@')[0] : 'Kael Belceus';

  return (
    <div 
      ref={dropdownRef}
      className="absolute bottom-16 left-4 w-72 rounded-2xl border border-zinc-200 bg-white/95 p-4 shadow-2xl backdrop-blur-md transition-all duration-300 z-[99] animate-fade-in"
    >
      {/* Profile Header */}
      <div className="flex items-center gap-3 border-b border-zinc-100 pb-3">
        <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0 border border-primary/20">
          {userInitials}
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-xs font-extrabold text-zinc-900 truncate capitalize">{userName}</span>
          <span className="text-[10px] text-zinc-400 truncate mt-0.5">{userEmail || 'kael@wrangle.com'}</span>
        </div>
      </div>

      {/* Subscription Status Widget */}
      <div className="py-3 border-b border-zinc-100 space-y-3">
        
        {/* Tier Upgrade block */}
        <div className="flex items-center justify-between bg-zinc-50 border border-zinc-200/60 p-2.5 rounded-xl">
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">Current plan</span>
            <span className="text-xs font-bold text-zinc-800">Trial (Starter)</span>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[10px] px-2.5 py-1.5 rounded-lg shadow-sm transition-all">
            Upgrade
          </button>
        </div>

        <div className="flex items-center justify-between text-xs px-1">
          <div className="flex items-center gap-2 text-zinc-600 font-medium">
            <Coins className="h-4 w-4 text-amber-500 shrink-0" />
            <span>Monthly Credits</span>
          </div>
          <span className="font-bold text-zinc-800">{creditsCount.toLocaleString()} credits</span>
        </div>

      </div>

      {/* Action Links */}
      <div className="py-2 border-b border-zinc-100 space-y-1">
        
        <button className="w-full flex items-center justify-between rounded-lg px-2.5 py-2 text-xs text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 transition-colors">
          <div className="flex items-center gap-2.5 font-medium">
            <HelpCircle className="h-4 w-4 text-zinc-400" />
            <span>Get help &amp; docs</span>
          </div>
          <ChevronRight className="h-3 w-3 text-zinc-300" />
        </button>

        <button className="w-full flex items-center justify-between rounded-lg px-2.5 py-2 text-xs text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 transition-colors">
          <div className="flex items-center gap-2.5 font-medium">
            <Moon className="h-4 w-4 text-zinc-400" />
            <span>Dark mode</span>
          </div>
          <span className="text-[10px] text-zinc-400 bg-zinc-100 px-1.5 py-0.5 rounded font-bold uppercase">Off</span>
        </button>

        <button className="w-full flex items-center justify-between rounded-lg px-2.5 py-2 text-xs text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 transition-colors">
          <div className="flex items-center gap-2.5 font-medium">
            <Settings className="h-4 w-4 text-zinc-400" />
            <span>Manage account</span>
          </div>
          <ChevronRight className="h-3 w-3 text-zinc-300" />
        </button>

      </div>

      {/* Logout Action */}
      <div className="pt-2">
        <button 
          onClick={onSignOut}
          className="w-full flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors"
        >
          <LogOut className="h-4 w-4 text-rose-400" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Footer copyright */}
      <div className="mt-3 text-center text-[9px] text-zinc-300 select-none">
        Vectra &middot; v1.0.1
      </div>

    </div>
  );
}
