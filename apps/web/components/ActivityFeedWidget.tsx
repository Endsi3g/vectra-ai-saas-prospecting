'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { ActivityLog } from '@/lib/db-fallback';
import { 
  Activity, 
  CheckCircle2, 
  FileText, 
  Send, 
  User, 
  MessageSquare,
  Sparkles,
  Bot
} from 'lucide-react';

export default function ActivityFeedWidget() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch initial activity logs
  useEffect(() => {
    async function fetchLogs() {
      try {
        const res = await fetch('/api/activity');
        if (res.ok) {
          const data = await res.json();
          setLogs(data.logs || []);
        }
      } catch (err) {
        console.error('Failed to fetch activity logs:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchLogs();

    // Subscribe to realtime database changes
    const channel = supabase
      .channel('activity-logs-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'activity_logs' },
        (payload) => {
          const newLog = payload.new as ActivityLog;
          setLogs((prev) => [newLog, ...prev].slice(0, 50));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Helper to render event-specific icon
  const getIcon = (type: string) => {
    switch (type) {
      case 'lead_qualified':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'email_drafted':
        return <FileText className="w-4 h-4 text-indigo-500" />;
      case 'email_sent':
        return <Send className="w-4 h-4 text-sky-500" />;
      case 'comment_added':
        return <MessageSquare className="w-4 h-4 text-amber-500" />;
      default:
        return <Activity className="w-4 h-4 text-zinc-400" />;
    }
  };

  // Format timestamp nicely
  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div className="bg-white border border-zinc-200/80 rounded-xl shadow-sm overflow-hidden flex flex-col h-[400px]">
      {/* Widget Header */}
      <div className="px-4 py-3.5 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
        <div className="flex items-center gap-2">
          <Activity className="w-4.5 h-4.5 text-zinc-700" />
          <h3 className="font-semibold text-sm text-zinc-900">Activité du Workspace</h3>
        </div>
        <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-full">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wider">Agents Actifs</span>
        </div>
      </div>

      {/* Logs Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full text-zinc-400 gap-2">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-zinc-300 border-t-zinc-600"></div>
            <span className="text-xs">Chargement de l'activité...</span>
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-zinc-400 text-center px-4 py-8">
            <Sparkles className="w-8 h-8 text-zinc-300 mb-2" />
            <p className="text-xs font-medium text-zinc-500">Aucune activité enregistrée</p>
            <p className="text-[11px] text-zinc-400 mt-0.5">Les actions de vos agents autonomes apparaîtront ici.</p>
          </div>
        ) : (
          <div className="relative border-l border-zinc-100 pl-4 ml-2.5 space-y-5">
            {logs.map((log) => (
              <div key={log.id} className="relative group transition-all duration-200 animate-slide-in">
                {/* Timeline Connector Indicator */}
                <div className="absolute -left-[27px] top-1.5 bg-white border border-zinc-200 rounded-full p-0.5 shadow-sm">
                  {getIcon(log.activity_type)}
                </div>

                {/* Log Info */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-900">
                      {log.actor_type === 'agent' ? (
                        <span className="flex items-center gap-1 bg-zinc-100 text-zinc-700 px-1.5 py-0.5 rounded text-[10px] uppercase font-semibold">
                          <Bot className="w-3 h-3 text-zinc-500" />
                          {log.actor_name}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-zinc-600">
                          <User className="w-3 h-3 text-zinc-400" />
                          {log.actor_name}
                        </span>
                      )}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-medium">{formatTime(log.created_at)}</span>
                  </div>
                  <p className="text-xs text-zinc-600 font-normal leading-relaxed">{log.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
