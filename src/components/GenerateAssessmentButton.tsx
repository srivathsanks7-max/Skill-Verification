'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2, Bot } from 'lucide-react';
import toast from 'react-hot-toast';

export function GenerateAssessmentButton({ language, focus }: { language?: string, focus?: string }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const router = useRouter();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isGenerating) {
      setProgress(10);
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) return prev;
          return prev + Math.floor(Math.random() * 10) + 2;
        });
      }, 500);
    } else {
      setProgress(0);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      const res = await fetch('/api/generate-assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language: language || 'JavaScript', focus })
      });

      if (!res.ok) {
        let errMsg = 'Failed to generate assessment';
        try {
          const data = await res.json();
          errMsg = data.error || errMsg;
        } catch {}
        throw new Error(errMsg);
      }

      setProgress(100);
      toast.success('New challenge generated! It has appeared below.');
      setTimeout(() => {
        router.refresh();
      }, 600);
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate assessment. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-full max-w-sm mt-4">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        onClick={handleGenerate}
        disabled={isGenerating}
        className="glow-button w-full px-4 py-2.5 bg-gradient-to-r from-violet-500 to-cyan-400 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isGenerating ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Sparkles className="w-4 h-4" />
        )}
        {isGenerating ? 'AI is generating...' : 'Generate New Custom Challenge'}
      </motion.button>

      <AnimatePresence>
        {isGenerating && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-3 glass rounded-xl p-3 border border-violet-400/20 overflow-hidden"
          >
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-violet-300 font-medium flex items-center gap-1">
                <Bot className="w-3 h-3" /> AI Engine
              </span>
              <span className="text-slate-400">{Math.min(progress, 100)}%</span>
            </div>
            <div className="w-full bg-white/[.05] rounded-full h-1.5 overflow-hidden">
              <motion.div
                className="bg-gradient-to-r from-cyan-300 to-violet-400 h-1.5 rounded-full shadow-[0_0_10px_rgba(139,92,246,.5)]"
                animate={{ width: `${Math.min(progress, 100)}%` }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              />
            </div>
            <p className="text-[10px] text-slate-500 mt-2 text-center">
              {progress < 40 ? 'Analyzing your GitHub profile...' :
               progress < 70 ? 'Crafting personalized logic problem...' :
               progress < 100 ? 'Writing test cases...' :
               'Done!'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
