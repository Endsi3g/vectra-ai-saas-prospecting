'use client';

import React, { useState } from 'react';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { UserPlus, Link2, MoreHorizontal, Check, RefreshCw, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Member {
  id: string;
  name: string;
  email: string;
  role: string;
  connectionsSynced: string;
  isViewer: boolean;
}

export default function MembersPage() {
  const [emailInput, setEmailInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState('');
  const [inviteSuccess, setInviteSuccess] = useState('');
  const [members, setMembers] = useState<Member[]>([]);

  React.useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setMembers([{
          id: 'default-1',
          name: user.email?.split('@')[0] || 'Admin',
          email: user.email || '',
          role: 'Admin',
          connectionsSynced: 'No connections synced',
          isViewer: false
        }]);
      }
    });
  }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim() || !emailInput.includes('@')) return;

    setInviteLoading(true);
    setInviteError('');
    setInviteSuccess('');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/team/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {})
        },
        body: JSON.stringify({ email: emailInput, role: 'member' })
      });
      const data = await res.json();

      if (!res.ok) {
        setInviteError(data.error || 'Échec de l\'invitation');
      } else {
        setInviteSuccess(`Invitation envoyée à ${emailInput}`);
        setMembers(prev => [...prev, {
          id: `member-${Date.now()}`,
          name: emailInput.split('@')[0] || '',
          email: emailInput,
          role: 'Member',
          connectionsSynced: 'No connections synced',
          isViewer: true
        }]);
        setEmailInput('');
      }
    } catch {
      setInviteError('Erreur réseau. Réessayez.');
    } finally {
      setInviteLoading(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText('https://vectra.ai/join/workspace-kael-invite');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleViewer = (id: string) => {
    setMembers(prev => prev.map(m => {
      if (m.id === id) {
        const nextViewer = !m.isViewer;
        return {
          ...m,
          isViewer: nextViewer,
          role: nextViewer ? 'Viewer' : m.id === 'default-1' ? 'Admin' : 'Member'
        };
      }
      return m;
    }));
  };

  const removeMember = (id: string) => {
    if (id === 'default-1') return; // Cannot delete admin
    setMembers(prev => prev.filter(m => m.id !== id));
  };

  return (
    <div className="p-10 bg-white">
      <div className="max-w-4xl space-y-10">
        {/* Title Block */}
        <div>
          <h1 className="text-2xl font-extrabold text-zinc-900 tracking-tight">Team Members</h1>
          <p className="text-sm text-zinc-400 font-medium mt-1">
            Invite new members, manage roles, and assign seats
          </p>
        </div>

        {/* Section Invite Members */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-zinc-800 uppercase tracking-wider">Invite Members</h2>
          <form onSubmit={handleInvite} className="flex items-center gap-3 max-w-2xl">
            <div className="flex-1">
              <Input
                type="email"
                placeholder="Enter email address"
                value={emailInput}
                onChange={(e) => { setEmailInput(e.target.value); setInviteError(''); setInviteSuccess(''); }}
                className="h-10 text-xs border-zinc-200 bg-white rounded-lg focus-visible:ring-1 focus-visible:ring-primary placeholder-zinc-400 text-zinc-800"
              />
            </div>
            <Button
              type="submit"
              disabled={inviteLoading}
              className="h-10 px-6 bg-[#5FC890] hover:bg-[#4eb67e] text-white text-xs font-bold rounded-lg shrink-0 transition-colors flex items-center gap-1.5"
            >
              {inviteLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Invite
            </Button>
            <Button
              type="button"
              onClick={handleCopyLink}
              variant="outline"
              className="h-10 px-4 border-zinc-200 text-zinc-600 text-xs font-bold rounded-lg shrink-0 flex items-center gap-1.5 hover:bg-zinc-50"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <span>Copy join link</span>
                </>
              )}
            </Button>
          </form>
          {inviteError && <p className="text-xs text-red-600 font-medium">{inviteError}</p>}
          {inviteSuccess && <p className="text-xs text-emerald-600 font-medium">{inviteSuccess}</p>}
        </div>

        {/* Section Members List */}
        <div className="space-y-4 pt-4">
          <h2 className="text-sm font-bold text-zinc-800 uppercase tracking-wider">Members</h2>
          
          <div className="border border-zinc-200 rounded-xl divide-y divide-zinc-150 overflow-hidden max-w-4xl">
            {members.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-4 bg-white hover:bg-zinc-50/50 transition-colors">
                {/* Avatar and Info */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-9 w-9 rounded-full bg-zinc-100 flex items-center justify-center text-xs font-extrabold text-zinc-700 select-none uppercase shrink-0">
                    {member.name.slice(0, 2)}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-zinc-800 capitalize truncate">{member.name}</span>
                    <span className="text-[11px] text-zinc-400 truncate">{member.email}</span>
                  </div>
                </div>

                {/* Role badge / label */}
                <div className="text-xs font-bold text-zinc-600 min-w-[70px] select-none text-center">
                  {member.role}
                </div>

                {/* Connection Sync Status */}
                <div className="text-xs font-semibold text-zinc-400 select-none hidden md:block">
                  {member.connectionsSynced}
                </div>

                {/* Toggle switch for Viewer */}
                <div className="flex items-center gap-2 select-none">
                  <span className="text-xs font-bold text-zinc-500">Viewer</span>
                  <button
                    onClick={() => toggleViewer(member.id)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      member.isViewer ? 'bg-[#5FC890]' : 'bg-zinc-200'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        member.isViewer ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Action dropdown or delete */}
                <div className="flex items-center gap-1.5">
                  {member.id !== 'default-1' ? (
                    <button
                      onClick={() => removeMember(member.id)}
                      className="text-[10px] text-red-500 font-bold hover:underline px-2"
                    >
                      Delete
                    </button>
                  ) : (
                    <button className="h-8 w-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50 transition-colors">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
