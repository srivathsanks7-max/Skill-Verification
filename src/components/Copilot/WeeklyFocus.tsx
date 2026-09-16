"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Code, FileText, ArrowRight, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function WeeklyFocus() {
  const [isConnected, setIsConnected] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [focusArea, setFocusArea] = useState<{
    weakness: string;
    evidence: string;
    action: string;
  } | null>(null);

  const handleConnect = async () => {
    setIsAnalyzing(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    try {
      const response = await fetch('/api/analyze-github', {
        method: 'POST',
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Server returned ${response.status}`);
      }
      const data = await response.json();

      setIsConnected(true);
      const primaryWeakness = data.analysis_data.weaknesses?.[0] || 'General Improvement';

      setFocusArea({
        weakness: primaryWeakness,
        evidence: `Based on your GitHub profile and common stack: ${data.analysis_data.common_stack?.join(', ')}`,
        action: data.analysis_data.weekly_focus || 'Keep coding and building projects!'
      });
    } catch (error: any) {
      console.error(error);
      if (error.name === 'AbortError') {
        toast.error('The analysis timed out. The server took too long to respond.');
      } else {
        toast.error(error.message || 'Analysis failed');
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="ring-spin gradient-border glass rounded-3xl p-6 card-lift h-full">
      <div className="flex items-center gap-3 mb-6">
        <motion.div whileHover={{ rotate: -8, scale: 1.08 }} className="p-2 bg-violet-400/10 rounded-xl">
          <Target className="w-6 h-6 text-violet-300" />
        </motion.div>
        <div>
          <h2 className="text-xl font-black text-white">Weekly Improvement Focus</h2>
          <p className="text-slate-400 text-sm">Personalized advice based on your code and resume</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!isConnected ? (
          <motion.div
            key="connect"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="flex flex-col items-center justify-center py-8 text-center border-2 border-dashed border-white/10 rounded-2xl bg-white/[.02]"
          >
            <div className="flex gap-4 mb-4">
              <motion.div animate={{ y: [0, -4, 0] }} transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}>
                <Code className="w-8 h-8 text-slate-500" />
              </motion.div>
              <motion.div animate={{ y: [0, -4, 0] }} transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}>
                <FileText className="w-8 h-8 text-slate-500" />
              </motion.div>
            </div>
            <p className="text-slate-300 mb-4 max-w-sm">Connect your GitHub and upload your resume to get your personalized technical focus for the week.</p>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleConnect}
              disabled={isAnalyzing}
              className="glow-button px-6 py-2.5 bg-gradient-to-r from-pink-500 to-violet-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors flex items-center gap-2"
            >
              {isAnalyzing ? (
                <span className="flex items-center gap-2">Analyzing profile... <Loader2 className="w-4 h-4 animate-spin" /></span>
              ) : (
                "Connect & Analyze"
              )}
            </motion.button>
          </motion.div>
        ) : (
          focusArea && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-4"
            >
              <motion.div initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="glass rounded-2xl border border-white/10 p-4">
                <h3 className="text-sm font-semibold text-pink-300 mb-1 uppercase tracking-wider">Identified Weakness</h3>
                <p className="text-white font-medium text-lg">{focusArea.weakness}</p>
              </motion.div>

              <motion.div initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.08 }} className="glass rounded-2xl border border-white/10 p-4">
                <h3 className="text-sm font-semibold text-slate-400 mb-1 uppercase tracking-wider">Evidence from GitHub</h3>
                <p className="text-slate-300">{focusArea.evidence}</p>
              </motion.div>

              <motion.div initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.16 }} className="success-burst bg-violet-400/[.08] border border-violet-400/20 rounded-2xl p-4">
                <h3 className="text-sm font-semibold text-violet-300 mb-1 uppercase tracking-wider">Action Plan</h3>
                <p className="text-violet-100/90 mb-4">{focusArea.action}</p>

                <Link href="/assessments" className="glow-button flex items-center gap-2 text-sm font-bold text-white bg-gradient-to-r from-violet-500 to-cyan-400 px-4 py-2 rounded-xl transition-colors w-full justify-center">
                  Start 20-Min Exercise <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            </motion.div>
          )
        )}
      </AnimatePresence>
    </div>
  );
}
