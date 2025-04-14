import React from 'react';
import { ParentIcon } from '@/lib/icons';

interface ParentSummaryProps {
  username: string;
  topicName: string;
  accuracy: number;
  streak: number;
  className?: string;
}

export function ParentSummary({ 
  username, 
  topicName, 
  accuracy, 
  streak, 
  className = '' 
}: ParentSummaryProps) {
  const summaryText = `"${username} completed today's goal. Topic: ${topicName}. Accuracy: ${accuracy}%. Streak: ${streak} day${streak !== 1 ? 's' : ''}."`
  
  return (
    <div className={`w-full ${className}`}>
      <h2 className="font-heading font-medium text-lg mb-3">Parent Summary</h2>
      <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-primary">
        <p className="text-neutral-700 mb-2">👨‍👦 Parent WhatsApp update:</p>
        <p className="text-neutral-800">{summaryText}</p>
      </div>
    </div>
  );
}
