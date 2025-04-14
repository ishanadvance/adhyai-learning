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
    <div className={`bg-gray-800 rounded-xl shadow-md border border-gray-700 p-5 ${className}`}>
      <h2 className="font-heading font-medium text-lg mb-4 text-white">Your Learning Streak</h2>
      <div className="flex justify-between mb-2">
        {days.map((day, index) => {
          const isToday = index === adjustedToday;
          const isPast = index < adjustedToday;
          const isStreak = isPast && index >= (adjustedToday - currentStreak + 1);
          
          return (
            <div key={day + '-' + index} className="flex flex-col items-center">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center mb-1
                  ${isToday ? 'bg-blue-500' : isStreak ? 'bg-blue-900' : 'bg-gray-700'}
                  ${isToday ? 'streak-flame' : ''}
                `}
              >
                <span className={`font-medium ${isToday ? 'text-white' : isStreak ? 'text-blue-400' : 'text-gray-400'}`}>
                  {day}
                </span>
              </div>
              <span className="text-xs text-gray-300">{index + 1}</span>
            </div>
          );
        })}
      </div>
      <p className="text-center text-sm text-gray-300 mt-2">
        You're on a {currentStreak}-day streak! {currentStreak > 0 ? '🔥' : ''}
      </p>
    </div>
  );
}
