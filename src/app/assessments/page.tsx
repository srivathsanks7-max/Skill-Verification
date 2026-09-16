import React from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { Terminal, Sparkles, Timer } from 'lucide-react';
import { ClaimCredentialButton } from '@/components/ClaimCredentialButton';
import { GenerateAssessmentButton } from '@/components/GenerateAssessmentButton';
import Reveal from '@/components/motion/Reveal';
import { StaggerContainer, StaggerItem } from '@/components/motion/Stagger';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return '—';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s}s`;
  return `${m}m ${s}s`;
}

export default async function AssessmentsDashboard({ searchParams }: { searchParams?: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const supabase = await createClient();
  const resolvedParams = searchParams ? await searchParams : {};
  const focus = resolvedParams?.focus as string | undefined;

  const { data: { user } } = await supabase.auth.getUser();
  let userAssessments: any[] = [];
  let topLanguage = 'JavaScript';

  if (user) {
    const { data: assessments } = await supabase
      .from('assessments')
      .select('*')
      .eq('user_id', user.id);
    userAssessments = assessments || [];

    const { data: profile } = await supabase.from('profiles').select('github_stats').eq('id', user.id).single();
    const stats: any = profile?.github_stats;
    if (stats?.top_languages?.length > 0) {
      topLanguage = stats.top_languages[0];
    }
  }

  const { data: allQuestions } = await supabase.from('questions').select('*').order('created_at', { ascending: false });
  const questions = (allQuestions || []).filter(q =>
    userAssessments.some(a => a.question_id === q.id) &&
    q.id !== '11111111-1111-1111-1111-111111111111' &&
    q.id !== '22222222-2222-2222-2222-222222222222'
  );

  return (
    <div className="relative min-h-screen overflow-hidden pt-24 pb-20">
      <div className="app-grid absolute inset-0" /><div className="noise" />
      <div className="aurora">
        <span className="w-[28rem] h-[28rem] -top-20 -right-32 bg-violet-500/50" />
        <span className="w-[24rem] h-[24rem] top-1/2 -left-32 bg-cyan-400/45" style={{ animationDelay: '-6s' }} />
      </div>
      <div className="orb w-[28rem] h-[28rem] bg-violet-500/10 -top-20 -right-32" />
      <div className="orb w-[24rem] h-[24rem] bg-cyan-400/8 top-1/2 -left-32" style={{ animationDelay: '-4s' }} />
      <main className="relative z-10 max-w-6xl mx-auto px-5 sm:px-6">
        <Reveal>
          <header className="py-12">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[.22em] text-violet-300">
              <span className="w-2 h-2 rounded-full bg-violet-300 shadow-[0_0_14px_rgba(139,92,246,.9)]" /> Skill arena
            </div>
            <h1 className="mt-4 text-5xl sm:text-6xl font-black tracking-[-.04em] text-lightning">Live Coding Assessments</h1>
            <p className="mt-4 text-slate-400 text-lg max-w-2xl">Challenges generated from the skills you actually use. Ship a solution, get evaluated, build proof.</p>
          </header>
        </Reveal>

        <Reveal delay={0.08}>
          <section className="ring-spin gradient-border glass rounded-3xl p-6 sm:p-8 mb-10 card-lift">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-7">
              <div className="flex gap-5">
                <div className="shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-400/20 to-cyan-400/10 border border-violet-300/20 grid place-items-center">
                  <Sparkles className="w-6 h-6 text-violet-300" />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-[.2em] font-bold text-violet-300">AI personalized</div>
                  <h2 className="text-2xl font-black text-white mt-1">A challenge built around <span className="text-cyan-300">{topLanguage}</span>.</h2>
                  <p className="text-slate-400 mt-2 max-w-2xl leading-6">Your GitHub signals are used to tailor the language and problem shape. No generic quiz bank.</p>
                  {user && <GenerateAssessmentButton language={topLanguage} focus={focus} />}
                </div>
              </div>
              <div className="hidden lg:block text-right">
                <div className="text-4xl font-black text-white">{questions.length}</div>
                <div className="text-xs uppercase tracking-widest text-slate-500">challenges</div>
              </div>
            </div>
          </section>
        </Reveal>

        {questions.length > 0 && (
          <div className="flex items-center gap-3 mb-5">
            <h2 className="text-xl font-black text-white">Your generated challenges</h2>
            <span className="px-2.5 py-1 rounded-full bg-white/[.06] border border-white/10 text-xs font-bold text-cyan-300">{questions.length}</span>
          </div>
        )}

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {questions.map((q) => {
            const assessment = userAssessments.find(a => a.question_id === q.id);
            const status = assessment?.status || 'pending';
            const timeSpent = assessment?.time_spent || 0;
            const statusStyle = status === 'passed'
              ? 'text-lime-300 bg-lime-300/10 border-lime-300/20'
              : status === 'failed' ? 'text-pink-300 bg-pink-300/10 border-pink-300/20' : 'text-slate-400 bg-white/[.04] border-white/10';
            return (
              <StaggerItem key={q.id}>
                <Link href={`/assessments/${q.id}`} className="group relative overflow-hidden shine-sweep gradient-border glass rounded-3xl p-6 card-lift block h-full">
                  <div className="absolute -right-16 -top-16 w-40 h-40 rounded-full bg-violet-500/10 blur-2xl group-hover:bg-cyan-400/10 transition-colors duration-700" />
                  <div className="relative">
                    <div className="flex justify-between gap-3 items-start">
                      <div className="w-11 h-11 rounded-2xl bg-violet-400/10 border border-violet-300/15 grid place-items-center text-violet-300"><Terminal className="w-5 h-5" /></div>
                      <span className={`px-3 py-1.5 rounded-full border text-[10px] font-black tracking-widest ${statusStyle}`}>
                        {status === 'passed' ? '✓ PASSED' : status === 'failed' ? '× FAILED' : '○ PENDING'}
                      </span>
                    </div>
                    <h2 className="mt-6 text-xl font-black text-white group-hover:text-cyan-200 transition-colors">{q.title}</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-500 line-clamp-2 min-h-12">{q.description}</p>
                    <div className="mt-6 flex items-center justify-between">
                      <span className="px-3 py-1.5 rounded-lg bg-white/[.045] border border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-300">{q.language}</span>
                      <span className="text-xs text-slate-500 flex items-center gap-2">{timeSpent > 0 && <><Timer className="w-3.5 h-3.5" />{formatDuration(timeSpent)}</>} <Sparkles className="w-3.5 h-3.5 text-violet-300" /> AI generated</span>
                    </div>
                    {status === 'passed' && assessment?.id && <div className="mt-5" onClick={(e) => e.stopPropagation()}><ClaimCredentialButton assessmentId={assessment.id} /></div>}
                  </div>
                </Link>
              </StaggerItem>
            );
          })}
        </StaggerContainer>

        {questions.length === 0 && (
          <Reveal>
            <div className="gradient-border glass rounded-3xl py-24 text-center">
              <Terminal className="w-10 h-10 mx-auto mb-4 text-slate-600" />
              <p className="text-xl font-black text-slate-300">Your arena is empty.</p>
              <p className="text-sm text-slate-500 mt-2">Generate a personalized challenge above to get started.</p>
            </div>
          </Reveal>
        )}
      </main>
    </div>
  );
}
