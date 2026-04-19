'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, AlertCircle, CheckCircle2, Info, Loader2, Send, Stethoscope, LogOut, User, ShieldCheck } from 'lucide-react';
import { clsx } from 'clsx';
import { createBrowserClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';

interface Prediction {
  risk_level: 'low' | 'medium' | 'high';
  recommended_action: string;
  trigger_words: string[];
  explanation: string;
  advice?: string; // Optonal medical advice field
}

export default function Home() {
  const [symptom, setSymptom] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Force re-render key
  const [renderId] = useState(Date.now());

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) setUser(session.user);
    };
    getUser();
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptom.trim()) return;

    setIsLoading(true);
    setPrediction(null);

    try {
      const res = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          symptom_text: symptom,
          user_id: user?.id
        }),
      });
      const data = await res.json();
      if (data.error) {
        alert(`Error: ${data.error}`);
        setPrediction(null);
      } else {
        setPrediction(data);
      }
    } catch (error) {
      console.error('Failed to predict:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="max-w-4xl mx-auto px-6 py-12 lg:py-24">
      {/* Auth Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-2 bg-slate-900/50 border border-slate-700/50 px-4 py-2 rounded-full text-slate-400 text-sm">
          <User size={14} />
          {user?.email || 'Authenticated Patient'}
        </div>
        <button 
          onClick={handleLogout}
          className="text-slate-500 hover:text-rose-400 p-2 transition-colors flex items-center gap-2 text-sm"
        >
          <LogOut size={16} /> Logout
        </button>
      </div>

      {/* Header */}
      <motion.div 
        key={renderId}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <div className="inline-flex items-center justify-center p-3 mb-6 rounded-2xl bg-sky-500/10 text-sky-400">
          <Stethoscope size={40} />
        </div>
        <h1 className="text-5xl font-bold tracking-tight mb-4 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
          Dih Detector AI
        </h1>
        <p className="text-slate-400 text-lg max-w-xl mx-auto">
          Advanced medical risk classification for immediate clinical guidance.
        </p>
      </motion.div>

      {/* Input Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass p-8 rounded-3xl glow-blue mb-12"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <label htmlFor="symptoms" className="block text-sm font-medium text-slate-400 mb-2">
              Describe how you're feeling
            </label>
            <textarea
              id="symptoms"
              rows={4}
              className="w-full bg-slate-900/50 border border-slate-700/50 rounded-2xl p-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all resize-none"
              placeholder="e.g. I have a severe headache and I'm feeling dizzy since morning..."
              value={symptom}
              onChange={(e) => setSymptom(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !symptom.trim()}
            className="w-full bg-sky-500 hover:bg-sky-400 disabled:bg-slate-800 disabled:text-slate-500 py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-all group lg:text-lg"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <>
                Analyze Risks
                <Send size={18} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>
      </motion.div>

      {/* Results Section */}
      <AnimatePresence>
        {prediction && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={clsx(
              "glass p-8 rounded-3xl mb-12",
              prediction.risk_level === 'high' ? 'glow-red border-rose-500/30' : 
              prediction.risk_level === 'medium' ? 'glow-amber border-amber-500/30' : 
              'glow-blue border-emerald-500/30'
            )}
          >
            <div className="flex flex-col md:flex-row gap-8 items-start">
              {/* Risk Badge */}
              <div className="flex-shrink-0">
                <div className={clsx(
                  "p-4 rounded-2xl flex flex-col items-center justify-center w-32 h-32 text-center",
                  prediction.risk_level === 'high' ? 'bg-rose-500/10 text-rose-500' :
                  prediction.risk_level === 'medium' ? 'bg-amber-500/10 text-amber-500' :
                  'bg-emerald-500/10 text-emerald-500'
                )}>
                  {prediction.risk_level === 'high' ? <AlertCircle size={40} /> :
                   prediction.risk_level === 'medium' ? <Info size={40} /> :
                   <CheckCircle2 size={40} />}
                  <span className="font-bold mt-2 uppercase text-xs tracking-widest">{prediction.risk_level} RISK</span>
                </div>
              </div>

              {/* Details */}
              <div className="flex-grow">
                <h3 className="text-2xl font-bold mb-4">Recommended Action</h3>
                <p className="text-xl text-white mb-6 font-medium leading-relaxed italic">
                  "{prediction.recommended_action}"
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                       <Activity size={14} /> Trigger Words
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {prediction.trigger_words?.length > 0 ? prediction.trigger_words.map(word => (
                        <span key={word} className="bg-slate-800 border border-slate-700 px-3 py-1 rounded-lg text-sm text-slate-300">
                          {word}
                        </span>
                      )) : <span className="text-slate-500 text-sm">None detected</span>}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                       <ShieldCheck size={14} /> Specialized Advice
                    </h4>
                    <p className="text-sm text-white font-medium mb-4">
                      {prediction.advice || "Standard medical follow-up recommended."}
                    </p>
                    <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1">Diagnostic Note</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {prediction.explanation}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer Info */}
      <div className="text-center text-slate-500 text-xs mt-12 space-y-2">
        <p>This is an AI demonstration for educational purposes only.</p>
        <p>In case of a life-threatening emergency, call your local emergency number immediately.</p>
      </div>
    </main>
  );
}
