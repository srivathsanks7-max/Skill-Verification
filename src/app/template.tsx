'use client';

import { motion } from 'framer-motion';

/**
 * Next.js re-mounts `template.tsx` on every navigation (unlike layout.tsx),
 * which is exactly what we need to fire an enter transition per page.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
