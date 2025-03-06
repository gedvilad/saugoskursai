"use client";

import React, { useState } from "react";

// Define types for different question types
type QuestionType = "multipleChoice" | "multipleSelect" | "trueFalse";

// Define a type for a question
interface Question {
  id: number;
  text: string;
  type: QuestionType;
  options: string[];
  correctAnswers: string[]; // Array to support multiple correct answers
}

// Sample test data (replace with your actual data)
/*const testData: Question[] = [
  {
    id: 1,
    text: "What is the capital of France?",
    type: "multipleChoice",
    options: ["Berlin", "Madrid", "Paris", "Rome"],
    correctAnswers: ["Paris"],
  },
  {
    id: 2,
    text: "What is 2 + 2?",
    type: "multipleChoice",
    options: ["3", "4", "5", "6"],
    correctAnswers: ["4"],
  },
  {
    id: 3,
    text: "Which of the following are prime numbers?",
    type: "multipleSelect",
    options: ["2", "3", "4", "5", "6", "7"],
    correctAnswers: ["2", "3", "5", "7"],
  },
  {
    id: 4,
    text: "The Earth is flat. True or False?",
    type: "trueFalse",
    options: ["True", "False"],
    correctAnswers: ["False"],
  },
  {
    id: 5,
    text: "Select the programming languages from the list",
    type: "multipleSelect",
    options: ["HTML", "CSS", "JavaScript", "React", "Node.js", "English"],
    correctAnswers: ["JavaScript", "React", "Node.js"],
  },
];

const TestPage = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string[]>>({}); // Store answers as arrays
  const [showResults, setShowResults] = useState(false);

  const currentQuestion = testData[currentQuestionIndex];

  const handleAnswerSelect = (answer: string) => {
    setAnswers((prevAnswers) => {
      const questionId = currentQuestion.id;
      if (
        currentQuestion.type === "multipleChoice" ||
        currentQuestion.type === "trueFalse"
      ) {
        // For single-choice questions, replace the existing answer
        return { ...prevAnswers, [questionId]: [answer] };
      } else {
        // For multiple-select questions, add or remove the answer from the array
        const existingAnswers = prevAnswers[questionId] || [];
        if (existingAnswers.includes(answer)) {
          return {
            ...prevAnswers,
            [questionId]: existingAnswers.filter((a) => a !== answer),
          };
        } else {
          return { ...prevAnswers, [questionId]: [...existingAnswers, answer] };
        }
      }
    });
  };

  const handleQuestionSelect = (index: number) => {
    setCurrentQuestionIndex(index);
  };

  const handleSubmit = () => {
    setShowResults(true);
  };

  const calculateScore = () => {
    let score = 0;
    testData.forEach((question) => {
      const questionId = question.id;
      const userAnswers = answers[questionId] || [];
      const correctAnswers = question.correctAnswers;

      if (
        userAnswers.length === correctAnswers.length &&
        userAnswers.every((answer) => correctAnswers.includes(answer))
      ) {
        score++;
      }
    });
    return score;
  };

  const isAnswered = (questionId: number): boolean => {
    return answers.hasOwnProperty(questionId);
  };

  const isCorrect = (questionId: number): boolean => {
    const question = testData.find((q) => q.id === questionId);
    if (!question) return false;

    const userAnswers = answers[questionId] || [];
    const correctAnswers = question.correctAnswers;

    return (
      userAnswers.length === correctAnswers.length &&
      userAnswers.every((answer) => correctAnswers.includes(answer))
    );
  };

  const renderQuestionContent = () => {
    if (!currentQuestion) return null;

    switch (currentQuestion.type) {
      case "multipleChoice":
        return (
          <div className="space-y-3">
            {currentQuestion.options.map((option) => (
              <label
                key={option}
                className="flex cursor-pointer items-center rounded-md border border-gray-300 px-4 py-2 transition-colors duration-200 hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
              >
                <input
                  type="radio"
                  name={`question-${currentQuestion.id}`}
                  value={option}
                  checked={!!answers[currentQuestion.id]?.includes(option)} // Ensure boolean
                  onChange={() => handleAnswerSelect(option)}
                  className="mr-3 h-5 w-5 text-blue-600 accent-blue-500 focus:ring-blue-500"
                />
                <span className="text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        );
      case "multipleSelect":
        return (
          <div className="space-y-3">
            {currentQuestion.options.map((option) => (
              <label
                key={option}
                className="flex cursor-pointer items-center rounded-md border border-gray-300 px-4 py-2 transition-colors duration-200 hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
              >
                <input
                  type="checkbox"
                  name={`question-${currentQuestion.id}`}
                  value={option}
                  checked={!!answers[currentQuestion.id]?.includes(option)} // Ensure boolean
                  onChange={() => handleAnswerSelect(option)}
                  className="mr-3 h-5 w-5 text-blue-600 accent-blue-500 focus:ring-blue-500"
                />
                <span className="text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        );
      case "trueFalse":
        return (
          <div className="space-y-3">
            {currentQuestion.options.map((option) => (
              <label
                key={option}
                className="flex cursor-pointer items-center rounded-md border border-gray-300 px-4 py-2 transition-colors duration-200 hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
              >
                <input
                  type="radio"
                  name={`question-${currentQuestion.id}`}
                  value={option}
                  checked={!!answers[currentQuestion.id]?.includes(option)} // Ensure boolean
                  onChange={() => handleAnswerSelect(option)}
                  className="mr-3 h-5 w-5 text-blue-600 accent-blue-500 focus:ring-blue-500"
                />
                <span className="text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        );
      default:
        return <p>Unsupported question type</p>;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">

      <aside className="w-64 border-r border-gray-200 bg-white px-3 py-6">
        <div className="mb-8 text-lg font-semibold text-gray-700">
          Test Navigation
        </div>
        <nav>
          <ul>
            {testData.map((question, index) => (
              <li key={question.id} className="mb-2">
                <button
                  onClick={() => handleQuestionSelect(index)}
                  className={`flex w-full items-center justify-between rounded-md px-4 py-2 text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 ${
                    currentQuestionIndex === index
                      ? "bg-blue-500 text-white hover:bg-blue-600"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Question {index + 1}
                  {isAnswered(question.id) ? (
                    isCorrect(question.id) ? (
                      <span className="text-green-500">✓</span> // Checkmark
                    ) : (
                      <span className="text-red-500">✗</span> // X mark
                    )
                  ) : null}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <div className="mt-8">
          <button
            onClick={handleSubmit}
            className="w-full rounded-md bg-green-500 px-4 py-2 font-medium text-white transition-colors duration-200 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1"
          >
            Submit Test
          </button>
        </div>
      </aside>


      <main className="flex-1 p-8">
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h1 className="mb-4 text-2xl font-semibold text-gray-800">Test</h1>

          {!showResults ? (
            <>
              {currentQuestion && (
                <div>
                  <p className="mb-4 text-gray-600">
                    Question {currentQuestionIndex + 1} of {testData.length}
                  </p>
                  <div className="mb-6">
                    <p className="text-lg text-gray-800">
                      {currentQuestion.text}
                    </p>
                  </div>
                  {renderQuestionContent()}
                </div>
              )}
            </>
          ) : (
            <div className="mt-8">
              <h2 className="mb-4 text-xl font-semibold text-gray-800">
                Results
              </h2>
              <p className="text-gray-600">
                You scored {calculateScore()} out of {testData.length}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default TestPage;*/
const TestPage = () => {
  return (
    <div>
      <h1>Test</h1>
    </div>
  );
};
export default TestPage;
