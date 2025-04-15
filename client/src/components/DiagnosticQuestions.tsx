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
  const [userAnswers, setUserAnswers] = useState<boolean[]>([]);
  const [showNextButton, setShowNextButton] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswer = (optionId: number) => {
    const isCorrect = optionId === currentQuestion.correctOption;
    if (isCorrect) setScore(prev => prev + 1);

    const updatedAnswers = [...userAnswers];
    updatedAnswers[currentQuestionIndex] = isCorrect;
    setUserAnswers(updatedAnswers);

    setShowNextButton(true);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setShowNextButton(false);
    } else {
      onComplete(score, questions.length);
    }
  };

  const handleHintRequested = () => {
    // Optional analytics
  };

  if (!currentQuestion) return null;

  const options = currentQuestion.options.map((text, id) => ({ text, id }));

  return (
    <div className={className}>
      <LearningQuestion
        questionNumber={currentQuestionIndex + 1}
        totalQuestions={questions.length}
        question={currentQuestion.text}
        options={options}
        hint={currentQuestion.hint}
        onAnswer={handleAnswer}
        onHintRequested={handleHintRequested}
      />

      {showNextButton && (
        <div className="mt-4 text-center">
          <button
            onClick={handleNext}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
          >
            {currentQuestionIndex === questions.length - 1 ? 'Finish' : 'Next Question'}
          </button>
        </div>
      )}
    </div>
  );
}
