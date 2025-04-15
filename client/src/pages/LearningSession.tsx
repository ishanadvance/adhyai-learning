import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Loader2, ArrowLeft } from 'lucide-react';
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
  const [isCorrectAnswer, setIsCorrectAnswer] = useState<boolean | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showHint, setShowHint] = useState(false);

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
  } = useEmotionDetection(10000);

  const { data: topic, isLoading: isTopicLoading } = useQuery({
    queryKey: [`/api/topics/${topicId}`],
    queryFn: async () => {
      const response = await fetch(`/api/topics/${topicId}`);
      if (!response.ok) throw new Error('Failed to fetch topic');
      return response.json();
    },
    enabled: !!topicId && !!user
  });

  const { data: allQuestions, isLoading: isQuestionsLoading } = useQuery({
    queryKey: [`/api/topics/${topicId}/questions`],
    queryFn: async () => {
      const response = await fetch(`/api/topics/${topicId}/questions`);
      if (!response.ok) throw new Error('Failed to fetch questions');
      return response.json();
    },
    enabled: !!topicId && !!user
  });

  const { data: userProgress, isLoading: isProgressLoading } = useQuery({
    queryKey: [`/api/users/${user?.id}/progress`],
    queryFn: async () => {
      const response = await fetch(`/api/users/${user?.id}/progress`);
      const all = await response.json();
      return all.find((p: any) => p.topicId === parseInt(topicId));
    },
    enabled: !!user && !!topicId
  });

  const createSessionMutation = useMutation({
    mutationFn: async (data: { topicId: number }) => {
      if (!user) throw new Error('User not logged in');
      return apiRequest('POST', `/api/users/${user.id}/sessions`, data)
        .then(res => res.json());
    },
    onSuccess: (data) => {
      setSessionId(data.id);
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user?.id}/sessions`] });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to start session',
        variant: 'destructive'
      });
    }
  });

  const updateSessionMutation = useMutation({
    mutationFn: (data: any) =>
      apiRequest('PATCH', `/api/sessions/${sessionId}`, data).then(res => res.json())
  });

  const updateProgressMutation = useMutation({
    mutationFn: (data: any) =>
      apiRequest('PATCH', `/api/users/${user?.id}/progress/${topicId}`, data).then(res => res.json())
  });

  const createBadgeMutation = useMutation({
    mutationFn: (data: { badgeName: string, badgeDescription: string }) =>
      apiRequest('POST', `/api/users/${user?.id}/badges`, data).then(res => res.json())
  });

  const createSummaryMutation = useMutation({
    mutationFn: (data: { sessionId: number, content: string }) =>
      apiRequest('POST', `/api/users/${user?.id}/summaries`, data).then(res => res.json())
  });

  useEffect(() => {
    if (user && topicId && !sessionId) {
      createSessionMutation.mutate({ topicId: parseInt(topicId) });
      startTimer();
    }
    return () => pauseTimer();
  }, [user, topicId]);

  useEffect(() => {
    if (allQuestions?.length) {
      const filtered = allQuestions.filter((q: any) => q.difficulty === difficulty);
      const mixed = filtered.length < 5
        ? [...filtered, ...allQuestions.filter((q: any) => q.difficulty !== difficulty)].slice(0, 5)
        : filtered.slice(0, 5);
      setSessionQuestions(mixed);
    }
  }, [allQuestions, difficulty]);

  const completeSession = () => {
    if (!user || !sessionId || !topic) return;

    const accuracy = Math.round((correctAnswers / sessionQuestions.length) * 100);
    const masteryPercentage = userProgress?.masteryPercentage ?? 0;
    const newMasteryPercentage = Math.min(100, masteryPercentage + Math.round(accuracy / 5));
    const xpEarned = Math.round((correctAnswers * 5) + (accuracy >= 80 ? 10 : 0));

    updateSessionMutation.mutate({
      endTime: new Date().toISOString(),
      questionsAttempted: sessionQuestions.length,
      questionsCorrect: correctAnswers,
      xpEarned,
      summary: `Completed ${sessionQuestions.length} questions with ${accuracy}% accuracy.`
    });

    if (userProgress) {
      updateProgressMutation.mutate({
        masteryPercentage: newMasteryPercentage,
        questionsAttempted: userProgress.questionsAttempted + sessionQuestions.length,
        questionsCorrect: userProgress.questionsCorrect + correctAnswers
      });
    }

    if (accuracy >= 70 && (!userProgress || userProgress.masteryPercentage < 50)) {
      createBadgeMutation.mutate({
        badgeName: `${topic.name} Explorer`,
        badgeDescription: `Completed ${topic.name} with at least 70% accuracy`
      });
    }

    createSummaryMutation.mutate({
      sessionId,
      content: `${user.name} completed today's goal. Topic: ${topic.name}. Accuracy: ${accuracy}%. Streak: ${user.streak} day${user.streak !== 1 ? 's' : ''}.`
    });

    setLocation(`/completion/${sessionId}`);
  };

  const handleAnswer = (optionId: number) => {
    registerInteraction();
    const current = sessionQuestions[currentQuestionIndex];
    const correct = optionId === current.correctOption;

    setIsCorrectAnswer(correct);
    setShowFeedback(true);

    if (correct) {
      setCorrectAnswers(prev => prev + 1);
      if (correctAnswers % 2 === 1) setDifficulty(d => Math.min(3, d + 1));
    } else {
      if ((sessionQuestions.length - correctAnswers) % 2 === 1) setDifficulty(d => Math.max(1, d - 1));
    }

    setTimeout(() => {
      setShowHint(false);
      setShowFeedback(false);
      setIsCorrectAnswer(null);

      if (currentQuestionIndex < sessionQuestions.length - 1) {
        setCurrentQuestionIndex(i => i + 1);
      } else {
        completeSession();
      }
    }, 1200);
  };

  const handleHintRequested = () => {
    registerInteraction();
    setShowHint(true);
  };

  const handleContinueSession = () => {
    resetDetection();
  };

  const handleSimplifyQuestion = () => {
    setDifficulty(d => Math.max(1, d - 1));
    resetDetection();
  };

  const isLoading = isTopicLoading || isQuestionsLoading || isProgressLoading;
  const currentQuestion = sessionQuestions[currentQuestionIndex];
  const masteryPercentage = userProgress?.masteryPercentage ?? 0;
  const accuracy =
    currentQuestionIndex > 0
      ? Math.round((correctAnswers / currentQuestionIndex) * 100)
      : 0;
  const options = currentQuestion?.options.map((text: string, id: number) => ({ text, id })) ?? [];

  if (!user) {
    setLocation('/');
    return null;
  }

  if (isLoading || sessionQuestions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-white bg-black">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading your learning session...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-gray-900 text-white shadow-sm p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <button onClick={() => setLocation('/dashboard')} className="text-white p-1">
              <ArrowLeft className="h-6 w-6" />
            </button>
            <h1 className="font-heading font-bold text-lg">{topic?.name || "Topic"}</h1>
          </div>
          <div className="flex items-center">
            <div className="flex items-center bg-neutral-800 rounded-full px-3 py-1 mr-2">
              <XPIcon className="h-4 w-4 text-amber-400 mr-1" />
              <span className="font-medium text-sm">{user.xpPoints ?? 0} XP</span>
            </div>
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold">
              {user.name.charAt(0)}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-auto p-4 bg-gray-950 text-white">
        <ProgressBar
          progress={isNaN(masteryPercentage) ? 0 : masteryPercentage}
          level={difficulty}
          className="mb-6"
        />

        {emotionState === 'detected' ? (
          <EmotionCheckpoint
            onContinue={handleContinueSession}
            onSimplify={handleSimplifyQuestion}
            className="mb-6"
          />
        ) : (
          <>
            <LearningQuestion
              questionNumber={currentQuestionIndex + 1}
              totalQuestions={sessionQuestions.length}
              question={currentQuestion.text}
              options={options}
              hint={showHint ? currentQuestion.hint : undefined}
              accuracy={currentQuestionIndex > 0 ? accuracy : undefined}
              onAnswer={handleAnswer}
              onHintRequested={handleHintRequested}
              className="mb-4"
            />

            {showFeedback && (
              <div
                className={`text-sm text-center font-semibold mt-2 ${
                  isCorrectAnswer ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {isCorrectAnswer
                  ? '✅ Correct! Great job.'
                  : `❌ Incorrect. Correct answer: ${currentQuestion.options[currentQuestion.correctOption]}`}
              </div>
            )}
          </>
        )}

        <div className="text-center text-sm text-neutral-400 mt-6">
          <p>Learning time: {formatTime()}</p>
        </div>
      </main>
    </div>
  );
}
