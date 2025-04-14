import React from 'react';

interface EmotionCheckpointProps {
  onContinue: () => void;
  onSimplify: () => void;
  className?: string;
}

export function EmotionCheckpoint({ onContinue, onSimplify, className = '' }: EmotionCheckpointProps) {
  return (
    <div className={`bg-white rounded-xl shadow-md p-5 mb-6 ${className}`}>
      <div className="text-center mb-4">
        <span className="text-4xl">😊</span>
        <h2 className="text-lg font-medium mt-2">Taking your time?</h2>
        <p className="text-neutral-600 mt-1">No rush! Learning happens at your own pace.</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button 
          onClick={onContinue} 
          className="p-3 rounded-lg bg-primary text-white font-medium"
        >
          Continue as is
        </button>
        <button 
          onClick={onSimplify} 
          className="p-3 rounded-lg border border-primary text-primary font-medium"
        >
          Try easier example
        </button>
      </div>
    </div>
  );
}
