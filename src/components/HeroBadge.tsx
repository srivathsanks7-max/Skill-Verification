'use client';

import React from 'react';
import SplitText from './SplitText';

export default function HeroBadge() {
  return (
    <div className="inline-flex items-center justify-center px-5 py-2 bg-green-500/10 border border-green-500/20 rounded-full shadow-[0_0_20px_rgba(34,197,94,0.1)]"
      style={{ backdropFilter: 'blur(12px)' }}
    >
      <SplitText
        text="Tech Titans"
        tag="span"
        className="text-sm font-semibold text-green-400 tracking-wide"
        delay={80}
        duration={0.5}
        ease="power3.out"
        splitType="chars"
        from={{ opacity: 0, y: 20, scale: 0.8, rotateX: -90 }}
        to={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
        threshold={0.1}
        rootMargin="-50px"
        textAlign="center"
      />
    </div>
  );
}
