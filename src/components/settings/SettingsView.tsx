import React, { useState } from 'react';
import { useHabitContext } from '../../context/HabitContext';
import { User, Moon, Sun, Download, Trash2, ShieldCheck, CheckCircle2, LogOut, LogIn } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { userProfile, updateProfile, theme, toggleTheme, habits, logs, session, signOut, openAuthModal, resetAllData } = useHabitContext();

  const [name, setName] = useState(userProfile.name);
  const [email, setEmail] = useState(userProfile.email);
  const [reminderTime, setReminderTime] = useState(userProfile.reminderTime || '08:00');
  const [saved, setSaved] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({ name, email, reminderTime });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ habits, logs, userProfile }));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `momentum_backup_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleResetData = () => {
    if (window.confirm("Are you sure you want to reset all habit progress to initial state? This action cannot be undone.")) {
      resetAllData();
    }
  };

  return (
    <div className="max-w-4xl space-y-8">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1E293B] dark:text-slate-100">
          Application & Profile Settings
        </h1>
        <p className="text-xs sm:text-sm text-[#64748B] dark:text-slate-400">
          Manage your account credentials, notifications, theme preferences, and data backups
        </p>
      </div>

      {/* Success Banner */}
      {saved && (
        <div className="p-4 rounded-2xl bg-[#A8E6CF]/30 border border-[#7ED6A7] text-xs font-bold text-[#1E293B] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#7ED6A7]" />
          <span>Profile settings updated successfully!</span>
        </div>
      )}

      {/* Account Sync Status Card */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 border border-[#E5EEF2] dark:border-slate-700 shadow-xs space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-700 pb-4">
          <div className="w-10 h-10 rounded-2xl bg-[#63C7D8]/20 flex items-center justify-center text-[#1E293B]">
            <ShieldCheck className="w-5 h-5 text-[#3FB7CB]" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#1E293B] dark:text-slate-100">Account & Sync</h3>
            <p className="text-xs text-[#64748B] dark:text-slate-400">Sign in to sync your habits across devices</p>
          </div>
        </div>

        {session?.user ? (
          <div className="flex items-center justify-between p-4 rounded-2xl bg-[#F8FAFC] dark:bg-slate-800/60 border border-[#E5EEF2] dark:border-slate-700">
            <div>
              <p className="text-xs font-bold text-[#1E293B] dark:text-slate-100">Signed in as {session.user.email}</p>
              <p className="text-[11px] text-[#64748B] dark:text-slate-400 mt-0.5">Your data is synced and backed up to your account.</p>
            </div>
            <button
              onClick={signOut}
              className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-[#E5EEF2] dark:border-slate-700 text-[#1E293B] dark:text-slate-100 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              <LogOut className="w-3.5 h-3.5 text-[#64748B] dark:text-slate-400" />
              <span>Sign Out</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between p-4 rounded-2xl bg-[#F8FAFC] dark:bg-slate-800/60 border border-[#E5EEF2] dark:border-slate-700">
            <div>
              <p className="text-xs font-bold text-[#1E293B] dark:text-slate-100">Guest Mode</p>
              <p className="text-[11px] text-[#64748B] dark:text-slate-400 mt-0.5">Your data is stored only in this browser. Sign in to keep it safe and sync across devices.</p>
            </div>
            <button
              onClick={openAuthModal}
              className="px-4 py-2 rounded-xl bg-[#1E293B] text-white text-xs font-bold hover:bg-[#334155] transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              <LogIn className="w-3.5 h-3.5 text-[#63C7D8]" />
              <span>Sign In</span>
            </button>
          </div>
        )}
      </div>

      {/* Profile Settings Card */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 border border-[#E5EEF2] dark:border-slate-700 shadow-xs space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-700 pb-4">
          <div className="w-10 h-10 rounded-2xl bg-[#63C7D8]/20 flex items-center justify-center text-[#1E293B]">
            <User className="w-5 h-5 text-[#3FB7CB]" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#1E293B] dark:text-slate-100">Account Credentials</h3>
            <p className="text-xs text-[#64748B] dark:text-slate-400">Personal details & default reminder time</p>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#1E293B] dark:text-slate-100 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-slate-900 border border-[#E5EEF2] dark:border-slate-700 text-xs text-[#1E293B] dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#63C7D8]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1E293B] dark:text-slate-100 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-slate-900 border border-[#E5EEF2] dark:border-slate-700 text-xs text-[#1E293B] dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#63C7D8]"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1E293B] dark:text-slate-100 mb-1">Default Daily Reminder Time</label>
            <input
              type="time"
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
              className="w-full sm:w-48 px-4 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-slate-900 border border-[#E5EEF2] dark:border-slate-700 text-xs text-[#1E293B] dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#63C7D8]"
            />
          </div>

          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-[#1E293B] text-white text-xs font-bold hover:bg-[#334155] transition-all cursor-pointer shadow-xs"
          >
            Save Changes
          </button>
        </form>
      </div>

      {/* Theme & Notifications Card */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 border border-[#E5EEF2] dark:border-slate-700 shadow-xs space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-700 pb-4">
          <div className="w-10 h-10 rounded-2xl bg-[#C7B8FF]/20 flex items-center justify-center text-[#1E293B]">
            <Moon className="w-5 h-5 text-[#1E293B] dark:text-slate-200" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#1E293B] dark:text-slate-100">Appearance & Mode</h3>
            <p className="text-xs text-[#64748B] dark:text-slate-400">Toggle visual canvas themes</p>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 rounded-2xl bg-[#F8FAFC] dark:bg-slate-800/60 border border-[#E5EEF2] dark:border-slate-700">
          <div className="flex items-center gap-3">
            {theme === 'light' ? <Sun className="w-5 h-5 text-[#FFD78C]" /> : <Moon className="w-5 h-5 text-[#C7B8FF]" />}
            <div>
              <p className="text-xs font-bold text-[#1E293B] dark:text-slate-100">Current Theme: {(theme || 'light').toUpperCase()}</p>
              <p className="text-[11px] text-[#64748B] dark:text-slate-400">Switch between Apple-level clean light theme and dark twilight canvas</p>
            </div>
          </div>

          <button
            onClick={toggleTheme}
            className="px-4 py-2 rounded-xl bg-[#1E293B] text-white text-xs font-bold hover:bg-[#334155] transition-all cursor-pointer"
          >
            Toggle {theme === 'light' ? 'Dark' : 'Light'}
          </button>
        </div>
      </div>

      {/* Data Export & Backup */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 border border-[#E5EEF2] dark:border-slate-700 shadow-xs space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-700 pb-4">
          <div className="w-10 h-10 rounded-2xl bg-[#A8E6CF]/30 flex items-center justify-center text-[#1E293B]">
            <Download className="w-5 h-5 text-[#7ED6A7]" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#1E293B] dark:text-slate-100">Data Management & Backup</h3>
            <p className="text-xs text-[#64748B] dark:text-slate-400">Export complete routine logs or reset state</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleExportData}
            className="px-6 py-3 rounded-xl bg-[#F8FAFC] dark:bg-slate-800 border border-[#E5EEF2] dark:border-slate-700 text-[#1E293B] dark:text-slate-100 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <Download className="w-4 h-4 text-[#63C7D8]" />
            <span>Export Habit Backup (JSON)</span>
          </button>

          <button
            onClick={handleResetData}
            className="px-6 py-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs font-bold hover:bg-rose-100 dark:hover:bg-rose-950/60 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <Trash2 className="w-4 h-4 text-rose-500" />
            <span>Reset All Progress</span>
          </button>
        </div>
      </div>

    </div>
  );
};
