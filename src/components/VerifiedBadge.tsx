'use client';

import React from 'react';
import { motion } from 'framer-motion';

export default function VerifiedBadge({ isVerified }: { isVerified: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={`success-burst inline-flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-black tracking-[.12em] ${isVerified ? 'bg-lime-300/10 border-lime-300/20 text-lime-300' : 'bg-pink-300/10 border-pink-300/20 text-pink-300'}`}
    >
      <span className="relative w-4 h-4 grid place-items-center">
        {isVerified ? (
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none">
            <motion.path
              d="M5 13l4 4L19 7"
              stroke="currentColor"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, delay: 0.3, ease: 'easeOut' }}
            />
          </svg>
        ) : (
          <span className="w-2 h-2 rounded-full bg-pink-300" />
        )}
      </span>
      {isVerified ? 'CRYPTOGRAPHICALLY VERIFIED' : 'VERIFICATION FAILED'}
    </motion.div>
  );
}
