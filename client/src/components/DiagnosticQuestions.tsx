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

export function DiagnosticQuestions({ questions, onComplete, className = '' }: DiagnosticQuestionsProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [userAnswers, setUserAnswers] = useState<boolean[]>([]);
  
  const currentQuestion = questions[currentQuestionIndex];
  
  const handleAnswer = (optionId: number) => {
    const isCorrect = optionId === currentQuestion.correctOption;
    
    if (isCorrect) {
      setScore(score + 1);
    }
    
    const newUserAnswers = [...userAnswers];
    newUserAnswers[currentQuestionIndex] = isCorrect;
    setUserAnswers(newUserAnswers);
    
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Finished all questions
      onComplete(score + (isCorrect ? 1 : 0), questions.length);
    }
  };
  
  const handleHintRequested = () => {
    // Analytics for hint usage could be added here
  };
  
  if (!currentQuestion) {
    return null;
  }
  
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
    </div>
  );
}
