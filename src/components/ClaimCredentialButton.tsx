'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Trophy, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export function ClaimCredentialButton({ assessmentId }: { assessmentId: string }) {
  const router = useRouter();
  const [isClaiming, setIsClaiming] = useState(false);

  const claimCredential = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsClaiming(true);

    try {
      const res = await fetch('/api/credentials/issue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assessmentId })
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Failed to claim credential');
        return;
      }

      if (data.credentialId) {
        router.push(`/verify/${data.credentialId}`);
      }
    } catch (error) {
      toast.error('An error occurred while claiming your credential.');
    } finally {
      setIsClaiming(false);
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      onClick={claimCredential}
      disabled={isClaiming}
      className="glow-button mt-4 w-full py-2.5 bg-gradient-to-r from-lime-300 to-cyan-300 text-slate-950 font-black rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(184,255,44,.25)] hover:shadow-[0_0_28px_rgba(184,255,44,.4)] disabled:opacity-50"
    >
      {isClaiming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trophy className="w-4 h-4" />}
      {isClaiming ? 'Issuing...' : 'Claim Verified Credential'}
    </motion.button>
  );
}
