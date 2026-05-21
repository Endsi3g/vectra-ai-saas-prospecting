'use client';

import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { LeadComment, Lead } from '@/lib/db-fallback';
import { X, Send, User, MessageSquare, AlertCircle } from 'lucide-react';

interface LeadCommentsDrawerProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function LeadCommentsDrawer({ lead, isOpen, onClose }: LeadCommentsDrawerProps) {
  const [comments, setComments] = useState<LeadComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const commentsEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom helper
  const scrollToBottom = () => {
    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch comments when lead changes
  useEffect(() => {
    if (!lead || !isOpen) return;

    const currentLead = lead;
    async function fetchComments() {
      setLoading(true);
      try {
        const res = await fetch(`/api/comments?leadId=${currentLead.id}`);
        if (res.ok) {
          const data = await res.json();
          setComments(data.comments || []);
        }
      } catch (err) {
        console.error('Failed to fetch lead comments:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchComments();

    // Subscribe to realtime changes for this lead's comments
    const channel = supabase
      .channel(`lead-comments-${currentLead.id}`)
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'lead_comments',
          filter: `lead_id=eq.${currentLead.id}`
        },
        (payload) => {
          const incoming = payload.new as LeadComment;
          // Avoid duplicate updates
          setComments((prev) => {
            if (prev.some((c) => c.id === incoming.id)) return prev;
            return [...prev, incoming];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [lead, isOpen]);

  // Scroll to bottom when comments list updates
  useEffect(() => {
    scrollToBottom();
  }, [comments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lead || !newComment.trim() || submitting) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: lead.id,
          content: newComment.trim()
        })
      });

      if (res.ok) {
        const data = await res.json();
        // Insert locally immediately for speed, realtime will handle sync or avoid duplicate
        setComments((prev) => {
          if (prev.some((c) => c.id === data.comment.id)) return prev;
          return [...prev, data.comment];
        });
        setNewComment('');
        
        // Also log this manual user comment to the activity feed!
        await fetch('/api/activity', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            actor_type: 'user',
            actor_name: 'Kael', // default workspace admin name
            activity_type: 'comment_added',
            description: `Commentaire ajouté sur ${lead.name} : "${newComment.trim().substring(0, 40)}${newComment.trim().length > 40 ? '...' : ''}"`,
            metadata: { leadId: lead.id }
          })
        });
      }
    } catch (err) {
      console.error('Failed to post comment:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !lead) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 flex pl-10 sm:pl-16">
      {/* Backdrop overlay */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/30 backdrop-blur-xs transition-opacity duration-300 animate-fade-in"
      />

      {/* Slide-over panel */}
      <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col h-full relative z-10 transition-transform duration-300 transform translate-x-0 animate-slide-left">
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
          <div className="space-y-0.5">
            <h3 className="font-semibold text-zinc-950 text-sm">Discussions & Notes</h3>
            <p className="text-[11px] text-zinc-500 font-medium">{lead.name} • {lead.company}</p>
          </div>
          <button 
            onClick={onClose}
            className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Lead Summary Info */}
        {lead.email && (
          <div className="px-5 py-2.5 bg-emerald-50/45 border-b border-emerald-100/50 flex items-center justify-between text-[11px]">
            <span className="text-emerald-800 font-medium">{lead.email}</span>
            <span className="text-emerald-700 bg-emerald-100/60 px-1.5 py-0.5 rounded font-bold uppercase text-[9px] tracking-wide">Prospect</span>
          </div>
        )}

        {/* Comments Stream */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-zinc-50/30">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full text-zinc-400 gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-zinc-200 border-t-zinc-500"></div>
              <span className="text-xs">Chargement des commentaires...</span>
            </div>
          ) : comments.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-zinc-400 text-center py-10 px-4">
              <MessageSquare className="w-9 h-9 text-zinc-300 mb-2" />
              <p className="text-xs font-semibold text-zinc-500">Aucun commentaire</p>
              <p className="text-[11px] text-zinc-400 mt-0.5">Ajoutez une note ou collaborez en direct sur ce prospect.</p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {comments.map((comment) => (
                <div key={comment.id} className="bg-white border border-zinc-200/60 rounded-xl p-3.5 shadow-sm space-y-1.5 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-full bg-zinc-100 flex items-center justify-center text-[10px] font-bold text-zinc-700">
                        {comment.user_name.charAt(0)}
                      </div>
                      <span className="text-xs font-bold text-zinc-950">{comment.user_name}</span>
                    </div>
                    <span className="text-[9px] text-zinc-400 font-medium">
                      {new Date(comment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-700 leading-relaxed font-normal whitespace-pre-wrap">{comment.content}</p>
                </div>
              ))}
              <div ref={commentsEndRef} />
            </div>
          )}
        </div>

        {/* Input Form Footer */}
        <form onSubmit={handleSubmit} className="p-4 border-t border-zinc-100 bg-white">
          <div className="flex gap-2">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Écrire une note ou collaborer..."
              className="flex-1 min-h-[40px] max-h-[120px] rounded-lg border border-zinc-200 px-3 py-2 text-xs focus:outline-hidden focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300 placeholder-zinc-400/90 resize-none font-normal"
              rows={1}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <button
              type="submit"
              disabled={!newComment.trim() || submitting}
              className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg px-3 flex items-center justify-center transition-colors self-end h-[38px] disabled:opacity-50 disabled:hover:bg-emerald-500"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
