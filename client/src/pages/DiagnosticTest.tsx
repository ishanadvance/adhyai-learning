import React, { useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { DiagnosticQuestions } from '@/components/DiagnosticQuestions';
import { Button } from '@/components/ui/button';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useUser } from '@/context/UserContext';
import { useToast } from '@/hooks/use-toast';

export default function DiagnosticTest() {
  const { topicId } = useParams();
  const [, setLocation] = useLocation();
  const { user } = useUser();
  const { toast } = useToast();
  const [diagnosticComplete, setDiagnosticComplete] = useState(false);
  const [diagnosticResult, setDiagnosticResult] = useState<{
    score: number;
    total: number;
    level: number;
  } | null>(null);
  
  const { data: topic, isLoading: isTopicLoading } = useQuery({
    queryKey: [`/api/topics/${topicId}`],
    queryFn: async () => {
      const response = await fetch(`/api/topics/${topicId}`);
      if (!response.ok) throw new Error('Failed to fetch topic');
      return response.json();
    },
    enabled: !!topicId && !!user
  });
  
  const { data: questions, isLoading: isQuestionsLoading } = useQuery({
    queryKey: [`/api/topics/${topicId}/questions`],
    queryFn: async () => {
      const response = await fetch(`/api/topics/${topicId}/questions`);
      if (!response.ok) throw new Error('Failed to fetch questions');
      return response.json();
    },
    enabled: !!topicId && !!user
  });
  
  const createProgressMutation = useMutation({
    mutationFn: async (data: { topicId: number; masteryPercentage: number }) => {
      if (!user) throw new Error('User not logged in');
      const response = await apiRequest('POST', `/api/users/${user.id}/progress`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user?.id}/progress`] });
      toast({
        title: 'Progress saved',
        description: 'Your diagnostic results have been saved',
      });
    },
    onError: (error) => {
      console.error('Error saving progress:', error);
      toast({
        title: 'Error',
        description: 'Failed to save your progress',
        variant: 'destructive',
      });
    }
  });
  
  const handleDiagnosticComplete = (score: number, total: number) => {
    if (!user || !topic) return;
    
    const masteryPercentage = Math.round((score / total) * 100);
    const level = Math.max(1, Math.ceil(masteryPercentage / 33)); // Level 1-3 based on score
    
    setDiagnosticResult({
      score,
      total,
      level
    });
    
    setDiagnosticComplete(true);
    
    // Create user progress
    if (topicId) {
      createProgressMutation.mutate({
        topicId: parseInt(topicId),
        masteryPercentage
      });
    }
  };
  
  const handleStartLearning = () => {
    setLocation(`/learning/${topicId}`);
  };
  
  const handleSkipDiagnostic = () => {
    // Default to level 1 if skipped
    handleDiagnosticComplete(0, 3);
  };
  
  const isLoading = isTopicLoading || isQuestionsLoading;
  
  if (!user) {
    setLocation('/');
    return null;
  }
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading diagnostic test...</span>
      </div>
    );
  }
  
  if (!topic || !questions || questions.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <h1 className="text-2xl font-bold text-primary mb-4">Error</h1>
        <p className="text-neutral-600 mb-6">Could not load the diagnostic test.</p>
        <Button onClick={() => setLocation('/dashboard')}>
          Return to Dashboard
        </Button>
      </div>
    );
  }
  
  const renderDiagnosticTest = () => (
    <div className="min-h-screen flex flex-col p-6 bg-gray-900">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold font-heading text-blue-400">Let's check your knowledge</h1>
        <p className="text-gray-300 mt-2">Quick 3-question diagnostic on {topic.name}</p>
      </div>

      <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-md p-6 mb-6">
        <div className="bg-blue-900 border border-blue-800 p-4 rounded-lg mb-6">
          <p className="text-center text-blue-100 font-medium">This helps us personalize your learning path!</p>
        </div>

        <DiagnosticQuestions
          questions={questions.slice(0, 3)}
          onComplete={handleDiagnosticComplete}
          className="mb-6"
        />
      </div>

      <div className="flex justify-between items-center text-sm text-gray-300">
        <span>Establishing your baseline</span>
        <button onClick={handleSkipDiagnostic} className="text-blue-400 hover:text-blue-300 font-medium">
          Skip Diagnostic
        </button>
      </div>
    </div>
  );
  
  const renderDiagnosticResults = () => {
    if (!diagnosticResult) return null;
    
    const { score, total, level } = diagnosticResult;
    const percentage = Math.round((score / total) * 100);
    
    return (
      <div className="min-h-screen flex flex-col p-6 bg-gray-900">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold font-heading text-blue-400">Diagnostic Complete</h1>
          <p className="text-gray-300 mt-2">We've analyzed your starting point</p>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-md p-6 mb-6">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-blue-900 border-2 border-blue-700 mb-4">
              <span className="text-blue-200 text-4xl font-bold">{level}</span>
            </div>
            <h2 className="text-xl font-heading font-bold text-white">Starting Level</h2>
            <p className="text-gray-300 mt-1">{topic.name} - {level === 1 ? 'Beginner' : level === 2 ? 'Intermediate' : 'Advanced'}</p>
          </div>

          <div className="border-t border-gray-700 pt-6 mb-6">
            <h3 className="font-medium mb-2 text-white">Diagnostic Result</h3>
            <div className="flex items-center mb-4">
              <div className="w-full bg-gray-700 rounded-full h-4">
                <div 
                  className="bg-blue-600 h-4 rounded-full" 
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
              <span className="ml-4 font-bold text-white">{score}/{total}</span>
            </div>
            <p className="text-gray-300 text-sm">
              You got {score} out of {total} questions correct.
            </p>
          </div>

          <div className="bg-blue-900 border border-blue-800 p-4 rounded-lg mb-6">
            <p className="text-center text-blue-100">
              {percentage > 66 
                ? "Great job! You're ready for more advanced content." 
                : percentage > 33 
                  ? "Good start! We'll help you build on this foundation." 
                  : "Don't worry! We'll help you improve step by step."}
            </p>
          </div>

          <Button 
            onClick={handleStartLearning} 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200"
          >
            Begin Your Learning Journey
          </Button>
        </div>
      </div>
    );
  };
  
  return diagnosticComplete ? renderDiagnosticResults() : renderDiagnosticTest();
}
