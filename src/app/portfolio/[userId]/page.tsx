import React from 'react';
import { notFound } from 'next/navigation';
import { PortfolioCard } from '@/components/PortfolioCard';
import { User, Code, Award, ExternalLink, GitBranch, Star } from 'lucide-react';
import Reveal from '@/components/motion/Reveal';
import { StaggerContainer, StaggerItem } from '@/components/motion/Stagger';

import { createClient } from '@/utils/supabase/server';

async function getPortfolioData(userId: string) {
  const supabase = await createClient();
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !profile) {
    return null;
  }

  const { data: credentialsData } = await supabase
    .from('credentials')
    .select(`
      id,
      issued_at,
      assessments (
        id,
        status,
        questions (
          title
        )
      )
    `)
    .eq('user_id', userId)
    .order('issued_at', { ascending: false });

  const verifiedCredentials = (credentialsData || []).map((cred: any) => ({
    id: cred.id,
    title: cred.assessments?.questions?.title || 'Verified Skill Assessment',
    issuer: 'SkillProof Authenticated',
    issued_at: cred.issued_at,
    url: `/verify/${cred.id}`
  }));

  return { profile, verifiedCredentials };
}

export default async function PortfolioPage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const data = await getPortfolioData(userId);

  if (!data) {
    notFound();
  }

  const { profile, verifiedCredentials } = data;
  const githubStats = profile.github_stats || {};
  const repos = githubStats.repos || [];
  const topLanguages = githubStats.top_languages || [];

  return (
    <div className="relative min-h-screen overflow-hidden pb-24 pt-24">
      <div className="app-grid absolute inset-0" /><div className="noise" />
      <div className="aurora">
        <span className="w-[30rem] h-[30rem] -top-32 -left-24 bg-cyan-400/50" />
        <span className="w-[28rem] h-[28rem] top-1/3 -right-32 bg-fuchsia-500/50" style={{ animationDelay: '-5s' }} />
      </div>
      <div className="orb w-[30rem] h-[30rem] bg-cyan-400/8 -top-32 -left-24" />
      <div className="orb w-[28rem] h-[28rem] bg-fuchsia-500/8 top-1/3 -right-32" />
      <main className="relative z-10 max-w-6xl mx-auto px-5 sm:px-6">
        <Reveal>
          <section className="ring-spin gradient-border glass rounded-[2rem] p-7 sm:p-10 mt-10 overflow-hidden relative">
            <div className="absolute right-0 top-0 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative flex flex-col md:flex-row items-center md:items-end gap-7">
              <div className="relative shrink-0">
                <div className="absolute -inset-2 rounded-[2rem] bg-gradient-to-br from-cyan-300/50 via-violet-400/40 to-fuchsia-400/50 blur-xl opacity-60" />
                <img src={profile.avatar_url || `https://ui-avatars.com/api/?name=${profile.full_name}&background=random`} alt={profile.full_name} className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-[1.7rem] object-cover border border-white/15 shadow-2xl" />
              </div>
              <div className="text-center md:text-left flex-1">
                <div className="text-xs uppercase tracking-[.25em] font-bold text-cyan-300 mb-3">Verified developer portfolio</div>
                <h1 className="text-4xl sm:text-6xl font-black tracking-[-.05em] text-lightning">{profile.full_name}</h1>
                <p className="mt-2 text-slate-400 font-medium">@{profile.username}</p>
                <div className="mt-6 flex flex-wrap gap-3 justify-center md:justify-start">
                  <div className="glass rounded-xl px-4 py-2 text-sm"><b className="text-cyan-300">{githubStats.followers || 0}</b> <span className="text-slate-500">followers</span></div>
                  <div className="glass rounded-xl px-4 py-2 text-sm"><b className="text-violet-300">{githubStats.public_repos || 0}</b> <span className="text-slate-500">public repos</span></div>
                  <div className="glass rounded-xl px-4 py-2 text-sm"><b className="text-lime-300">{verifiedCredentials.length}</b> <span className="text-slate-500">verified skills</span></div>
                </div>
              </div>
            </div>
          </section>
        </Reveal>

        <div className="grid lg:grid-cols-3 gap-6 mt-6">
          <StaggerContainer className="space-y-6">
            <StaggerItem>
              <PortfolioCard title="Tech stack" icon={<Code className="w-5 h-5" />}>
                <div className="flex flex-wrap gap-2">
                  {topLanguages.length ? topLanguages.map((lang: string) => <span key={lang} className="px-3 py-1.5 rounded-lg bg-cyan-300/[.07] border border-cyan-300/15 text-cyan-200 text-xs font-bold">{lang}</span>) : <p className="text-slate-500 text-sm">No languages found.</p>}
                </div>
              </PortfolioCard>
            </StaggerItem>
            <StaggerItem>
              <PortfolioCard title="Verified credentials" icon={<Award className="w-5 h-5" />}>
                <div className="space-y-3">
                  {verifiedCredentials.length ? verifiedCredentials.map((cred: any) => (
                    <div key={cred.id} className="group glass rounded-2xl p-4 card-lift">
                      <div className="flex gap-3"><div className="w-9 h-9 rounded-xl bg-lime-300/10 grid place-items-center text-lime-300"><Award className="w-4 h-4" /></div><div className="min-w-0"><h3 className="font-bold text-white truncate">{cred.title}</h3><p className="text-xs text-slate-500 mt-1">{cred.issuer}</p></div></div>
                      <a href={cred.url} target="_blank" rel="noopener noreferrer" className="link-draw mt-3 inline-flex items-center gap-1 text-xs font-bold text-cyan-300 hover:text-white transition">Verify credential <ExternalLink className="w-3 h-3" /></a>
                    </div>
                  )) : <p className="text-sm text-slate-500">No credentials yet.</p>}
                </div>
              </PortfolioCard>
            </StaggerItem>
          </StaggerContainer>

          <div className="lg:col-span-2">
            <PortfolioCard title="Featured repositories" icon={<GitBranch className="w-5 h-5" />} className="h-full">
              <StaggerContainer className="grid sm:grid-cols-2 gap-4">
                {repos.map((repo: any) => (
                  <StaggerItem key={repo.id}>
                    <a href={repo.html_url} target="_blank" rel="noopener noreferrer" className="group shine-sweep gradient-border glass rounded-2xl p-5 card-lift block h-full">
                      <div className="flex items-start justify-between gap-3"><h3 className="font-black text-lg text-white group-hover:text-cyan-200 transition truncate">{repo.name}</h3><ExternalLink className="w-4 h-4 shrink-0 text-slate-600 group-hover:text-cyan-300 transition" /></div>
                      <p className="text-sm leading-6 text-slate-500 line-clamp-2 mt-2 min-h-12">{repo.description || 'No description provided.'}</p>
                      <div className="mt-6 flex justify-between text-xs font-bold text-slate-500">
                        <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-cyan-300 shadow-[0_0_9px_rgba(0,229,255,.7)]" />{repo.language || 'Unknown'}</span>
                        <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5" /> {repo.stargazers_count || 0}</span>
                      </div>
                    </a>
                  </StaggerItem>
                ))}
              </StaggerContainer>
              {!repos.length && <div className="py-14 text-center text-sm text-slate-500">No repositories found.</div>}
            </PortfolioCard>
          </div>
        </div>
      </main>
    </div>
  );
}
