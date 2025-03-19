"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

interface Question {
  id: number;
  question: string;
  type: number; // 1 = single, 2 = multi
  choices?: QuestionChoices[];
}

interface QuestionChoices {
  choice: string;
  isCorrect: boolean; // Used internally, not displayed
  questionId: number;
}

interface ApiResponseQuestions {
  questions: Question[];
  questionChoices: QuestionChoices[];
}

export default function TestPage() {
  const params = useParams();
  const id = Number(params.id);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<number, string | string[]>
  >({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const fetchQuestions = async () => {
      const response = await fetch("/api/tests/testQuestions?id=" + id);
      const data = (await response.json()) as ApiResponseQuestions;
      console.log(data);

      // Map choices to corresponding questions
      const mappedQuestions = data.questions.map((question) => ({
        ...question,
        choices: data.questionChoices.filter(
          (choice) => choice.questionId === question.id,
        ),
      }));

      setQuestions(mappedQuestions);
    };

    fetchQuestions().catch((error) =>
      console.error("Error fetching questions:", error),
    );
  }, [id]);

  const handleQuestionSelect = (index: number) => {
    setCurrentQuestionIndex(index);
  };

  const handleAnswerSelect = (
    questionId: number,
    choice: string,
    type: number,
  ) => {
    setSelectedAnswers((prev) => {
      if (type === 1) {
        return { ...prev, [questionId]: choice || "" }; // Ensure it's always a string
      } else {
        const prevAnswers = Array.isArray(prev[questionId])
          ? prev[questionId]
          : []; // Ensure it's an array
        return {
          ...prev,
          [questionId]: prevAnswers.includes(choice)
            ? prevAnswers.filter((c) => c !== choice) // Remove choice if already selected
            : [...prevAnswers, choice], // Add choice if not selected
        };
      }
    });
  };

  const handleSubmit = () => {
    setSubmitted(true);
    console.log("Submitted answers:", selectedAnswers);
  };

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-gray-200 bg-white px-3 py-6">
        <div className="mb-8 text-lg font-semibold text-gray-700">
          Test Navigation
        </div>
        <nav>
          <ul>
            {questions.map((question, index) => (
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
                  {submitted &&
                  selectedAnswers[question.id] &&
                  currentQuestionIndex === index ? (
                    <span className="text-white">✓</span>
                  ) : submitted && selectedAnswers[question.id] ? (
                    <span className="text-blue-500">✓</span>
                  ) : submitted ? (
                    <span className="text-red-500">X</span>
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

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h1 className="mb-4 text-2xl font-semibold text-gray-800">Test</h1>

          {submitted ? (
            <div className="mt-8">
              <h2 className="mb-4 text-xl font-semibold text-gray-800">
                Test Submitted!
              </h2>
              <p className="text-gray-600">
                Your responses have been recorded. Results will be available
                later.
              </p>
            </div>
          ) : (
            <>
              {currentQuestion && (
                <div>
                  <p className="mb-4 text-gray-600">
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </p>
                  <div className="mb-6">
                    <p className="text-lg text-gray-800">
                      {currentQuestion.question}
                    </p>
                  </div>

                  {/* Render Single or Multi Choice */}
                  {currentQuestion.type === 1 ? (
                    // Single Choice
                    <ul>
                      {currentQuestion.choices?.map((choice, index) => (
                        <li key={index} className="mb-2">
                          <button
                            onClick={() =>
                              handleAnswerSelect(
                                currentQuestion.id,
                                choice.choice,
                                1,
                              )
                            }
                            className={`w-full rounded-md px-4 py-2 text-left transition-colors duration-200 ${
                              selectedAnswers[currentQuestion.id] ===
                              choice.choice
                                ? "bg-blue-500 text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                          >
                            {choice.choice}
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    // Multi Choice
                    <ul>
                      {currentQuestion.choices?.map((choice, index) => (
                        <li key={index} className="mb-2">
                          <button
                            onClick={() =>
                              handleAnswerSelect(
                                currentQuestion.id,
                                choice.choice,
                                2,
                              )
                            }
                            className={`flex w-full items-center rounded-md px-4 py-2 transition-colors duration-200 ${
                              (
                                (selectedAnswers[
                                  currentQuestion.id
                                ] as string[]) || []
                              ).includes(choice.choice)
                                ? "bg-blue-500 text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={(
                                (selectedAnswers[
                                  currentQuestion.id
                                ] as string[]) || []
                              ).includes(choice.choice)}
                              readOnly
                              className="mr-2"
                            />
                            {choice.choice}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
