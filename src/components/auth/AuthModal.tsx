import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, User, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
import { Logo } from '../common/Logo';
import { useHabitContext } from '../../context/HabitContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const {
    signInWithPassword,
    signUpWithPassword,
    resetPasswordForEmail,
    isPasswordRecovery,
    updatePassword,
    setIsLandingPage,
    setActiveTab
  } = useHabitContext();
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [needsEmailConfirmation, setNeedsEmailConfirmation] = useState(false);
  const [error, setError] = useState('');

  // New-password fields, used only while completing a password reset
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordUpdated, setPasswordUpdated] = useState(false);

  if (!isOpen) return null;

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!newPassword || newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      await updatePassword(newPassword);
      setPasswordUpdated(true);
      setNewPassword('');
      setConfirmNewPassword('');
      setTimeout(() => {
        setPasswordUpdated(false);
        onClose();
        setIsLandingPage(false);
        setActiveTab('dashboard');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to update password. Please try again.');
    }
    setIsSubmitting(false);
  };

  const switchMode = (nextMode: 'login' | 'signup' | 'forgot') => {
    setMode(nextMode);
    setError('');
    setResetSent(false);
    setNeedsEmailConfirmation(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    if (mode === 'forgot') {
      setIsSubmitting(true);
      try {
        await resetPasswordForEmail(email);
        setResetSent(true);
      } catch (err: any) {
        setError(err.message || 'Failed to send reset email.');
      }
      setIsSubmitting(false);
      return;
    }

    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === 'signup') {
        const signedInImmediately = await signUpWithPassword(email, password, name);
        if (!signedInImmediately) {
          // Email confirmation is required before Supabase will issue a session --
          // there's no account to redirect into yet, so don't pretend there is.
          setNeedsEmailConfirmation(true);
          setIsSubmitting(false);
          return;
        }
      } else {
        await signInWithPassword(email, password);
      }
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
        setIsLandingPage(false);
        setActiveTab('dashboard');
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please try again.');
    }
    setIsSubmitting(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-3xl bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-[#E5EEF2] dark:border-slate-700 overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[520px]"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/80 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 text-[#64748B] dark:text-slate-400 hover:text-[#1E293B] dark:hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Visual Column */}
        <div className="md:col-span-5 bg-gradient-to-br from-[#1E293B] via-[#28364B] to-[#1E293B] p-8 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="space-y-6 relative z-10">
            <Logo size="md" showText={false} />
            <div>
              <span className="text-xs font-bold text-[#63C7D8] uppercase tracking-wider">MOMENTUM AUTH</span>
              <h3 className="text-2xl font-bold tracking-tight text-white mt-1">
                {isPasswordRecovery
                  ? 'Set New Password'
                  : mode === 'signup' ? 'Start Your Journey' : mode === 'login' ? 'Welcome Back' : 'Reset Password'}
              </h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Consistency is the bridge between goals and accomplishment.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 space-y-2 relative z-10">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#A8E6CF]">
              <Sparkles className="w-4 h-4" />
              <span>Daily Principle</span>
            </div>
            <p className="text-xs text-slate-200 italic">
              "Small actions repeated consistently create extraordinary change."
            </p>
          </div>
        </div>

        {/* Right Form Column */}
        <div className="md:col-span-7 p-8 sm:p-10 flex flex-col justify-between bg-white dark:bg-slate-800">
          {isPasswordRecovery ? (
            <div>
              {/* Set-new-password form, shown after clicking a "reset password" email link */}
              <AnimatePresence>
                {passwordUpdated && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 p-3 rounded-xl bg-[#A8E6CF]/30 border border-[#7ED6A7] text-[#1E293B] dark:text-slate-100 text-xs font-semibold flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#7ED6A7]" />
                    <span>Password updated! Redirecting to Dashboard...</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {error && (
                <div className="mb-4 p-3 rounded-xl bg-[#F4A7A7]/30 border border-[#F4A7A7] text-[#1E293B] dark:text-slate-100 text-xs font-semibold">
                  {error}
                </div>
              )}

              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#1E293B] dark:text-slate-100 mb-1">New Password</label>
                  <div className="relative flex items-center">
                    <Lock className="absolute left-3.5 w-4 h-4 text-[#64748B] dark:text-slate-400" />
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-slate-900 border border-[#E5EEF2] dark:border-slate-700 text-xs text-[#1E293B] dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#63C7D8]"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1E293B] dark:text-slate-100 mb-1">Confirm New Password</label>
                  <div className="relative flex items-center">
                    <Lock className="absolute left-3.5 w-4 h-4 text-[#64748B] dark:text-slate-400" />
                    <input
                      type="password"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-slate-900 border border-[#E5EEF2] dark:border-slate-700 text-xs text-[#1E293B] dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#63C7D8]"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-xl bg-[#1E293B] text-white text-xs font-bold hover:bg-[#334155] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    <>
                      <span>Update Password</span>
                      <ArrowRight className="w-4 h-4 text-[#63C7D8]" />
                    </>
                  )}
                </button>
              </form>
            </div>
          ) : (
          <>
          <div>
            {/* Header Tabs */}
            <div className="flex items-center gap-6 border-b border-[#E5EEF2] dark:border-slate-700 pb-3 mb-6">
              <button
                onClick={() => switchMode('login')}
                className={`text-sm font-bold cursor-pointer transition-colors ${
                  mode === 'login' ? 'text-[#1E293B] dark:text-slate-100 border-b-2 border-[#63C7D8] pb-1' : 'text-[#64748B] dark:text-slate-400 hover:text-[#1E293B] dark:hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => switchMode('signup')}
                className={`text-sm font-bold cursor-pointer transition-colors ${
                  mode === 'signup' ? 'text-[#1E293B] dark:text-slate-100 border-b-2 border-[#63C7D8] pb-1' : 'text-[#64748B] dark:text-slate-400 hover:text-[#1E293B] dark:hover:text-white'
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Success Message */}
            <AnimatePresence>
              {resetSent && mode === 'forgot' ? (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-3 rounded-xl bg-[#A8E6CF]/30 border border-[#7ED6A7] text-[#1E293B] dark:text-slate-100 text-xs font-semibold flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#7ED6A7]" />
                  <span>Password reset email sent! Check your inbox.</span>
                </motion.div>
              ) : needsEmailConfirmation && mode === 'signup' ? (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-3 rounded-xl bg-[#A8E6CF]/30 border border-[#7ED6A7] text-[#1E293B] dark:text-slate-100 text-xs font-semibold flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#7ED6A7]" />
                  <span>Account created! Check {email} for a confirmation link before signing in.</span>
                </motion.div>
              ) : isSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-3 rounded-xl bg-[#A8E6CF]/30 border border-[#7ED6A7] text-[#1E293B] dark:text-slate-100 text-xs font-semibold flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#7ED6A7]" />
                  <span>Authentication successful! Redirecting to Dashboard...</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-[#F4A7A7]/30 border border-[#F4A7A7] text-[#1E293B] dark:text-slate-100 text-xs font-semibold">
                {error}
              </div>
            )}

            {/* Form Fields */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div>
                  <label className="block text-xs font-semibold text-[#1E293B] dark:text-slate-100 mb-1">Full Name</label>
                  <div className="relative flex items-center">
                    <User className="absolute left-3.5 w-4 h-4 text-[#64748B] dark:text-slate-400" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Alex Rivera"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-slate-900 border border-[#E5EEF2] dark:border-slate-700 text-xs text-[#1E293B] dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#63C7D8]"
                      required
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#1E293B] dark:text-slate-100 mb-1">Email Address</label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-3.5 w-4 h-4 text-[#64748B] dark:text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@momentum.app"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-slate-900 border border-[#E5EEF2] dark:border-slate-700 text-xs text-[#1E293B] dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#63C7D8]"
                    required
                  />
                </div>
              </div>

              {mode !== 'forgot' && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-[#1E293B] dark:text-slate-100">Password</label>
                    {mode === 'login' && (
                      <button
                        type="button"
                        onClick={() => switchMode('forgot')}
                        className="text-[11px] text-[#63C7D8] hover:underline cursor-pointer"
                      >
                        Forgot?
                      </button>
                    )}
                  </div>
                  <div className="relative flex items-center">
                    <Lock className="absolute left-3.5 w-4 h-4 text-[#64748B] dark:text-slate-400" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-slate-900 border border-[#E5EEF2] dark:border-slate-700 text-xs text-[#1E293B] dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#63C7D8]"
                      required
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-[#1E293B] text-white text-xs font-bold hover:bg-[#334155] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-60"
              >
                {isSubmitting ? (
                  <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <>
                    <span>{mode === 'signup' ? 'Create Account' : mode === 'login' ? 'Sign In' : 'Send Reset Link'}</span>
                    <ArrowRight className="w-4 h-4 text-[#63C7D8]" />
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="pt-4 text-center text-[11px] text-[#64748B] dark:text-slate-400">
            {mode === 'login' ? (
              <p>Don't have an account? <button onClick={() => switchMode('signup')} className="text-[#63C7D8] font-semibold hover:underline cursor-pointer">Sign up</button></p>
            ) : (
              <p>Already have an account? <button onClick={() => switchMode('login')} className="text-[#63C7D8] font-semibold hover:underline cursor-pointer">Sign in</button></p>
            )}
          </div>
          </>
          )}
        </div>
      </motion.div>
    </div>
  );
};
