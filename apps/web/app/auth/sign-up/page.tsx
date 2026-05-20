'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Sparkles } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import AuthShell from '../AuthShell';

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !confirmPassword) {
      setMessage({ type: 'error', text: 'Veuillez remplir tous les champs.' });
      return;
    }
    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: 'Les mots de passe ne correspondent pas.' });
      return;
    }
    if (password.length < 6) {
      setMessage({ type: 'error', text: 'Le mot de passe doit contenir au moins 6 caractères.' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: email.split('@')[0] },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      if (data?.user) {
        setMessage({ type: 'success', text: 'Inscription réussie ! Redirection en cours...' });
        setTimeout(() => router.push('/onboarding'), 1500);
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || "Une erreur est survenue lors de l'inscription." });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) throw error;
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || "Erreur lors de l'inscription avec Google." });
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Créer un compte"
      footerText="Déjà un compte ?"
      footerLinkText="Se connecter"
      footerLinkHref="/auth/sign-in"
    >
      <form onSubmit={handleSignUp} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="signup-email" className="text-xs font-semibold text-zinc-600">
            Courriel professionnel
          </Label>
          <Input
            id="signup-email"
            type="email"
            placeholder="utilisateur@entreprise.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="h-11"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="signup-password" className="text-xs font-semibold text-zinc-600">
            Mot de passe
          </Label>
          <Input
            id="signup-password"
            type="password"
            placeholder="Entrez votre mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
            className="h-11"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="signup-confirm-password" className="text-xs font-semibold text-zinc-600">
            Confirmer le mot de passe
          </Label>
          <Input
            id="signup-confirm-password"
            type="password"
            placeholder="Re-entrez votre mot de passe"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            autoComplete="new-password"
            className="h-11"
          />
        </div>

        {message && (
          <div className={`rounded-lg px-4 py-3 text-xs font-medium ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        <Button type="submit" className="w-full h-11 font-bold" disabled={loading}>
          {loading ? 'Inscription en cours...' : 'Créer un compte'}
        </Button>
      </form>

      <div className="relative my-1">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs text-zinc-400 bg-white px-2">ou</div>
      </div>

      <div className="space-y-2.5">
        <button
          type="button"
          onClick={handleGoogleSignUp}
          disabled={loading}
          className="w-full h-11 rounded-lg border border-input bg-white text-sm font-medium text-zinc-700 flex items-center justify-center gap-2.5 hover:bg-muted transition-colors duration-150 disabled:opacity-50"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Continuer avec Google
        </button>

        <Link
          href="/app?bypass=true"
          className="w-full h-11 rounded-lg border border-border bg-zinc-50 text-sm font-semibold text-zinc-700 flex items-center justify-center gap-2.5 hover:bg-muted transition-colors duration-150"
        >
          <Sparkles className="h-4 w-4 text-primary shrink-0" />
          Accéder à la démo (sans connexion)
        </Link>
      </div>
    </AuthShell>
  );
}
