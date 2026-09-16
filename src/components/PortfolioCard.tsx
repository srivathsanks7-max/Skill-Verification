import React from 'react';

interface PortfolioCardProps { title: string; icon?: React.ReactNode; children: React.ReactNode; className?: string; }

export function PortfolioCard({ title, icon, children, className = '' }: PortfolioCardProps) {
  return (
    <section className={`ring-spin shine-sweep gradient-border glass rounded-3xl p-6 card-lift ${className}`}>
      <div className="flex items-center gap-3 mb-6">
        {icon && <div className="w-10 h-10 rounded-xl bg-cyan-300/[.07] border border-cyan-300/15 text-cyan-300 grid place-items-center">{icon}</div>}
        <h2 className="text-lg font-black tracking-tight text-white">{title}</h2>
      </div>
      <div className="text-slate-300">{children}</div>
    </section>
  );
}
