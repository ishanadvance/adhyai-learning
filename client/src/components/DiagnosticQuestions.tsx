import React, { useState } from 'react';
import { LearningQuestion } from './LearningQuestion';

interface QuestionData {
  id: number;
  text: string;
  options: string[];
  correctOption: number;
  hint?: string;
}

interface DiagnosticQuestionsProps {
  questions: QuestionData[];
  onComplete: (score: number, totalQuestions: number) => void;
  className?: string;
}

export function DiagnosticQuestions({
  questions,
  onComplete,
  className = ''
}: DiagnosticQuestionsProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showNext, setShowNext] = useState(false);
  const [hintRequested, setHintRequested] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null);

  const currentQuestion = questions[currentQuestionIndex];
  const options = currentQuestion.options.map((text, id) => ({ text, id }));

  const handleAnswer = (optionId: number) => {
    const isCorrect = optionId === currentQuestion.correctOption;

    if (isCorrect) setScore(score + 1);
    setLastCorrect(isCorrect);
    setAnswered(true);
    setShowNext(true);
  };

  const handleHintRequested = () => {
    setHintRequested(true);
  };

  const handleNext = () => {
    setHintRequested(false);
    setAnswered(false);
    setLastCorrect(null);
    setShowNext(false);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(i => i + 1);
    } else {
      onComplete(score, questions.length);
    }
  };

  if (!currentQuestion) return null;

  return (
    <div className={`bg-white dark:bg-gray-900 p-6 rounded-lg shadow ${className}`}>
      <div className="mb-4">
        <h1 className="text-xl font-bold mb-1 text-gray-900 dark:text-white">Let's check your knowledge</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Quick {questions.length}-question diagnostic on <strong>Fractions</strong>
        </p>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          This helps us personalize your learning path!
        </p>
      </div>

      <LearningQuestion
        questionNumber={currentQuestionIndex + 1}
        totalQuestions={questions.length}
        question={currentQuestion.text}
        options={options}
        hint={hintRequested ? currentQuestion.hint : undefined}
        onAnswer={handleAnswer}
        onHintRequested={handleHintRequested}
        className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
      />

      {answered && (
        <div className={`mt-4 text-center font-semibold ${lastCorrect ? 'text-green-500' : 'text-red-500'}`}>
          {lastCorrect ? '✅ Correct!' : `❌ Incorrect. Correct answer: ${currentQuestion.options[currentQuestion.correctOption]}`}
        </div>
      )}

      {showNext && (
        <div className="mt-6 text-center">
          <button
            onClick={handleNext}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-lg transition"
          >
            {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Diagnostic'}
          </button>
        </div>
      )}
    </div>
  );
}
