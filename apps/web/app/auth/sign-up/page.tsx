'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@workspace/ui/components/tabs';
import { supabase } from '@/lib/supabase';
import { ArrowRight, Mail, Lock, User, Sparkles } from 'lucide-react';

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handlePasswordSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !name) {
      setMessage({ type: 'error', text: 'Veuillez remplir tous les champs.' });
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
            full_name: name,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      if (data?.user) {
        // Successful signup, trigger profile onboarding check or redirect
        // For development/mock, let's auto-create profile and redirect
        setMessage({
          type: 'success',
          text: 'Inscription réussie ! Un email de confirmation vous a été envoyé si configuré, redirection en cours...',
        });
        
        // Let's redirect to onboarding page after a brief delay
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

  const handleMagicLinkSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setMessage({ type: 'error', text: 'Veuillez renseigner votre adresse email.' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/onboarding`,
          data: {
            full_name: name || email.split('@')[0],
          }
        },
      });

      if (error) throw error;

      setMessage({
        type: 'success',
        text: 'Un lien de connexion magique a été envoyé à votre adresse email !',
      });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Une erreur est survenue.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-950">
      {/* Brand Header */}
      <div className="mb-6 flex flex-col items-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white shadow-md shadow-primary/20">
          <Sparkles className="h-6 w-6" />
        </div>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
          Vectra
        </h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Le vecteur de croissance entre vous et vos futurs clients.
        </p>
      </div>

      <Card className="w-full max-w-md border-zinc-200 shadow-xl dark:border-zinc-800">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Créer un compte</CardTitle>
          <CardDescription>
            Choisissez votre méthode préférée pour vous inscrire sur Vectra.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="password" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="password">Email & Mot de passe</TabsTrigger>
              <TabsTrigger value="magic">Lien Magique</TabsTrigger>
            </TabsList>

            <TabsContent value="password">
              <form onSubmit={handlePasswordSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom complet</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                    <Input
                      id="name"
                      placeholder="Jean Dupont"
                      type="text"
                      className="pl-10"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email-password">Adresse e-mail</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                    <Input
                      id="email-password"
                      placeholder="jean.dupont@exemple.com"
                      type="email"
                      className="pl-10"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      className="pl-10"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {message && (
                  <div
                    className={`rounded-lg p-3 text-sm ${
                      message.type === 'success'
                        ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400'
                        : 'bg-rose-50 text-rose-800 dark:bg-rose-950/30 dark:text-rose-400'
                    }`}
                  >
                    {message.text}
                  </div>
                )}

                <Button type="submit" className="w-full mt-2" disabled={loading}>
                  {loading ? 'Inscription en cours...' : 'Créer mon compte'}
                  {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="magic">
              <form onSubmit={handleMagicLinkSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="magic-name">Nom complet (optionnel)</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                    <Input
                      id="magic-name"
                      placeholder="Jean Dupont"
                      type="text"
                      className="pl-10"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email-magic">Adresse e-mail</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                    <Input
                      id="email-magic"
                      placeholder="jean.dupont@exemple.com"
                      type="email"
                      className="pl-10"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {message && (
                  <div
                    className={`rounded-lg p-3 text-sm ${
                      message.type === 'success'
                        ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400'
                        : 'bg-rose-50 text-rose-800 dark:bg-rose-950/30 dark:text-rose-400'
                    }`}
                  >
                    {message.text}
                  </div>
                )}

                <Button type="submit" className="w-full mt-2" disabled={loading}>
                  {loading ? 'Envoi du lien...' : 'M\'inscrire avec un lien magique'}
                  {!loading && <Mail className="ml-2 h-4 w-4" />}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex flex-wrap items-center justify-between border-t border-zinc-100 px-6 py-4 dark:border-zinc-800">
          <span className="text-sm text-zinc-500 dark:text-zinc-400">
            Déjà inscrit ?
          </span>
          <Link
            href="/auth/sign-in"
            className="text-sm font-semibold text-primary hover:underline"
          >
            Se connecter
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
