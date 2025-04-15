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

  // Assumes correct answer is tagged in option text like: "option text [correct]"
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
    setShowHint(true);
    onHintRequested();
  };

  const [showHint, setShowHint] = useState(false);

  return (
    <div className={`bg-white p-6 rounded-lg shadow ${className}`}>
      <div className="mb-4">
        <p className="text-sm text-gray-500">
          Question {questionNumber} of {totalQuestions}
        </p>
        <h2 className="text-lg font-semibold mb-2">{question}</h2>
      </div>

      <div className="space-y-3">
        {cleanedOptions.map((option) => (
          <button
            key={option.id}
            onClick={() => handleOptionClick(option.id)}
            disabled={answerSubmitted}
            className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${
              selectedOption === option.id
                ? answerSubmitted
                  ? option.id === correctOption?.id
                    ? 'bg-green-100 border-green-500 text-green-800'
                    : 'bg-red-100 border-red-500 text-red-800'
                  : 'bg-blue-100 border-blue-500'
                : 'bg-white border-gray-300 hover:bg-gray-50'
            }`}
          >
            {option.text}
          </button>
        ))}
      </div>

      <div className="mt-4 flex justify-between items-center">
        <button
          onClick={handleHintClick}
          className="text-sm text-blue-500 hover:underline"
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

      {answerSubmitted && (
        <div className="mt-4">
          <p className={`font-medium ${wasCorrect ? 'text-green-600' : 'text-red-600'}`}>
            {wasCorrect ? 'Correct!' : 'Oops, that was incorrect.'}
          </p>
          {hint && (
            <p className="text-sm text-gray-600 mt-2">
              Explanation: {hint}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
