import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useHabitContext } from '../../context/HabitContext';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { Sparkles, RefreshCw, Trophy, Flame } from 'lucide-react';

export const AnalyticsView: React.FC = () => {
  const { habits, logs, aiWeeklyReview, fetchAIWeeklyReview, streakStats } = useHabitContext();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Recharts Weekly Data (Last 7 Days)
  const today = new Date();
  const weeklyData = [];
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today.getTime() - i * 86400000);
    const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const count = logs.filter(l => l.date === dateKey && l.completed).length;
    weeklyData.push({
      day: daysOfWeek[d.getDay()],
      completions: count,
      target: habits.length || 4
    });
  }

  // Monthly Trend Data: real completion rate for each of the last 4 weeks
  const activeHabitsCount = habits.filter(h => !h.isArchived && !h.isPaused).length || 1;
  const monthlyData = [];
  for (let w = 3; w >= 0; w--) {
    let doneCount = 0;
    for (let d = 0; d < 7; d++) {
      const dayOffset = w * 7 + d;
      const dt = new Date(today.getTime() - dayOffset * 86400000);
      const dateKey = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
      doneCount += logs.filter(l => l.date === dateKey && l.completed).length;
    }
    const possible = activeHabitsCount * 7;
    monthlyData.push({
      period: `Week ${4 - w}`,
      rate: possible > 0 ? Math.round((doneCount / possible) * 100) : 0
    });
  }

  // Category Distribution Data
  const categoryCounts: Record<string, number> = {};
  habits.forEach(h => {
    categoryCounts[h.category] = (categoryCounts[h.category] || 0) + 1;
  });

  const pieData = Object.keys(categoryCounts).map(cat => ({
    name: cat,
    value: categoryCounts[cat]
  }));

  const PIE_COLORS = ['#63C7D8', '#3FB7CB', '#A8E6CF', '#C7B8FF', '#FFD78C', '#F4A7A7'];

  const handleFetchReview = async () => {
    setIsRefreshing(true);
    await fetchAIWeeklyReview();
    setIsRefreshing(false);
  };

  return (
    <div className="space-y-10">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1E293B] dark:text-slate-100">
          Behavioral Trend Analytics
        </h1>
        <p className="text-xs sm:text-sm text-[#64748B] dark:text-slate-400">
          In-depth completion charts, habit strength distribution, and AI weekly reviews
        </p>
      </div>

      {/* Historical Milestones Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-[#EEF2F6] dark:border-slate-700 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-[#64748B] dark:text-slate-400">Longest Streak Recorded</p>
            <p className="text-2xl font-bold text-[#0F172A] dark:text-slate-100 mt-1">{streakStats.longestStreak} Days</p>
            <p className="text-[11px] text-[#94A3B8] dark:text-slate-500 mt-0.5">All-time personal record</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#00A8B5]/10 flex items-center justify-center text-[#00A8B5]">
            <Trophy className="w-5 h-5" />
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-[#EEF2F6] dark:border-slate-700 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-[#64748B] dark:text-slate-400">Best Performing Month</p>
            <p className="text-2xl font-bold text-[#0F172A] dark:text-slate-100 mt-1">{streakStats.bestMonth}</p>
            <p className="text-[11px] text-[#94A3B8] dark:text-slate-500 mt-0.5">Highest routine consistency</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#00A8B5]/10 flex items-center justify-center text-[#00A8B5]">
            <Flame className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* AI Weekly Review Banner */}
      {aiWeeklyReview && (
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#1E293B] via-[#28364B] to-[#1E293B] text-white shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#63C7D8]" />
              <h3 className="text-base font-bold text-white">AI Weekly Performance Review</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-[#A8E6CF] text-[#1E293B] text-xs font-extrabold">
                Grade: {aiWeeklyReview.scoreGrade}
              </span>
              <button
                onClick={handleFetchReview}
                disabled={isRefreshing}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          <p className="text-sm text-slate-200 leading-relaxed font-normal">
            {aiWeeklyReview.summary}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-3.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10">
              <p className="text-[11px] text-[#A8E6CF] font-bold">Strongest Habit Routine</p>
              <p className="text-xs font-bold text-white mt-0.5">{aiWeeklyReview.strongestHabit}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10">
              <p className="text-[11px] text-[#FFD78C] font-bold">Recommended Focus Area</p>
              <p className="text-xs font-bold text-white mt-0.5">{aiWeeklyReview.focusArea}</p>
            </div>
          </div>
        </div>
      )}

      {/* Recharts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Weekly Completions Bar Chart */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 border border-[#E5EEF2] dark:border-slate-700 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#1E293B] dark:text-slate-100">Weekly Habit Completions</h3>
            <span className="text-xs text-[#64748B] dark:text-slate-400">Last 7 Days</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <XAxis dataKey="day" stroke="#64748B" fontSize={12} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1E293B', borderRadius: '12px', color: '#fff', border: 'none' }}
                />
                <Bar dataKey="completions" fill="#63C7D8" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown Pie Chart */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 border border-[#E5EEF2] dark:border-slate-700 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-[#1E293B] dark:text-slate-100">Category Distribution</h3>
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Trend Area Chart */}
        <div className="lg:col-span-12 bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 border border-[#E5EEF2] dark:border-slate-700 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-[#1E293B] dark:text-slate-100">Monthly Momentum Velocity (%)</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData}>
                <XAxis dataKey="period" stroke="#64748B" fontSize={12} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={12} tickLine={false} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1E293B', borderRadius: '12px', color: '#fff', border: 'none' }}
                />
                <Area type="monotone" dataKey="rate" stroke="#3FB7CB" fill="#63C7D830" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
};
