'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/auth-helpers-nextjs';
import { motion } from 'framer-motion';
import { Dna, HeartPulse, ShieldCheck, Stethoscope } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleGoogleLogin = async () => {
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback` }
        });
        if (error) throw error;
        alert('Check your email for confirmation!');
      }
      router.push('/');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-slate-950">
      {/* Bio-background Animation */}
      <div className="absolute inset-0 z-0">
        <motion.div 
          animate={{ opacity: [0.1, 0.3, 0.1] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute top-1/4 -left-20 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl"
        />
        <motion.div 
          animate={{ opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 6, repeat: Infinity, delay: 1 }}
          className="absolute bottom-1/4 -right-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"
        />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass w-full max-w-md p-8 lg:p-12 rounded-[2rem] z-10 relative border-sky-500/20 shadow-2xl"
      >
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-4 rounded-3xl bg-sky-500/10 text-sky-400 mb-6 border border-sky-500/20">
            <HeartPulse size={48} className="animate-pulse" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
            Dih Detector
          </h1>
          <p className="text-slate-400 text-sm">Secure biometric-style portal for Dih Detector</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest flex items-center gap-2 px-1">
              <Dna size={12} /> Email Identifier
            </label>
            <input
              type="email"
              required
              className="w-full bg-slate-900/60 border border-slate-700/50 rounded-2xl p-4 text-white placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500/40 transition-all"
              placeholder="patient@scan.ai"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest flex items-center gap-2 px-1">
              <ShieldCheck size={12} /> Protection Key
            </label>
            <input
              type="password"
              required
              className="w-full bg-slate-900/60 border border-slate-700/50 rounded-2xl p-4 text-white placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500/40 transition-all"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl text-rose-500 text-sm flex items-center gap-2"
            >
              <Stethoscope size={16} /> {error}
            </motion.div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-500 hover:to-sky-400 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] active:scale-95 shadow-lg shadow-sky-500/20 mb-4"
          >
            {loading ? 'Processing...' : (isLogin ? 'Grant Access' : 'Register Entry')}
          </button>

          <div className="relative flex items-center gap-4 my-6">
            <div className="flex-grow h-px bg-slate-800"></div>
            <span className="text-slate-500 text-[10px] uppercase tracking-widest font-bold">Secure Redirect</span>
            <div className="flex-grow h-px bg-slate-800"></div>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full bg-white hover:bg-slate-50 text-slate-900 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all transform hover:scale-[1.02] active:scale-95 shadow-xl"
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M24 12.44c0-.7-.07-1.41-.21-2.1H12v4.03h6.74a5.78 5.78 0 0 1-2.5 3.8l-.01.01v3.13h4.03c2.38-2.18 3.74-5.39 3.74-8.87z" />
              <path fill="#4285F4" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.83-3.13a7.17 7.17 0 0 1-11.4-3.71H.67v3.13A11.97 11.97 0 0 0 12 24z" />
              <path fill="#FBBC05" d="M4.7 14.25a7.18 7.18 0 0 1 0-4.5V6.62H.67a11.97 11.97 0 0 0 0 10.76l4.03-3.13z" />
              <path fill="#34A853" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.41-3.41A11.96 11.96 0 0 0 12 0 11.97 11.97 0 0 0 .67 6.62l4.03 3.13A7.18 7.18 0 0 1 12 4.75z" />
            </svg>
            Sign in with Google
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-slate-800/50 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-slate-400 hover:text-sky-400 text-sm transition-colors"
          >
            {isLogin ? "Need a patient ID? Register here" : "Return to secure login"}
          </button>
        </div>

        {/* Decorative elements */}
        <div className="absolute -bottom-6 -right-6 text-slate-900/40">
           <Dna size={120} strokeWidth={1} />
        </div>
      </motion.div>
    </div>
  );
}
