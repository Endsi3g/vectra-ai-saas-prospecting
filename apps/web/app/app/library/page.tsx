'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Badge } from '@workspace/ui/components/badge';
import { Card, CardContent } from '@workspace/ui/components/card';
import { 
  Globe, 
  Share2, 
  Plus, 
  Check, 
  UserPlus, 
  Copy, 
  Lock, 
  ShieldAlert, 
  Upload, 
  ChevronRight,
  Database
} from 'lucide-react';

const LinkedinIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={props.className}
    {...props}
  >
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
  </svg>
);

export default function LibraryPage() {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [privacy, setPrivacy] = useState('link_search');
  const [inviteUrl] = useState('https://wrangle.ai/invite/network-kael-821');

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white text-zinc-950 font-sans">
      
      {/* Header */}
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-zinc-200 bg-white px-6">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-zinc-500 select-none">
          <span className="hover:text-zinc-950 cursor-pointer transition-colors" onClick={() => router.push('/app')}>Library</span>
          <span className="text-zinc-300 font-normal">/</span>
          <span className="font-semibold text-zinc-900 truncate max-w-[240px]">
            Kael's Shared Network
          </span>
          <Badge variant="outline" className="ml-2 bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
            Active
          </Badge>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 border-zinc-200 hover:bg-zinc-50">
            <Globe className="h-3.5 w-3.5 text-zinc-500" />
            Sources
          </Button>

          <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 border-zinc-200 hover:bg-zinc-50">
            <Share2 className="h-3.5 w-3.5 text-zinc-500" />
            Share
          </Button>

          <Button 
            onClick={() => router.push('/app/sourcing')}
            className="bg-primary hover:bg-primary/95 text-white h-8 text-xs font-bold gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            New search
          </Button>
        </div>

      </header>

      {/* Main split window content */}
      <div className="flex-1 flex overflow-hidden bg-[#FAFAFA]">
        
        {/* Left Side: Networks list, Connected Accounts, Members Table, and Dropzone */}
        <div className="flex-grow overflow-y-auto p-8 space-y-6">
          
          {/* Add Network Intro Box */}
          <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm space-y-3">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-lg bg-emerald-50 text-primary flex items-center justify-center shrink-0">
                <UserPlus className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-zinc-900">Add Networks to Expand Search</h3>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Invite your team, advisors, and founders to sync their professional LinkedIn networks. 
                  This aggregates your connections into a shared pool, allowing the sourcing agent to search candidates and find warm introductions.
                </p>
              </div>
            </div>
          </div>

          {/* Linked professional account list */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Connected Professional Accounts</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border-zinc-200 shadow-sm">
                <CardContent className="p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-50 text-[#0A66C2] flex items-center justify-center font-bold text-sm shrink-0">
                      <LinkedinIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-zinc-900 block">Kael Belceus (You)</span>
                      <span className="text-[10px] text-zinc-400 block mt-0.5">LinkedIn Profile Sync &middot; Connected today</span>
                    </div>
                  </div>
                  <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-emerald-200 text-[10px]">
                    Active
                  </Badge>
                </CardContent>
              </Card>

              {/* Placeholder for adding network connection */}
              <div className="border border-dashed border-zinc-300 rounded-xl bg-white p-4 flex items-center justify-center text-center cursor-pointer hover:border-primary hover:bg-zinc-50/50 transition-all select-none">
                <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-primary">
                  <Plus className="h-4 w-4" />
                  <span>Link another LinkedIn Profile</span>
                </div>
              </div>
            </div>
          </div>

          {/* Org Members Network Reach Table */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Organization Member Reach</h4>
            <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-100 bg-zinc-50/50 text-[10px] font-bold text-zinc-400 uppercase tracking-wider select-none">
                    <th className="py-3 px-4">Member Name</th>
                    <th className="py-3 px-4">Linked Accounts</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Reach</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 text-xs text-zinc-700">
                  <tr>
                    <td className="py-3 px-4 font-bold text-zinc-900 flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[10px]">
                        KB
                      </div>
                      Kael Belceus (Admin)
                    </td>
                    <td className="py-3 px-4 text-zinc-500">1 LinkedIn Connection</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500 mr-1.5" />
                      Synced
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-zinc-800">1,240 contacts</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Qualified Candidates Section & Dropzone */}
          <div id="library-database-container" className="space-y-3">
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Qualified Candidates Database</h4>
            <div className="bg-white border border-zinc-200 rounded-xl p-8 shadow-sm flex flex-col items-center justify-center text-center">
              
              <div className="h-12 w-12 rounded-full bg-zinc-100 flex items-center justify-center mb-4">
                <Database className="h-6 w-6 text-zinc-400" />
              </div>
              
              <h5 className="text-sm font-bold text-zinc-800">No candidates added yet</h5>
              <p className="text-xs text-zinc-400 max-w-sm mt-1 mb-6 leading-relaxed">
                Your database is empty. Sieve matching profiles using Sourcing Copilot or drop an existing candidates spreadsheet.
              </p>

              {/* Upload Dropzone */}
              <div className="w-full max-w-md border-2 border-dashed border-zinc-200 rounded-lg p-5 hover:bg-zinc-50 cursor-pointer transition-colors flex flex-col items-center gap-2">
                <Upload className="h-6 w-6 text-zinc-400" />
                <span className="text-xs font-bold text-zinc-700">Drop candidates CSV here to import</span>
                <span className="text-[10px] text-zinc-400">Accepts standard name, company, email layouts.</span>
              </div>

            </div>
          </div>

        </div>

        {/* Right Side: Network configurations context settings panel */}
        <div className="hidden lg:flex w-80 border-l border-zinc-200 bg-white flex-col shrink-0 p-6 space-y-6">
          
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-zinc-900">Network Configuration</h4>
            <p className="text-[11px] text-zinc-500 leading-normal">
              Manage permissions, privacy and sharing constraints for this aggregated network.
            </p>
          </div>

          {/* Field: Network type */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Network Sync Mode</span>
            <select className="w-full text-xs rounded-md border border-zinc-200 bg-white p-2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary">
              <option>LinkedIn Connections Only</option>
              <option>Aggregated CRM Contacts</option>
              <option>Combined Shared Database</option>
            </select>
          </div>

          {/* Field: Privacy control */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Privacy &amp; Accessibility</span>
            <select 
              value={privacy}
              onChange={(e) => setPrivacy(e.target.value)}
              className="w-full text-xs rounded-md border border-zinc-200 bg-white p-2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
            >
              <option value="link_search">Anyone with link can search</option>
              <option value="members_only">Members of this organization only</option>
              <option value="private">Strictly Private (Just me)</option>
            </select>
          </div>

          {/* Invite URL block */}
          {privacy === 'link_search' && (
            <div className="space-y-2 p-3 bg-zinc-50 rounded-xl border border-zinc-100">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Direct Search Link</span>
              <p className="text-[10px] text-zinc-500">Allow advisors/partners to search without logging into Wrangle.</p>
              <div className="flex gap-1.5 mt-2">
                <Input 
                  value={inviteUrl} 
                  readOnly 
                  className="h-8 text-[10px] border-zinc-200 bg-white focus-visible:ring-0 select-all"
                />
                <Button 
                  size="icon" 
                  variant="outline" 
                  onClick={handleCopyLink} 
                  className="h-8 w-8 border-zinc-200 shrink-0 hover:bg-zinc-50"
                  title="Copy link"
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="h-3.5 w-3.5 text-zinc-500" />
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Divider */}
          <div className="border-t border-zinc-100 my-2" />

          {/* Security details alert banner */}
          <div className="p-4 bg-amber-50/50 border border-amber-200/50 rounded-xl space-y-2">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-700 uppercase">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              <span>Data Protection</span>
            </div>
            <p className="text-[10px] text-amber-600 leading-normal">
              Syncing a professional network respects user accounts. The system does not cache personal login passwords or perform actions outside designated search parameters.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
