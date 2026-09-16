'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/utils/supabase/client';
import { LogIn, LogOut, Code2, Swords, ChevronRight, Sparkles } from 'lucide-react';

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [scrolled, setScrolled] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      if (data.user) fetch('/api/github/sync', { method: 'POST' }).catch(console.error);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
      if (session?.user && event === 'SIGNED_IN') fetch('/api/github/sync', { method: 'POST' }).catch(console.error);
    });
    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'github', options: { redirectTo: `${location.origin}/auth/callback` } });
  };
  const handleLogout = async () => { await supabase.auth.signOut(); router.push('/'); };

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${scrolled ? 'py-3' : 'py-5'}`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className={`glass rounded-2xl px-4 h-14 flex items-center justify-between transition-shadow duration-500 ${scrolled ? 'shadow-2xl' : ''}`}>
          <Link href="/" className="group flex items-center gap-2.5">
            <motion.span
              whileHover={{ rotate: 10, scale: 1.06 }}
              transition={{ type: 'spring', stiffness: 300, damping: 12 }}
              className="relative grid place-items-center w-9 h-9 rounded-xl bg-white/[.06] border border-white/10 overflow-hidden"
            >
              <span className="absolute inset-0 bg-gradient-to-br from-cyan-400/25 via-violet-500/20 to-fuchsia-500/25 opacity-70 group-hover:opacity-100 transition" />
              <Code2 className="relative w-5 h-5 text-cyan-300" />
            </motion.span>
            <span className="font-black tracking-tight text-lg text-electric">SkillForge</span>
          </Link>

          {user && (
            <div className="hidden sm:flex items-center gap-2">
              <Link href="/assessments" className="link-draw px-4 py-2 rounded-xl text-sm font-semibold text-slate-300 hover:text-white hover:bg-white/[.06] transition flex items-center gap-2">
                <Swords className="w-4 h-4 text-violet-300" /> Assessments
              </Link>
            </div>
          )}

          <div className="flex items-center gap-2">
            <AnimatePresence mode="wait">
              {user ? (
                <motion.div
                  key="user"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.25 }}
                  className="flex items-center gap-2"
                >
                  <Link href={`/portfolio/${user.id}`} className="group flex items-center gap-2.5 rounded-xl px-2.5 py-1.5 border border-white/[.07] bg-white/[.025] hover:bg-white/[.07] transition">
                    {user.user_metadata?.avatar_url
                      ? <img src={user.user_metadata.avatar_url} alt="" className="w-7 h-7 rounded-lg ring-1 ring-cyan-300/30" />
                      : <span className="w-7 h-7 rounded-lg grid place-items-center bg-cyan-400/10 text-cyan-300 text-xs font-bold">{(user.user_metadata?.preferred_username || 'D')[0].toUpperCase()}</span>}
                    <span className="hidden md:block text-sm font-semibold text-slate-200">{user.user_metadata?.preferred_username || user.user_metadata?.user_name || 'Developer'}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-300 group-hover:translate-x-0.5 transition" />
                  </Link>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={handleLogout}
                    aria-label="Log out"
                    className="w-10 h-10 grid place-items-center rounded-xl text-slate-500 hover:text-pink-300 hover:bg-pink-400/10 transition"
                  >
                    <LogOut className="w-4 h-4" />
                  </motion.button>
                </motion.div>
              ) : (
                <motion.button
                  key="login"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogin}
                  className="glow-button rounded-xl px-4 py-2.5 text-sm font-bold text-slate-950 bg-gradient-to-r from-cyan-300 via-white to-violet-300 flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" /> <span className="hidden sm:inline">Continue with GitHub</span><span className="sm:hidden">Login</span>
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
