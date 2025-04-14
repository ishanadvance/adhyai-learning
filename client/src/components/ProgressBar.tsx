import React from 'react';

interface ProgressBarProps {
  progress: number;
  label?: string;
  level?: number;
  className?: string;
}

export function ProgressBar({ progress, label = "Mastery", level, className }: ProgressBarProps) {
  // Ensure progress is between 0 and 100
  const clampedProgress = Math.min(Math.max(progress, 0), 100);
  
  return (
    <div className={className}>
      <div className="flex justify-between text-sm mb-1">
        <span className="font-medium">{label}: {clampedProgress}%</span>
        {level && <span>Level {level}</span>}
      </div>
      <div className="w-full bg-neutral-200 rounded-full h-3">
        <div 
          className="bg-primary h-3 rounded-full progress-bar" 
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  );
}
