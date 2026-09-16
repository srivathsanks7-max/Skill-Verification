import Link from 'next/link';
import { ArrowRight, Code2, FileCheck2, GitBranch, Sparkles, Zap, ShieldCheck, Rocket } from 'lucide-react';
import WeeklyFocus from '../components/Copilot/WeeklyFocus';
import JobReadiness from '../components/Copilot/JobReadiness';
import SplitText from '../components/SplitText';
import MaskedHeading from '../components/MaskedHeading';
import Reveal from '../components/motion/Reveal';
import { StaggerContainer, StaggerItem } from '../components/motion/Stagger';
import Magnetic from '../components/motion/Magnetic';

const STACK = ['TypeScript', 'React', 'Next.js', 'Node', 'Python', 'Go', 'Rust', 'Supabase', 'PostgreSQL', 'GraphQL'];

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden pt-24">
      <div className="app-grid absolute inset-0" />
      <div className="noise" />

      {/* Aurora — bigger, slower, more saturated motion than the old static orbs */}
      <div className="aurora">
        <span className="w-[36rem] h-[36rem] -top-40 -left-40 bg-cyan-400/70" />
        <span className="w-[32rem] h-[32rem] top-10 -right-40 bg-fuchsia-500/60" style={{ animationDelay: '-4s' }} />
        <span className="w-[30rem] h-[30rem] bottom-0 left-1/3 bg-violet-500/60" style={{ animationDelay: '-8s' }} />
      </div>
      <div className="orb w-[34rem] h-[34rem] bg-cyan-400/10 -top-32 -left-40" />
      <div className="orb w-[30rem] h-[30rem] bg-fuchsia-500/10 top-20 -right-40" style={{ animationDelay: '-3s' }} />
      <div className="orb w-[28rem] h-[28rem] bg-violet-500/10 bottom-0 left-1/3" style={{ animationDelay: '-6s' }} />

      <main className="relative z-10 mx-auto max-w-7xl px-5 sm:px-6">
        <section className="min-h-[720px] flex flex-col justify-center items-center text-center py-20">
          <Reveal direction="down" duration={0.6}>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/[.06] px-4 py-2 text-xs font-bold uppercase tracking-[.22em] text-cyan-200 shadow-[0_0_35px_rgba(0,229,255,.08)]">
              <span className="pulse-dot w-1.5 h-1.5 rounded-full bg-lime-300" />
              Evidence-driven developer growth
            </div>
          </Reveal>

          <h1 className="mt-8 max-w-5xl w-full flex flex-col items-center text-5xl sm:text-7xl lg:text-[6.8rem] leading-[.9] font-black tracking-[-.055em]">
            <Reveal delay={0.05}>
              <span>Build proof.</span>
            </Reveal>
            <div className="w-full flex justify-center mt-1 sm:mt-2 h-[1.2em]">
              <MaskedHeading
                text="Not promises."
                src="/bright-water-bg.jpg"
                tag="div"
                trigger="view"
                reveal="wipe"
                parallax={34}
                drift={15}
                align="center"
                textScale={0.11}
                className="font-black tracking-[-.055em] leading-[0.9] whitespace-nowrap"
              />
            </div>
          </h1>

          <Reveal delay={0.15}>
            <p className="mt-8 max-w-2xl text-base sm:text-lg leading-8 text-slate-400">
              SkillForge reads your real code, resume and projects to create personalized challenges — then turns what you prove into a portfolio recruiters can verify.
            </p>
          </Reveal>

          <Reveal delay={0.25}>
            <div className="mt-10 flex flex-col sm:flex-row gap-3">
              <Magnetic>
                <Link href="/assessments" className="glow-button ring-spin rounded-2xl px-7 py-4 bg-gradient-to-r from-cyan-300 via-sky-200 to-violet-300 text-slate-950 font-black flex items-center justify-center gap-2 shadow-[0_0_45px_rgba(0,229,255,.16)]">
                  <Zap className="w-5 h-5" /> Enter the forge <ArrowRight className="w-4 h-4" />
                </Link>
              </Magnetic>
              <Magnetic strength={10}>
                <a href="#how" className="rounded-2xl px-7 py-4 glass text-slate-200 font-semibold hover:bg-white/[.09] transition inline-block">
                  See how it works
                </a>
              </Magnetic>
            </div>
          </Reveal>

          <Reveal delay={0.35} className="mt-14 w-full max-w-4xl">
            <div className="lightning-line" />
            <StaggerContainer className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
              {[
                [GitBranch, 'Real code', 'Analyze the work you actually ship.'],
                [Sparkles, 'Adaptive AI', 'Challenges shaped around your stack.'],
                [FileCheck2, 'Verifiable proof', 'Earn credentials backed by evidence.'],
              ].map(([Icon, title, desc]: any) => (
                <StaggerItem key={title}>
                  <div className="shine-sweep glass rounded-2xl p-5 text-left card-lift h-full">
                    <Icon className="w-5 h-5 text-cyan-300 mb-4" />
                    <div className="font-bold text-white">{title}</div>
                    <div className="text-xs leading-5 text-slate-500 mt-1">{desc}</div>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </Reveal>

          {/* Trust / stack marquee — trendy infinite ticker */}
          <Reveal delay={0.4} className="mt-16 w-full max-w-5xl overflow-hidden">
            <div className="text-[10px] uppercase tracking-[.3em] font-bold text-slate-600 mb-4">Challenges generated for every major stack</div>
            <div className="relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_12%,black_88%,transparent)]">
              <div className="marquee-track gap-8 py-1">
                {[...STACK, ...STACK].map((s, i) => (
                  <span key={`${s}-${i}`} className="shrink-0 px-5 py-2 rounded-full glass text-sm font-bold text-slate-300 whitespace-nowrap">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>
        </section>

        <section id="how" className="pb-16">
          <Reveal className="mb-8">
            <p className="text-xs font-bold uppercase tracking-[.25em] text-violet-300">Your developer copilot</p>
            <h2 className="mt-3 text-3xl sm:text-4xl font-black tracking-tight">Turn your gaps into a plan.</h2>
          </Reveal>
          <StaggerContainer className="grid lg:grid-cols-2 gap-6">
            <StaggerItem>
              <WeeklyFocus />
            </StaggerItem>
            <StaggerItem>
              <JobReadiness />
            </StaggerItem>
          </StaggerContainer>
        </section>

        <section className="pb-28">
          <Reveal className="mb-8 text-center">
            <p className="text-xs font-bold uppercase tracking-[.25em] text-cyan-300">Why SkillForge</p>
            <h2 className="mt-3 text-3xl sm:text-4xl font-black tracking-tight">Portfolios built on proof, not vibes.</h2>
          </Reveal>
          <StaggerContainer className="grid sm:grid-cols-3 gap-6">
            {[
              [Rocket, 'Ship in minutes', 'Generate a tailored challenge from your GitHub in seconds, not hours.'],
              [ShieldCheck, 'Cryptographically verified', 'Every credential is signed — recruiters can verify it independently.'],
              [Code2, 'Real problems, real code', 'No trivia. You write and run actual code against hidden test cases.'],
            ].map(([Icon, title, desc]: any) => (
              <StaggerItem key={title}>
                <div className="ring-spin shine-sweep glass rounded-3xl p-7 card-lift h-full">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-300/20 to-violet-400/10 border border-cyan-300/20 grid place-items-center mb-5">
                    <Icon className="w-6 h-6 text-cyan-300" />
                  </div>
                  <h3 className="font-black text-lg text-white">{title}</h3>
                  <p className="text-sm leading-6 text-slate-500 mt-2">{desc}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </section>
      </main>
    </div>
  );
}
