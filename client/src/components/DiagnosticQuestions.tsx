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
  className = '',
}: DiagnosticQuestionsProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [userAnswers, setUserAnswers] = useState<boolean[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [wasCorrect, setWasCorrect] = useState<boolean | null>(null);
  const [showHint, setShowHint] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  if (!currentQuestion) return null;

  const handleAnswer = (optionId: number) => {
    const isCorrect = optionId === currentQuestion.correctOption;

    if (isCorrect) setScore((prev) => prev + 1);

    const updatedAnswers = [...userAnswers];
    updatedAnswers[currentQuestionIndex] = isCorrect;
    setUserAnswers(updatedAnswers);

    setWasCorrect(isCorrect);
    setShowFeedback(true);
    setShowHint(false);

    setTimeout(() => {
      setShowFeedback(false);
      setWasCorrect(null);

      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1);
      } else {
        onComplete(score + (isCorrect ? 1 : 0), questions.length);
      }
    }, 1200);
  };

  const handleHintRequested = () => {
    setShowHint(true);
  };

  const options = currentQuestion.options.map((text, id) => ({
    text: id === currentQuestion.correctOption ? `${text} [correct]` : text,
    id,
  }));

  return (
    <div className={className}>
      <LearningQuestion
        questionNumber={currentQuestionIndex + 1}
        totalQuestions={questions.length}
        question={currentQuestion.text}
        options={options}
        hint={showHint ? currentQuestion.hint : undefined}
        onAnswer={handleAnswer}
        onHintRequested={handleHintRequested}
      />

      {showFeedback && (
        <div
          className={`text-sm text-center font-semibold mt-3 ${
            wasCorrect ? 'text-green-400' : 'text-red-400'
          }`}
        >
          {wasCorrect
            ? '✅ Correct!'
            : `❌ Incorrect. Correct answer: ${
                currentQuestion.options[currentQuestion.correctOption]
              }`}
        </div>
      )}
    </div>
  );
}
