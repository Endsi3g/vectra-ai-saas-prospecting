'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Sparkles } from 'lucide-react';
import styles from '../auth.module.css';

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
          data: {
            full_name: email.split('@')[0],
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      if (data?.user) {
        setMessage({
          type: 'success',
          text: 'Inscription réussie ! Redirection en cours...',
        });

        setTimeout(() => {
          router.push('/onboarding');
        }, 1500);
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
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || "Erreur lors de l'inscription avec Google." });
      setLoading(false);
    }
  };

  return (
    <div className={styles.authPage}>
      {/* Top-left branding */}
      <header className={styles.authHeader}>
        <div className={styles.authBrand}>
          <div className={styles.authBrandIcon}>
            <Sparkles className={styles.authBrandIconSvg} />
          </div>
          <span className={styles.authBrandName}>Vectra</span>
        </div>
      </header>

      <main className={styles.authMain}>
        {/* Left side — Form */}
        <div className={styles.authFormSide}>
          <div className={styles.authFormContainer}>
            <h1 className={styles.authTitle}>Créer un compte</h1>

            <form onSubmit={handleSignUp} className={styles.authForm}>
              <div className={styles.authField}>
                <label htmlFor="signup-email" className={styles.authLabel}>
                  Votre courriel professionnel
                </label>
                <input
                  id="signup-email"
                  type="email"
                  placeholder="utilisateur@entreprise.com"
                  className={styles.authInput}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>

              <div className={styles.authField}>
                <label htmlFor="signup-password" className={styles.authLabel}>
                  Mot de passe
                </label>
                <input
                  id="signup-password"
                  type="password"
                  placeholder="Entrez votre mot de passe"
                  className={styles.authInput}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
              </div>

              <div className={styles.authField}>
                <label htmlFor="signup-confirm-password" className={styles.authLabel}>
                  Confirmer le mot de passe
                </label>
                <input
                  id="signup-confirm-password"
                  type="password"
                  placeholder="Re-entrez votre mot de passe"
                  className={styles.authInput}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
              </div>

              {message && (
                <div
                  className={`${styles.authMessage} ${
                    message.type === 'success' ? styles.authMessageSuccess : styles.authMessageError
                  }`}
                >
                  {message.text}
                </div>
              )}

              <button type="submit" className={styles.authBtnPrimary} disabled={loading}>
                {loading ? 'Inscription en cours...' : 'Créer un compte'}
              </button>
            </form>

            <div className={styles.authDivider}>
              <span className={styles.authDividerLine} />
            </div>

            <button
              type="button"
              className={styles.authBtnGoogle}
              onClick={handleGoogleSignUp}
              disabled={loading}
            >
              <svg className={styles.authGoogleIcon} viewBox="0 0 24 24" width="18" height="18">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continuer avec Google
            </button>

            <Link
              href="/app?bypass=true"
              className={styles.authBtnGoogle}
              style={{
                marginTop: '12px',
                background: '#fcfcfc',
                borderColor: '#e2e2e7',
                color: '#27272a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                textDecoration: 'none',
                fontWeight: '600'
              }}
            >
              <Sparkles className="h-4.5 w-4.5 text-[#44B97C] shrink-0" />
              Accéder à la démo (sans connexion)
            </Link>
          </div>
        </div>

        {/* Right side — Hero image */}
        <div className={styles.authHeroSide}>
          <div className={styles.authHeroCard}>
            <Image
              src="/auth-hero.png"
              alt="Vectra team"
              fill
              sizes="(max-width: 900px) 100vw, 420px"
              className={styles.authHeroImg}
              priority
            />
            <div className={styles.authHeroOverlay}>
              <h2 className={styles.authHeroTitle}>
                Automatisez votre prospection SaaS
              </h2>
              <p className={styles.authHeroDesc}>
                Les équipes commerciales les plus performantes utilisent Vectra pour automatiser leur prospection B2B.
              </p>
            </div>
            <div className={styles.authHeroDots}>
              <span className={`${styles.authDot} ${styles.authDotActive}`} />
              <span className={styles.authDot} />
              <span className={styles.authDot} />
            </div>
          </div>
        </div>
      </main>

      {/* Bottom bar */}
      <footer className={styles.authFooter}>
        <div className={styles.authFooterLeft}>
          <span>Déjà un compte ?</span>{' '}
          <Link href="/auth/sign-in" className={styles.authLink}>
            Se connecter
          </Link>
        </div>
        <div className={styles.authFooterRight}>
          <Link href="#" className={styles.authFooterLink}>Confidentialité</Link>
          <Link href="#" className={styles.authFooterLink}>Conditions</Link>
          <Link href="#" className={styles.authFooterLink}>En savoir plus</Link>
        </div>
      </footer>
    </div>
  );
}
