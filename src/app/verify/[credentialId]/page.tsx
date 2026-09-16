import React from 'react';
import { notFound } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { jwtVerify } from 'jose';
import { ExternalLink, Code2, Calendar } from 'lucide-react';
import Link from 'next/link';
import Reveal from '@/components/motion/Reveal';
import VerifiedBadge from '@/components/VerifiedBadge';

export default async function VerifyPage({ params }: { params: Promise<{ credentialId: string }> }) {
  const { credentialId } = await params;

  if (!credentialId || credentialId.length < 10) {
    notFound();
  }

  const supabase = await createClient();

  const { data: credential, error } = await supabase
    .from('credentials')
    .select('*, profiles(full_name, username, avatar_url), assessments(questions(title, language))')
    .eq('id', credentialId)
    .single();

  if (error || !credential) {
    notFound();
  }

  let isVerified = false;
  let decodedPayload: any = null;

  try {
    const secretKey = new TextEncoder().encode(process.env.JWT_SECRET_KEY);
    const { payload } = await jwtVerify(credential.jwt_token, secretKey);
    decodedPayload = payload;
    isVerified = true;
  } catch (err) {
    console.error('JWT Verification failed:', err);
    isVerified = false;
  }

  const profile = credential.profiles;
  const question = credential.assessments?.questions;

  return (
    <div className="relative min-h-screen overflow-hidden flex items-center justify-center p-5 sm:p-8 pt-28">
      <div className="app-grid absolute inset-0" /><div className="noise" />
      <div className="aurora">
        <span className={`w-[28rem] h-[28rem] -top-32 -left-32 ${isVerified ? 'bg-lime-300/45' : 'bg-pink-400/45'}`} />
        <span className="w-[24rem] h-[24rem] bottom-0 -right-24 bg-violet-500/45" style={{ animationDelay: '-5s' }} />
      </div>
      <div className="orb w-[28rem] h-[28rem] bg-cyan-400/10 -top-32 -left-32" />
      <div className="orb w-[24rem] h-[24rem] bg-violet-500/10 bottom-0 -right-24" />
      <main className="relative z-10 w-full max-w-2xl">
        <Reveal direction="scale" duration={0.6}>
          <div className="ring-spin gradient-border glass rounded-[2rem] p-7 sm:p-12 text-center">
            <VerifiedBadge isVerified={isVerified} />

            <Reveal delay={0.15} direction="scale">
              <div className="mt-10">
                <div className="relative inline-block">
                  <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-cyan-300/40 to-violet-400/40 blur-xl" />
                  <img src={profile?.avatar_url || `https://ui-avatars.com/api/?name=${profile?.full_name}&background=random`} alt={profile?.full_name} className="relative w-24 h-24 rounded-full object-cover border-2 border-white/15" />
                </div>
                <h1 className="mt-5 text-3xl sm:text-4xl font-black text-lightning">{profile?.full_name}</h1>
                <Link href={`/portfolio/${credential.user_id}`} className="link-draw mt-2 inline-flex items-center gap-1 text-cyan-300 hover:text-white transition">
                  @{profile?.username} <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </Reveal>

            <div className="lightning-line my-10" />

            <Reveal delay={0.25}>
              <p className="text-[10px] uppercase tracking-[.3em] font-black text-slate-500">Successfully demonstrated</p>
              <div className="ring-spin mt-5 gradient-border glass rounded-2xl p-7">
                <Code2 className="w-7 h-7 mx-auto text-cyan-300 mb-4" />
                <h2 className="text-2xl sm:text-3xl font-black text-white">{question?.title || decodedPayload?.skill || 'Coding Assessment'}</h2>
                <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[.05] text-xs font-bold uppercase tracking-widest text-slate-400">
                  {question?.language || decodedPayload?.language || 'Programming Language'}
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.35}>
              <div className="mt-8 flex flex-col sm:flex-row justify-between gap-3 text-xs text-slate-500">
                <span className="flex items-center justify-center gap-2"><Calendar className="w-3.5 h-3.5" /> Issued {new Date(credential.issued_at).toLocaleDateString()}</span>
                <span className="font-mono opacity-50">ID: {credential.id.split('-')[0]}</span>
              </div>
            </Reveal>
          </div>
        </Reveal>
        <Reveal delay={0.4}>
          <p className="text-center text-xs text-slate-600 mt-6">Powered by <strong className="text-slate-400">SkillProof</strong> · Team Nexus</p>
        </Reveal>
      </main>
    </div>
  );
}
