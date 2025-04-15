import React, { useState } from 'react';

interface QuestionOption {
  text: string;
  id: number;
}

interface LearningQuestionProps {
  questionNumber: number;
  totalQuestions: number;
  question: string;
  options: QuestionOption[];
  hint?: string;
  accuracy?: number;
  onAnswer: (optionId: number) => void;
  onHintRequested: () => void;
  className?: string;
}

export function LearningQuestion({
  questionNumber,
  totalQuestions,
  question,
  options,
  hint,
  accuracy,
  onAnswer,
  onHintRequested,
  className = ''
}: LearningQuestionProps) {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answerSubmitted, setAnswerSubmitted] = useState(false);
  const [wasCorrect, setWasCorrect] = useState<boolean | null>(null);
  const [showHint, setShowHint] = useState(false);

  const correctOption = options.find((o) => o.text.includes('[correct]'));
  const cleanedOptions = options.map(opt => ({
    ...opt,
    text: opt.text.replace(' [correct]', '')
  }));

  const handleOptionClick = (optionId: number) => {
    if (!answerSubmitted) {
      setSelectedOption(optionId);
    }
  };

  const handleSubmit = () => {
    if (selectedOption !== null && correctOption) {
      const isCorrect = selectedOption === correctOption.id;
      setWasCorrect(isCorrect);
      setAnswerSubmitted(true);
      onAnswer(selectedOption);
    }
  };

  const handleHintClick = () => {
    setShowHint(!showHint); // Toggle hint
    onHintRequested();
  };

  return (
    <div className={`bg-gray-800 p-6 rounded-lg shadow text-white ${className}`}>
      <div className="mb-4">
        <p className="text-sm text-gray-300">
          Question {questionNumber} of {totalQuestions}
        </p>
        <h2 className="text-lg font-semibold mb-2">{question}</h2>
      </div>

      <div className="space-y-3">
        {cleanedOptions.map((option) => {
          const isSelected = selectedOption === option.id;
          const isCorrect = option.id === correctOption?.id;

          let baseStyle = 'w-full text-left px-4 py-3 rounded-lg border transition-all';

          if (answerSubmitted) {
            if (isSelected && isCorrect) {
              baseStyle += ' bg-green-700 border-green-500 text-white';
            } else if (isSelected && !isCorrect) {
              baseStyle += ' bg-red-700 border-red-500 text-white';
            } else if (isCorrect) {
              baseStyle += ' bg-green-900 border-green-400 text-white';
            } else {
              baseStyle += ' bg-gray-700 border-gray-600 text-white';
            }
          } else {
            baseStyle += isSelected
              ? ' bg-blue-700 border-blue-500 text-white'
              : ' bg-gray-700 border-gray-600 hover:bg-gray-600 text-white';
          }

          return (
            <button
              key={option.id}
              onClick={() => handleOptionClick(option.id)}
              disabled={answerSubmitted}
              className={baseStyle}
            >
              {option.text}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex justify-between items-center">
        <button
          onClick={handleHintClick}
          className="text-sm text-blue-400 hover:underline"
        >
          Need a hint?
        </button>
        <button
          onClick={handleSubmit}
          disabled={selectedOption === null || answerSubmitted}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
        >
          Submit
        </button>
      </div>

      {showHint && hint && (
        <div className="mt-3 p-3 bg-gray-700 rounded-md text-sm text-gray-200">
          Hint: {hint}
        </div>
      )}

      {answerSubmitted && (
        <div className="mt-4">
          <p className={`font-medium ${wasCorrect ? 'text-green-400' : 'text-red-400'}`}>
            {wasCorrect ? '✅ Correct!' : '❌ Oops, that was incorrect.'}
          </p>
        </div>
      )}
    </div>
  );
}
