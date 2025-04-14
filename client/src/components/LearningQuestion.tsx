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
  const [showHint, setShowHint] = useState(false);
  
  const handleOptionClick = (optionId: number) => {
    setSelectedOption(optionId);
  };
  
  const handleSubmit = () => {
    if (selectedOption !== null) {
      onAnswer(selectedOption);
      setSelectedOption(null); // Reset for next question
    }
  };
  
  const handleHintClick = () => {
    setShowHint(true);
    onHintRequested();
  };
  
  return (
    <div className={`question-card bg-white rounded-xl shadow-md p-5 ${className}`}>
      <div className="flex justify-between mb-4">
        <span className="inline-block bg-accent text-neutral-800 font-medium px-3 py-1 rounded-full text-sm">
          Question {questionNumber}/{totalQuestions}
        </span>
        {accuracy !== undefined && (
          <span className="inline-block bg-success bg-opacity-10 text-success font-medium px-3 py-1 rounded-full text-sm">
            {accuracy}% Accuracy
          </span>
        )}
      </div>

      <h2 className="text-lg font-medium mb-4">{question}</h2>

      <div className="grid grid-cols-2 gap-3 mb-6">
        {options.map((option) => (
          <button
            key={option.id}
            className={`p-4 rounded-lg border-2 ${
              selectedOption === option.id 
                ? 'border-primary text-primary' 
                : 'border-neutral-300 hover:border-primary'
            } text-center font-medium`}
            onClick={() => handleOptionClick(option.id)}
          >
            {option.text}
          </button>
        ))}
      </div>

      {showHint && hint && (
        <div className="bg-warning bg-opacity-10 p-4 rounded-lg mb-4">
          <p className="text-neutral-700"><strong>Hint:</strong> {hint}</p>
        </div>
      )}

      {hint && !showHint ? (
        <button 
          onClick={handleHintClick} 
          className="w-full border border-primary text-primary hover:bg-primary-light hover:text-white font-medium py-2 px-4 rounded-lg transition duration-200 mb-4"
        >
          Need a Hint?
        </button>
      ) : null}

      <button 
        onClick={handleSubmit}
        disabled={selectedOption === null}
        className={`w-full ${
          selectedOption === null 
            ? 'bg-neutral-300 cursor-not-allowed' 
            : 'bg-primary hover:bg-primary-dark'
        } text-white font-bold py-3 px-4 rounded-lg transition duration-200`}
      >
        Submit Answer
      </button>
    </div>
  );
}
