"use client";
import { useAuth } from "@clerk/nextjs";
import { ApiError } from "next/dist/server/api-utils";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface Question {
  id: number;
  question: string;
  type: number; // 1 = single, 2 = multi
  choices?: QuestionChoices[];
}

interface QuestionChoices {
  choiceId: number;
  choice: string;
  isCorrect: boolean; // Used internally, not displayed
  questionId: number;
}

interface ApiResponseQuestions {
  questions: Question[];
  questionChoices: QuestionChoices[];
}

interface SelectedAnswer {
  choice: string;
  choiceId: number;
}
interface ApiTestSubmitRespone {
  message: string;
  score: number;
}

export default function TestPage() {
  const params = useParams();
  const id = Number(params.id);
  const { userId } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<number, SelectedAnswer | SelectedAnswer[]>
  >({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const fetchQuestions = async () => {
      const response = await fetch("/api/tests/testQuestions?id=" + id);
      const data = (await response.json()) as ApiResponseQuestions;

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
    choiceId: number,
    type: number,
  ) => {
    setSelectedAnswers((prev) => {
      if (type === 1) {
        // Single choice
        return {
          ...prev,
          [questionId]: { choice, choiceId },
        };
      } else {
        // Multi choice
        const prevAnswers = (prev[questionId] as SelectedAnswer[]) || [];
        const existingIndex = prevAnswers.findIndex(
          (answer) => answer.choiceId === choiceId,
        );

        if (existingIndex > -1) {
          // Remove existing answer
          const newAnswers = [...prevAnswers];
          newAnswers.splice(existingIndex, 1); // remove 1 element at existingIndex
          return {
            ...prev,
            [questionId]: newAnswers,
          };
        } else {
          // Add new answer
          return {
            ...prev,
            [questionId]: [...prevAnswers, { choice, choiceId }],
          };
        }
      }
    });
  };

  const handleSubmit = async () => {
    setSubmitted(true);
    console.log("Submitted answers:", selectedAnswers);

    try {
      const currentUserId = userId;
      if (!currentUserId) {
        toast.error("Klaida: Trūksta vartotojo ID");
        return;
      }

      const answersArray = Object.entries(selectedAnswers)
        .map(([questionId, answer]) => {
          if (Array.isArray(answer)) {
            return answer.map((a) => ({
              questionId: parseInt(questionId),
              choiceId: a.choiceId,
              answer: a.choice,
            }));
          } else {
            return {
              questionId: parseInt(questionId),
              choiceId: answer.choiceId,
              answer: answer.choice,
            };
          }
        })
        .flat();

      const response = await fetch("/api/tests/testQuestions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          testId: id,
          answers: answersArray,
          userId: currentUserId,
        }),
      });
      const data = (await response.json()) as ApiTestSubmitRespone;
      if (!response.ok) {
        console.error("Failed to submit test:", response.statusText);
        try {
          console.error("Error message from API:", data.message);
          toast.error(data.message);
        } catch (jsonError) {
          console.error("Error parsing JSON error response:", jsonError);
          toast.error("Nepavyko pateikti testo atsakymų. Bandykite dar kartą.");
        }
        return;
      } else {
        toast.success("Testas sėkmingai pateiktas!");
        setScore(data.score);
      }
    } catch (error) {
      console.error("Error submitting test:", error);
      toast.error("Serverio klaida apdorojant užklausą!");
    }
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
                  {index + 1} Klausimas
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
            className="w-full rounded-md bg-blue-500 px-4 py-2 font-medium text-white transition-colors duration-200 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
          >
            Baigti testą
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
              <h3 className="text-gray-600">Result: {score.toFixed(2)}/100</h3>
            </div>
          ) : (
            <>
              {currentQuestion && (
                <div>
                  <p className="mb-4 text-gray-600">
                    {currentQuestionIndex + 1} klausimas iš {questions.length}
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
                                choice.choiceId,
                                1,
                              )
                            }
                            className={`w-full rounded-md px-4 py-2 text-left ${
                              (
                                selectedAnswers[
                                  currentQuestion.id
                                ] as SelectedAnswer
                              )?.choice === choice.choice
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
                                choice.choiceId,
                                2,
                              )
                            }
                            className={`flex w-full items-center rounded-md px-4 py-2 ${
                              (
                                (selectedAnswers[
                                  currentQuestion.id
                                ] as SelectedAnswer[]) || []
                              ).some(
                                (answer) => answer.choiceId === choice.choiceId,
                              )
                                ? "bg-blue-500 text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={(
                                (selectedAnswers[
                                  currentQuestion.id
                                ] as SelectedAnswer[]) || []
                              ).some(
                                (answer) => answer.choiceId === choice.choiceId,
                              )}
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
