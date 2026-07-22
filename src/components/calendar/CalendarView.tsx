import React, { useState } from 'react';
import { useHabitContext } from '../../context/HabitContext';
import { formatDateKey, formatFriendlyDate } from '../../utils/habitUtils';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, CheckCircle2, MinusCircle } from 'lucide-react';

export const CalendarView: React.FC = () => {
  const { habits, logs } = useHabitContext();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDayKey, setSelectedDayKey] = useState<string | null>(formatDateKey(new Date()));

  const activeHabits = habits.filter(h => !h.isArchived);

  // Month navigation
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Days in month calculation
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const calendarDays = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push(new Date(year, month, d));
  }

  // Selected Day Details
  const selectedDayLogs = selectedDayKey
    ? activeHabits.map(h => {
        const log = logs.find(l => l.habitId === h.id && l.date === selectedDayKey);
        return {
          habit: h,
          completed: log?.completed || false,
          currentValue: log?.currentValue || 0
        };
      })
    : [];

  const selectedDayCompletedCount = selectedDayLogs.filter(l => l.completed).length;

  // ---------------------------------------------------------------------------
  // Month-by-Month GitHub-Style Consistency Heatmap Matrix
  // ---------------------------------------------------------------------------
  const today = new Date();

  interface HeatmapDay {
    dayNumber: number;
    dateKey: string;
    isFuture: boolean;
    count: number;
    intensity: number;
  }

  interface MonthBlock {
    label: string;
    weeks: (HeatmapDay | null)[][];
  }

  const monthBlocks: MonthBlock[] = [];

  // Generate 12 months (11 months ago through current month)
  for (let i = 11; i >= 0; i--) {
    const mDate = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const mYear = mDate.getFullYear();
    const mMonth = mDate.getMonth();
    const label = mDate.toLocaleString('default', { month: 'short' });

    const firstDay = new Date(mYear, mMonth, 1).getDay(); // 0 = Sun
    const daysCount = new Date(mYear, mMonth + 1, 0).getDate();
    const totalWeeks = Math.ceil((firstDay + daysCount) / 7);

    const weeks: (HeatmapDay | null)[][] = [];

    for (let w = 0; w < totalWeeks; w++) {
      const weekDays: (HeatmapDay | null)[] = [];

      for (let d = 0; d < 7; d++) {
        const dayNumber = w * 7 + d - firstDay + 1;

        if (dayNumber >= 1 && dayNumber <= daysCount) {
          const dateObj = new Date(mYear, mMonth, dayNumber);
          const dateKey = formatDateKey(dateObj);
          const isFuture = dateObj > today;

          const count = isFuture
            ? 0
            : logs.filter(l => l.date === dateKey && l.completed).length;

          let intensity = 0;
          if (!isFuture) {
            if (count >= 4) intensity = 4;
            else if (count === 3) intensity = 3;
            else if (count === 2) intensity = 2;
            else if (count === 1) intensity = 1;
          }

          weekDays.push({
            dayNumber,
            dateKey,
            isFuture,
            count,
            intensity
          });
        } else {
          weekDays.push(null);
        }
      }

      weeks.push(weekDays);
    }

    monthBlocks.push({ label, weeks });
  }

  const getHeatmapColor = (intensity: number) => {
    switch (intensity) {
      case 4: return 'bg-[#3FB7CB]';
      case 3: return 'bg-[#63C7D8]';
      case 2: return 'bg-[#A8E6CF]';
      case 1: return 'bg-[#A8E6CF]/50';
      default: return 'bg-[#F8FAFC] dark:bg-slate-800 border border-[#E5EEF2] dark:border-slate-700';
    }
  };

  return (
    <div className="space-y-10">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1E293B] dark:text-slate-100">
          Consistency & Calendar Heatmap
        </h1>
        <p className="text-xs sm:text-sm text-[#64748B] dark:text-slate-400">
          Visual evidence of your daily effort and momentum over time
        </p>
      </div>

      {/* GitHub-Style Month-by-Month Heatmap */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 border border-[#E5EEF2] dark:border-slate-700 shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-[#63C7D8]" />
            <h3 className="text-sm font-bold text-[#1E293B] dark:text-slate-100">12-Month Habit Heatmap Matrix</h3>
          </div>
          <span className="text-xs font-medium text-[#64748B] dark:text-slate-400">365 Days Logged</span>
        </div>

        {/* Heatmap Grid with Month Blocks & Horizontal Breathing Space */}
        <div className="overflow-x-auto pb-3 scrollbar-none">
          <div className="inline-flex items-start gap-4 sm:gap-5 min-w-max">
            {monthBlocks.map((mb, mIdx) => (
              <div key={mIdx} className="flex flex-col items-center gap-2 shrink-0">
                
                {/* Month Label Centered Above Weeks */}
                <span className="text-xs font-semibold text-[#64748B] dark:text-slate-400 select-none">
                  {mb.label}
                </span>

                {/* Weeks Grid for This Month */}
                <div className="flex gap-1.5">
                  {mb.weeks.map((week, wIdx) => (
                    <div key={wIdx} className="grid grid-rows-7 gap-1.5">
                      {week.map((day, dIdx) => {
                        if (!day) {
                          return <div key={dIdx} className="w-3 h-3 invisible" />;
                        }

                        return (
                          <button
                            key={dIdx}
                            disabled={day.isFuture}
                            onClick={() => !day.isFuture && setSelectedDayKey(day.dateKey)}
                            title={day.isFuture ? 'Future' : `${day.dateKey}: ${day.count} habits completed`}
                            className={`w-3 h-3 rounded-xs transition-transform ${
                              day.isFuture ? 'opacity-25 bg-slate-100 dark:bg-slate-800/60 cursor-default' : 'hover:scale-125 cursor-pointer'
                            } ${getHeatmapColor(day.intensity)}`}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>

              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between text-xs text-[#64748B] dark:text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-700">
          <span>Less</span>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-[#F8FAFC] dark:bg-slate-800 border border-[#E5EEF2] dark:border-slate-700 rounded-xs" />
            <div className="w-3 h-3 bg-[#A8E6CF]/50 rounded-xs" />
            <div className="w-3 h-3 bg-[#A8E6CF] rounded-xs" />
            <div className="w-3 h-3 bg-[#63C7D8] rounded-xs" />
            <div className="w-3 h-3 bg-[#3FB7CB] rounded-xs" />
          </div>
          <span>More</span>
        </div>
      </div>

      {/* Monthly Calendar + Day Detail Breakdown Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Monthly Calendar View */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 border border-[#E5EEF2] dark:border-slate-700 shadow-xs space-y-6">

          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[#1E293B] dark:text-slate-100">{monthName}</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={prevMonth}
                className="p-2 rounded-xl hover:bg-[#F8FAFC] dark:hover:bg-slate-700 border border-[#E5EEF2] dark:border-slate-700 text-[#64748B] dark:text-slate-400 hover:text-[#1E293B] dark:hover:text-white cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextMonth}
                className="p-2 rounded-xl hover:bg-[#F8FAFC] dark:hover:bg-slate-700 border border-[#E5EEF2] dark:border-slate-700 text-[#64748B] dark:text-slate-400 hover:text-[#1E293B] dark:hover:text-white cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekday Labels */}
          <div className="grid grid-cols-7 text-center text-xs font-bold text-[#64748B] dark:text-slate-400 pb-2 border-b border-slate-100 dark:border-slate-700">
            <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-2 text-center">
            {calendarDays.map((dateObj, idx) => {
              if (!dateObj) return <div key={idx} className="h-10" />;

              const dateKey = formatDateKey(dateObj);
              const isSelected = dateKey === selectedDayKey;

              const dayLogs = logs.filter(l => l.date === dateKey && l.completed);
              const totalCount = dayLogs.length;

              let dayBg = 'bg-[#F8FAFC] dark:bg-slate-800 text-[#1E293B] dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700';
              if (totalCount >= 3) dayBg = 'bg-[#7ED6A7]/30 text-[#1E293B] dark:text-slate-100 font-bold';
              else if (totalCount >= 1) dayBg = 'bg-[#63C7D8]/20 text-[#1E293B] dark:text-slate-100 font-bold';

              return (
                <button
                  key={idx}
                  onClick={() => setSelectedDayKey(dateKey)}
                  className={`h-11 rounded-2xl flex flex-col items-center justify-center relative transition-all cursor-pointer ${dayBg} ${
                    isSelected ? 'ring-2 ring-[#1E293B] ring-offset-2' : ''
                  }`}
                >
                  <span className="text-xs">{dateObj.getDate()}</span>
                  {totalCount > 0 && (
                    <div className="w-1.5 h-1.5 rounded-full bg-[#63C7D8] mt-0.5" />
                  )}
                </button>
              );
            })}
          </div>

        </div>

        {/* Selected Day Breakdown Panel */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 border border-[#E5EEF2] dark:border-slate-700 shadow-xs space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-700 pb-4">
            <span className="text-[10px] font-bold text-[#63C7D8] uppercase tracking-wider">Day Breakdown</span>
            <h3 className="text-base font-bold text-[#1E293B] dark:text-slate-100">
              {selectedDayKey ? formatFriendlyDate(selectedDayKey) : 'Select a Day'}
            </h3>
            <p className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5">
              {selectedDayCompletedCount} of {activeHabits.length} routines completed
            </p>
          </div>

          {/* List of Habits for Selected Day */}
          <div className="space-y-3">
            {selectedDayLogs.map((item, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-2xl border flex items-center justify-between ${
                  item.completed
                    ? 'bg-[#A8E6CF]/15 border-[#7ED6A7]/40 text-[#1E293B] dark:text-slate-100'
                    : 'bg-[#F8FAFC] dark:bg-slate-800/60 border-[#E5EEF2] dark:border-slate-700 text-[#64748B] dark:text-slate-400'
                }`}
              >
                <div className="flex items-center gap-3">
                  {item.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-[#7ED6A7]" />
                  ) : (
                    <MinusCircle className="w-5 h-5 text-slate-300" />
                  )}
                  <div>
                    <p className={`text-xs font-bold ${item.completed ? 'text-[#1E293B] dark:text-slate-100' : 'text-[#64748B] dark:text-slate-400'}`}>
                      {item.habit.title}
                    </p>
                    <p className="text-[10px] text-[#64748B] dark:text-slate-400">
                      {item.completed ? `Done: ${item.habit.targetValue} ${item.habit.targetUnit}` : 'Not completed'}
                    </p>
                  </div>
                </div>

                <span className={`text-xs font-bold ${item.completed ? 'text-[#7ED6A7]' : 'text-[#64748B] dark:text-slate-400'}`}>
                  {item.completed ? '100%' : '0%'}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
