import React from 'react';
import { FlameIcon } from '@/lib/icons';

interface StreakCalendarProps {
  currentStreak: number;
  className?: string;
}

export function StreakCalendar({ currentStreak, className = '' }: StreakCalendarProps) {
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const today = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
  // Convert to our format where 0 = Monday
  const adjustedToday = today === 0 ? 6 : today - 1;
  
  return (
    <div className={`bg-white rounded-xl shadow-sm p-5 ${className}`}>
      <h2 className="font-heading font-medium text-lg mb-4">Your Learning Streak</h2>
      <div className="flex justify-between mb-2">
        {days.map((day, index) => {
          const isToday = index === adjustedToday;
          const isPast = index < adjustedToday;
          const isStreak = isPast && index >= (adjustedToday - currentStreak + 1);
          
          return (
            <div key={day} className="flex flex-col items-center">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center mb-1
                  ${isToday ? 'bg-accent' : isStreak ? 'bg-accent bg-opacity-20' : 'bg-neutral-200'}
                  ${isToday ? 'streak-flame' : ''}
                `}
              >
                <span className={`font-medium ${isToday ? 'text-white' : isStreak ? 'text-accent' : 'text-neutral-400'}`}>
                  {day}
                </span>
              </div>
              <span className="text-xs text-neutral-500">{index + 1}</span>
            </div>
          );
        })}
      </div>
      <p className="text-center text-sm text-neutral-600 mt-2">
        You're on a {currentStreak}-day streak! {currentStreak > 0 ? '🔥' : ''}
      </p>
    </div>
  );
}
