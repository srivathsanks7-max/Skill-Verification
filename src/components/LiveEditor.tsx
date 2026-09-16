'use client';

import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Loader2, Sparkles, Terminal, CheckCircle2, XCircle, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LiveEditor({ question, initialCode }: { question: any, initialCode?: string }) {
  const router = useRouter();
  const [code, setCode] = useState(initialCode || `// Write your ${question.language} solution here\n// IMPORTANT: You must console.log() your final result at the bottom of the script!\n// Example: console.log(myFunction([1,2,3]));\n\n`);
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [status, setStatus] = useState<'pending' | 'passed' | 'failed'>('pending');
  const [executionResult, setExecutionResult] = useState<any>(null);

  const [explanation, setExplanation] = useState('');
  const [grade, setGrade] = useState<any>(null);
  const [isGrading, setIsGrading] = useState(false);

  const runCode = async () => {
    setIsRunning(true);
    setOutput('Running code in Piston sandbox...\n');
    setStatus('pending');
    setExecutionResult(null);

    try {
      const res = await fetch('/api/assessments/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId: question.id, code })
      });

      const data = await res.json();

      if (res.ok) {
        setOutput(data.output || 'No output.');
        setStatus(data.status);
        setExecutionResult(data.executionResult);
      } else {
        setOutput(`Error: ${data.error}`);
        setStatus('failed');
        setExecutionResult(null);
      }
    } catch (err: any) {
      setOutput(`Failed to execute code: ${err.message}`);
      setStatus('failed');
    } finally {
      setIsRunning(false);
      router.refresh();
    }
  };

  const explainCode = async () => {
    setIsGrading(true);
    try {
      const res = await fetch('/api/assessments/grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId: question.id, explanation })
      });
      const data = await res.json();
      if (res.ok) {
        setGrade(data.grade);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGrading(false);
    }
  };

  return (
    <div className="relative flex flex-col h-[calc(100vh-88px)] mt-24 overflow-hidden">
      <div className="app-grid absolute inset-0 opacity-40" />
      <div className="orb w-[26rem] h-[26rem] bg-cyan-400/8 -top-32 -left-24" />
      <div className="orb w-[24rem] h-[24rem] bg-violet-500/8 bottom-0 -right-24" />

      <div className="relative z-10 flex-1 flex flex-col lg:flex-row overflow-hidden gap-3 p-3">

        {/* Left pane: Question Description */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-full lg:w-1/3 gradient-border glass rounded-3xl flex flex-col overflow-y-auto"
        >
          <div className="p-6">
            <div className="text-xs uppercase tracking-[.22em] font-bold text-violet-300 mb-2">Challenge</div>
            <h1 className="text-2xl font-black text-white mb-3">{question.title}</h1>
            <div className="flex gap-2 mb-6">
              <span className="px-3 py-1.5 bg-cyan-300/[.08] text-cyan-200 text-[10px] font-black rounded-full uppercase tracking-widest border border-cyan-300/20">
                {question.language}
              </span>
            </div>

            <p className="text-slate-300 leading-relaxed whitespace-pre-wrap text-sm">
              {question.description}
            </p>

            <div className="mt-8 gradient-border glass rounded-2xl p-4">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[.2em] mb-2">Expected Output</h3>
              <code className="text-lime-300 font-mono text-sm block">
                {question.test_cases?.[0]?.expected_output || 'No specific output expected.'}
              </code>
            </div>
          </div>
        </motion.div>

        {/* Right pane: Editor & Terminal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="w-full lg:w-2/3 flex flex-col gap-3 h-full overflow-hidden"
        >
          <div className="gradient-border glass rounded-3xl flex flex-col flex-1 overflow-hidden">
            {/* Editor Header */}
            <div className="h-14 flex items-center justify-between px-5 border-b border-white/[.06] shrink-0">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-pink-400/50" />
                <div className="w-3 h-3 rounded-full bg-amber-300/50" />
                <div className="w-3 h-3 rounded-full bg-lime-300/50" />
                <span className="ml-4 text-sm font-mono text-slate-400">solution.{question.language === 'typescript' ? 'ts' : question.language}</span>
              </div>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                onClick={runCode}
                disabled={isRunning}
                className="glow-button flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-300 via-sky-200 to-violet-300 text-slate-950 text-sm font-black disabled:opacity-60"
              >
                {isRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                {isRunning ? 'Running...' : 'Run & Submit'}
              </motion.button>
            </div>

            {/* Monaco Editor */}
            <div className="flex-1 relative min-h-[240px]">
              <Editor
                height="100%"
                language={question.language === 'typescript' ? 'typescript' : question.language}
                theme="vs-dark"
                value={code}
                onChange={(value) => setCode(value || '')}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                  padding: { top: 16 },
                  scrollBeyondLastLine: false,
                  smoothScrolling: true,
                }}
              />
            </div>

            {/* Terminal / Result Output */}
            <div className="h-64 border-t border-white/[.06] bg-black/40 flex flex-col shrink-0">
              <AnimatePresence mode="wait">
                {!executionResult ? (
                  <motion.div
                    key="raw-output"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex-1 p-4 overflow-y-auto font-mono text-sm text-slate-300 whitespace-pre-wrap flex items-start gap-2"
                  >
                    <Terminal className="w-4 h-4 text-cyan-300 mt-0.5 shrink-0" />
                    <span>{output || <span className="text-slate-600">No output yet. Run your code to see results.</span>}</span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="results"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="flex-1 overflow-y-auto p-4"
                  >
                    <div className={`relative p-4 rounded-2xl border ${executionResult.all_passed ? 'success-burst bg-lime-300/[.07] border-lime-300/25' : 'bg-pink-400/[.06] border-pink-400/25'}`}>
                      <h4 className={`font-black mb-3 flex items-center gap-2 ${executionResult.all_passed ? 'text-lime-300' : 'text-pink-300'}`}>
                        {executionResult.all_passed ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                        {executionResult.all_passed ? 'All hidden checks passed' : `${executionResult.passed}/${executionResult.total} checks passed`}
                      </h4>

                      <div className="space-y-2">
                        {(executionResult.details || []).map((d: any, i: number) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.06 }}
                            className="flex items-start gap-3 glass rounded-xl p-2.5 text-sm font-mono"
                          >
                            <span className={d.passed ? 'text-lime-300' : 'text-pink-300'}>
                              {d.passed ? '✓' : '×'}
                            </span>
                            <div className="flex-1 text-slate-300">
                              <div><span className="text-slate-500">Input:</span> {d.input}</div>
                              <div className={d.passed ? 'text-lime-300/70' : 'text-pink-300/70'}>
                                {d.passed ? 'Passed successfully' : (d.stderr || 'Output mismatch')}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* Far Right Pane: AI Reasoning (Appears on pass) */}
        <AnimatePresence>
          {executionResult?.all_passed && (
            <motion.div
              initial={{ opacity: 0, x: 30, width: 0 }}
              animate={{ opacity: 1, x: 0, width: 'auto' }}
              exit={{ opacity: 0, x: 30, width: 0 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="w-full lg:w-1/4 gradient-border glass rounded-3xl flex flex-col overflow-hidden"
            >
              <div className="p-4 border-b border-white/[.06] bg-violet-400/[.06]">
                <span className="text-xs font-black text-violet-300 uppercase tracking-[.15em] flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5" /> Prove you understand it
                </span>
              </div>

              <div className="flex-1 p-4 flex flex-col gap-4 overflow-y-auto">
                <p className="text-sm text-slate-400">
                  Why does your solution work? Mention complexity and one edge case.
                </p>
                <textarea
                  className="w-full flex-1 min-h-[150px] bg-black/30 border border-white/10 rounded-2xl p-3 text-sm text-slate-200 resize-none focus:outline-none focus:border-cyan-300/40 transition-colors"
                  placeholder="My solution uses..."
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                />
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={explainCode}
                  disabled={isGrading || !explanation.trim()}
                  className="w-full py-2.5 glass hover:bg-white/[.09] text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isGrading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronRight className="w-4 h-4" />}
                  {isGrading ? 'Grading...' : 'Grade my reasoning'}
                </motion.button>

                <AnimatePresence>
                  {grade && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="success-burst mt-1 p-4 rounded-2xl bg-lime-300/[.08] border border-lime-300/20"
                    >
                      <div className="text-3xl font-black text-lime-300 mb-2">{grade.score}<span className="text-sm text-lime-300/50">/100</span></div>
                      <p className="text-sm text-lime-100/90">{grade.feedback}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
