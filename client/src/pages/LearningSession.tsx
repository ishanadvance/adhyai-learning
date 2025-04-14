import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Loader2, Menu, ArrowLeft } from 'lucide-react';
import { LearningQuestion } from '@/components/LearningQuestion';
import { ProgressBar } from '@/components/ProgressBar';
import { EmotionCheckpoint } from '@/components/EmotionCheckpoint';
import { XPIcon } from '@/lib/icons';
import { useUser } from '@/context/UserContext';
import { useTimer } from '@/hooks/useTimer';
import { useEmotionDetection } from '@/hooks/useEmotionDetection';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function LearningSession() {
  const { topicId } = useParams();
  const [, setLocation] = useLocation();
  const { user } = useUser();
  const { toast } = useToast();
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [sessionQuestions, setSessionQuestions] = useState<any[]>([]);
  const [difficulty, setDifficulty] = useState(1);
  const [sessionId, setSessionId] = useState<number | null>(null);
  
  const { 
    seconds, 
    startTimer, 
    pauseTimer, 
    formatTime 
  } = useTimer();
  
  const {
    state: emotionState,
    registerInteraction,
    resetDetection
  } = useEmotionDetection(10000); // 10 seconds of inactivity will trigger emotion checkpoint
  
  // Fetch the topic
  const { data: topic, isLoading: isTopicLoading } = useQuery({
    queryKey: [`/api/topics/${topicId}`],
    queryFn: async () => {
      const response = await fetch(`/api/topics/${topicId}`);
      if (!response.ok) throw new Error('Failed to fetch topic');
      return response.json();
    },
    enabled: !!topicId && !!user
  });
  
  // Fetch all questions for the topic
  const { data: allQuestions, isLoading: isQuestionsLoading } = useQuery({
    queryKey: [`/api/topics/${topicId}/questions`],
    queryFn: async () => {
      const response = await fetch(`/api/topics/${topicId}/questions`);
      if (!response.ok) throw new Error('Failed to fetch questions');
      return response.json();
    },
    enabled: !!topicId && !!user
  });
  
  // Fetch user progress for this topic
  const { data: userProgress, isLoading: isProgressLoading } = useQuery({
    queryKey: [`/api/users/${user?.id}/progress`],
    queryFn: async () => {
      if (!user) throw new Error('User not logged in');
      const response = await fetch(`/api/users/${user.id}/progress`);
      if (!response.ok) throw new Error('Failed to fetch user progress');
      const allProgress = await response.json();
      // Find progress for this specific topic
      return allProgress.find((p: any) => p.topicId === parseInt(topicId));
    },
    enabled: !!user && !!topicId
  });
  
  // Create session mutation
  const createSessionMutation = useMutation({
    mutationFn: async (data: { topicId: number }) => {
      if (!user) throw new Error('User not logged in');
      return apiRequest('POST', `/api/users/${user.id}/sessions`, data)
        .then(response => response.json());
    },
    onSuccess: (data) => {
      setSessionId(data.id);
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user?.id}/sessions`] });
    },
    onError: (error) => {
      console.error('Error creating session:', error);
      toast({
        title: 'Error',
        description: 'Failed to start learning session',
        variant: 'destructive',
      });
    }
  });
  
  // Update session mutation
  const updateSessionMutation = useMutation({
    mutationFn: async (data: any) => {
      if (!sessionId) throw new Error('No active session');
      return apiRequest('PATCH', `/api/sessions/${sessionId}`, data)
        .then(response => response.json());
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user?.id}/sessions`] });
    },
    onError: (error) => {
      console.error('Error updating session:', error);
    }
  });
  
  // Update user progress mutation
  const updateProgressMutation = useMutation({
    mutationFn: async (data: any) => {
      if (!user) throw new Error('User not logged in');
      return apiRequest('PATCH', `/api/users/${user.id}/progress/${topicId}`, data)
        .then(response => response.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user?.id}/progress`] });
    },
    onError: (error) => {
      console.error('Error updating progress:', error);
    }
  });
  
  // Create badge mutation
  const createBadgeMutation = useMutation({
    mutationFn: async (data: { badgeName: string, badgeDescription: string }) => {
      if (!user) throw new Error('User not logged in');
      return apiRequest('POST', `/api/users/${user.id}/badges`, data)
        .then(response => response.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user?.id}/badges`] });
    }
  });
  
  // Create parent summary mutation
  const createSummaryMutation = useMutation({
    mutationFn: async (data: { sessionId: number, content: string }) => {
      if (!user) throw new Error('User not logged in');
      return apiRequest('POST', `/api/users/${user.id}/summaries`, data)
        .then(response => response.json());
    }
  });
  
  // Initialize session when component mounts
  useEffect(() => {
    if (user && topicId && !sessionId) {
      createSessionMutation.mutate({ topicId: parseInt(topicId) });
      startTimer();
    }
    
    return () => {
      pauseTimer();
    };
  }, [user, topicId]);
  
  // Initialize questions for the session
  useEffect(() => {
    if (allQuestions && allQuestions.length > 0) {
      // Filter questions by difficulty
      const filteredQuestions = allQuestions.filter((q: any) => q.difficulty === difficulty);
      
      // If not enough questions of the right difficulty, add some from other difficulties
      let questionsToUse = filteredQuestions;
      if (filteredQuestions.length < 5) {
        questionsToUse = [
          ...filteredQuestions,
          ...allQuestions.filter((q: any) => q.difficulty !== difficulty)
        ].slice(0, 5);
      } else {
        questionsToUse = filteredQuestions.slice(0, 5);
      }
      
      setSessionQuestions(questionsToUse);
    }
  }, [allQuestions, difficulty]);
  
  // Complete the session and send the user to the completion screen
  const completeSession = () => {
    if (!user || !sessionId || !topic) return;
    
    const accuracy = Math.round((correctAnswers / sessionQuestions.length) * 100);
    const masteryPercentage = userProgress ? userProgress.masteryPercentage : 0;
    
    // Calculate new mastery percentage - increases more with higher accuracy
    const newMasteryPercentage = Math.min(
      100, 
      masteryPercentage + Math.round(accuracy / 5)
    );
    
    // XP earned based on accuracy and questions answered
    const xpEarned = Math.round(
      (correctAnswers * 5) + (accuracy >= 80 ? 10 : 0)
    );
    
    // Update session data
    updateSessionMutation.mutate({
      endTime: new Date().toISOString(),
      questionsAttempted: sessionQuestions.length,
      questionsCorrect: correctAnswers,
      xpEarned,
      summary: `Completed ${sessionQuestions.length} questions with ${accuracy}% accuracy.`
    });
    
    // Update user progress
    if (userProgress) {
      updateProgressMutation.mutate({
        masteryPercentage: newMasteryPercentage,
        questionsAttempted: userProgress.questionsAttempted + sessionQuestions.length,
        questionsCorrect: userProgress.questionsCorrect + correctAnswers
      });
    }
    
    // Award badge if first time completing this topic
    if (accuracy >= 70 && (!userProgress || userProgress.masteryPercentage < 50)) {
      createBadgeMutation.mutate({
        badgeName: `${topic.name} Explorer`,
        badgeDescription: `Completed ${topic.name} with at least 70% accuracy`
      });
    }
    
    // Create parent summary
    const summaryContent = `"${user.name} completed today's goal. Topic: ${topic.name}. Accuracy: ${accuracy}%. Streak: ${user.streak} day${user.streak !== 1 ? 's' : ''}."`;
    
    createSummaryMutation.mutate({
      sessionId,
      content: summaryContent
    });
    
    // Navigate to completion screen
    setLocation(`/completion/${sessionId}`);
  };
  
  const handleAnswer = (optionId: number) => {
    registerInteraction();
    
    const currentQuestion = sessionQuestions[currentQuestionIndex];
    
    if (currentQuestion) {
      const isCorrect = optionId === currentQuestion.correctOption;
      
      if (isCorrect) {
        setCorrectAnswers(correctAnswers + 1);
        
        // Increase difficulty after two correct answers
        if (correctAnswers % 2 === 1) {
          setDifficulty(Math.min(3, difficulty + 1));
        }
      } else {
        // Decrease difficulty after two incorrect answers
        if ((sessionQuestions.length - correctAnswers) % 2 === 1) {
          setDifficulty(Math.max(1, difficulty - 1));
        }
      }
      
      // Move to next question or complete session
      if (currentQuestionIndex < sessionQuestions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        completeSession();
      }
    }
  };
  
  const handleHintRequested = () => {
    // You could track hint usage for analytics here
    registerInteraction();
  };
  
  const handleContinueSession = () => {
    resetDetection();
  };
  
  const handleSimplifyQuestion = () => {
    // Decrease difficulty
    setDifficulty(Math.max(1, difficulty - 1));
    resetDetection();
  };
  
  const isLoading = isTopicLoading || isQuestionsLoading || isProgressLoading;
  
  if (!user) {
    setLocation('/');
    return null;
  }
  
  if (isLoading || sessionQuestions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading your learning session...</span>
      </div>
    );
  }
  
  const currentQuestion = sessionQuestions[currentQuestionIndex];
  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <h1 className="text-2xl font-bold text-primary mb-4">Error</h1>
        <p className="text-neutral-600 mb-6">Could not load questions for this topic.</p>
        <Button onClick={() => setLocation('/dashboard')}>
          Return to Dashboard
        </Button>
      </div>
    );
  }
  
  const masteryPercentage = userProgress ? userProgress.masteryPercentage : 0;
  const accuracy = currentQuestionIndex > 0 
    ? Math.round((correctAnswers / currentQuestionIndex) * 100) 
    : 0;
  
  const options = currentQuestion.options.map((text: string, id: number) => ({ text, id }));
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <button onClick={() => setLocation('/dashboard')} className="text-neutral-600 p-1">
              <ArrowLeft className="h-6 w-6" />
            </button>
            <h1 className="font-heading font-bold text-lg">{topic?.name}</h1>
          </div>
          <div className="flex items-center">
            <div className="flex items-center bg-neutral-100 rounded-full px-3 py-1 mr-2">
              <XPIcon className="h-4 w-4 text-amber-500 mr-1" />
              <span className="font-medium text-sm">{user.xpPoints} XP</span>
            </div>
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold">
              {user.name.charAt(0)}
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-auto p-4">
        {/* Progress bar */}
        <ProgressBar 
          progress={masteryPercentage} 
          level={difficulty} 
          className="mb-6" 
        />

        {/* Current question */}
        {emotionState === 'detected' ? (
          <EmotionCheckpoint
            onContinue={handleContinueSession}
            onSimplify={handleSimplifyQuestion}
            className="mb-6"
          />
        ) : (
          <LearningQuestion
            questionNumber={currentQuestionIndex + 1}
            totalQuestions={sessionQuestions.length}
            question={currentQuestion.text}
            options={options}
            hint={currentQuestion.hint}
            accuracy={currentQuestionIndex > 0 ? accuracy : undefined}
            onAnswer={handleAnswer}
            onHintRequested={handleHintRequested}
            className="mb-6"
          />
        )}

        {/* Time spent indicator */}
        <div className="text-center text-neutral-500 text-sm">
          <p>Learning time: {formatTime()}</p>
        </div>
      </main>
    </div>
  );
}
