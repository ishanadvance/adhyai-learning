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
    <div className={`question-card bg-gray-800 border border-gray-700 rounded-xl shadow-md p-5 ${className}`}>
      <div className="flex justify-between mb-4">
        <span className="inline-block bg-blue-600 text-white font-medium px-3 py-1 rounded-full text-sm">
          Question {questionNumber}/{totalQuestions}
        </span>
        {accuracy !== undefined && (
          <span className="inline-block bg-green-600 text-white font-medium px-3 py-1 rounded-full text-sm">
            {accuracy}% Accuracy
          </span>
        )}
      </div>

      <h2 className="text-lg font-medium mb-4 text-white">{question}</h2>

      <div className="grid grid-cols-2 gap-3 mb-6">
        {options.map((option) => (
          <button
            key={option.id}
            className={`p-4 rounded-lg border-2 ${
              selectedOption === option.id 
                ? 'border-blue-400 bg-blue-900 text-white' 
                : 'border-gray-600 bg-gray-700 text-white hover:border-blue-400 hover:bg-gray-600'
            } text-center font-medium`}
            onClick={() => handleOptionClick(option.id)}
          >
            {option.text}
          </button>
        ))}
      </div>

      {showHint && hint && (
        <div className="bg-yellow-900 border border-yellow-700 p-4 rounded-lg mb-4">
          <p className="text-yellow-100"><strong>Hint:</strong> {hint}</p>
        </div>
      )}

      {hint && !showHint ? (
        <button 
          onClick={handleHintClick} 
          className="w-full border border-yellow-500 bg-gray-700 text-yellow-300 hover:bg-gray-600 font-medium py-2 px-4 rounded-lg transition duration-200 mb-4"
        >
          Need a Hint?
        </button>
      ) : null}

      <button 
        onClick={handleSubmit}
        disabled={selectedOption === null}
        className={`w-full ${
          selectedOption === null 
            ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
            : 'bg-blue-600 hover:bg-blue-700'
        } text-white font-bold py-3 px-4 rounded-lg transition duration-200`}
      >
        Submit Answer
      </button>
    </div>
  );
}
