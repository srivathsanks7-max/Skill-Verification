"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, CheckCircle, XCircle, AlertCircle, Code2, Upload, FileText, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function JobReadiness() {
  const [jobDescription, setJobDescription] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [readiness, setReadiness] = useState<any[] | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast.error('Please upload a valid PDF file.');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/parse-pdf', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to parse PDF');
      }

      const data = await response.json();
      setJobDescription((prev) => prev ? prev + '\n\n--- PDF Content ---\n\n' + data.text : data.text);
      toast.success('PDF text extracted successfully!');
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Error extracting PDF text');
    } finally {
      setIsUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleCheck = async () => {
    if (!jobDescription.trim()) return;
    setIsChecking(true);

    try {
      const response = await fetch('/api/check-readiness', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobDescription })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to check readiness');
      }
      const data = await response.json();

      setReadiness(data.readiness);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Failed to check job readiness');
    } finally {
      setIsChecking(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'strong': return <CheckCircle className="w-5 h-5 text-emerald-400" />;
      case 'moderate': return <CheckCircle className="w-5 h-5 text-amber-400" />;
      case 'weak': return <AlertCircle className="w-5 h-5 text-orange-400" />;
      case 'none': return <XCircle className="w-5 h-5 text-rose-400" />;
      default: return null;
    }
  };

  return (
    <div className="ring-spin gradient-border glass rounded-3xl p-6 card-lift h-full">
      <div className="flex items-center gap-3 mb-6">
        <motion.div whileHover={{ rotate: 8, scale: 1.08 }} className="p-2 bg-cyan-300/10 rounded-xl">
          <Briefcase className="w-6 h-6 text-cyan-300" />
        </motion.div>
        <div>
          <h2 className="text-xl font-black text-white">Job Readiness Checker</h2>
          <p className="text-slate-400 text-sm">Compare job requirements against your evidence</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!readiness ? (
          <motion.div
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste job description here..."
              className="w-full h-32 glass rounded-2xl border border-white/10 p-4 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-300/40 resize-none transition-shadow"
            />

            <div className="flex items-center justify-between">
              <div className="relative">
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileUpload}
                  disabled={isUploading || isChecking}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  disabled={isUploading || isChecking}
                  className="flex items-center gap-2 px-4 py-2 bg-white/[.05] hover:bg-white/[.09] disabled:opacity-50 text-slate-300 text-sm font-medium rounded-xl transition-colors border border-white/10"
                >
                  {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  {isUploading ? 'Extracting text...' : 'Upload PDF'}
                </button>
              </div>
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <FileText className="w-3 h-3" /> PDF only
              </span>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCheck}
              disabled={isChecking || !jobDescription.trim()}
              className="glow-button w-full py-2.5 bg-gradient-to-r from-cyan-400 to-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {isChecking ? (
                <span className="flex items-center gap-2">Checking evidence... <Loader2 className="w-4 h-4 animate-spin" /></span>
              ) : (
                "Check Readiness"
              )}
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-6"
          >
            <div className="overflow-hidden border border-white/10 rounded-2xl bg-white/[.025]">
              <table className="w-full text-left text-sm">
                <thead className="bg-white/[.05] text-slate-300">
                  <tr>
                    <th className="px-4 py-3 font-medium">Requirement</th>
                    <th className="px-4 py-3 font-medium">Your Evidence</th>
                    <th className="px-4 py-3 font-medium text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[.06]">
                  {readiness.map((item, idx) => (
                    <motion.tr
                      key={idx}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.06 }}
                      className="hover:bg-white/[.05] transition-colors"
                    >
                      <td className="px-4 py-3 font-medium text-white">{item.skill}</td>
                      <td className="px-4 py-3 text-slate-400">{item.evidence}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <span className="capitalize text-slate-300">{item.status}</span>
                          {getStatusIcon(item.status)}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="success-burst bg-cyan-300/[.06] border border-cyan-300/20 rounded-2xl p-4 text-center">
              <h3 className="text-white font-black mb-2">Close the Gap</h3>
              <p className="text-cyan-100/80 text-sm mb-4">We found areas where your evidence is weak or missing. Take a targeted assessment to prove these skills.</p>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  const weaknesses = readiness.filter(r => r.status === 'weak' || r.status === 'none').map(r => r.skill).join(',');
                  if (weaknesses) {
                    window.location.href = `/assessments?focus=${encodeURIComponent(weaknesses)}`;
                  } else {
                    toast.success('You have strong evidence for everything! You are ready to apply.');
                  }
                }}
                className="glow-button inline-flex items-center justify-center gap-2 px-6 py-2 bg-gradient-to-r from-cyan-400 to-violet-500 text-white font-bold rounded-xl"
              >
                <Code2 className="w-4 h-4" /> Prepare for this Job
              </motion.button>
            </div>

            <button onClick={() => setReadiness(null)} className="link-draw text-sm text-slate-400 hover:text-white transition-colors w-full text-center">
              Check another job description
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
