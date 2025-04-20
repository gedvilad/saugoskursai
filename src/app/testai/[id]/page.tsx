"use client";
import { useAuth } from "@clerk/nextjs";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  CheckCircle,
  XCircle,
  ChevronRight,
  ChevronLeft,
  Clock,
} from "lucide-react";

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

interface ApiTestSubmitResponse {
  message: string;
  score: number;
}

export default function TestPage() {
  const params = useParams();
  const id = Number(params.id);
  const searchParams = useSearchParams();
  const assignedCourseId = Number(searchParams.get("assignedId"));
  const { userId } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<number, SelectedAnswer | SelectedAnswer[]>
  >({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/tests/testQuestions?id=${id}`);

        if (!response.ok) {
          throw new Error("Failed to fetch questions");
        }

        const data = (await response.json()) as ApiResponseQuestions;

        // Map choices to corresponding questions
        const mappedQuestions = data.questions.map((question) => ({
          ...question,
          choices: data.questionChoices.filter(
            (choice) => choice.questionId === question.id,
          ),
        }));

        setQuestions(mappedQuestions);
        // Initialize time (example: 30 minutes per test)
        setTimeRemaining(30 * 60);
      } catch (error) {
        console.error("Error fetching questions:", error);
        toast.error("Failed to load test questions");
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions().catch((error) =>
      console.error("Error fetching questions:", error),
    );
  }, [id]);

  // Timer effect
  useEffect(() => {
    const handleTimer = async () => {
      if (!submitted && timeRemaining !== null && timeRemaining > 0) {
        const timer = setInterval(() => {
          setTimeRemaining((prev) => (prev !== null ? prev - 1 : null));
        }, 1000);

        return () => clearInterval(timer);
      } else if (timeRemaining === 0 && !submitted) {
        //await handleSubmit();
      }
    };
    handleTimer().catch((error) =>
      console.error("Error handling timer:", error),
    );
  }, [timeRemaining, submitted]);

  const handleQuestionSelect = (index: number) => {
    setCurrentQuestionIndex(index);
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const handleAnswerSelect = (
    questionId: number,
    choice: string,
    choiceId: number,
    type: number,
  ) => {
    if (submitted) return;

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
          newAnswers.splice(existingIndex, 1);
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

  const navigateToPrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const navigateToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const isQuestionAnswered = (questionId: number): boolean => {
    const answer = selectedAnswers[questionId];
    if (!answer) return false;
    if (Array.isArray(answer)) return answer.length > 0;
    return true;
  };

  const getAnsweredQuestionsCount = (): number => {
    return Object.keys(selectedAnswers).length;
  };

  const handleSubmit = async () => {
    if (submitted || submitting) return;

    setSubmitting(true);

    try {
      if (!userId) {
        toast.error("Error: User ID is missing");
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
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          testId: id,
          answers: answersArray,
          userId,
          assignedCourseId,
        }),
      });

      const data = (await response.json()) as ApiTestSubmitResponse;

      if (!response.ok) {
        console.error("Failed to submit test:", response.statusText);
        toast.error(
          data.message || "Failed to submit test answers. Please try again.",
        );
        return;
      }

      //toast.success("Test successfully submitted!");
      setScore(data.score);
      setSubmitted(true);
    } catch (error) {
      console.error("Error submitting test:", error);
      toast.error("Server error processing request!");
    } finally {
      setSubmitting(false);
    }
  };

  const currentQuestion = questions[currentQuestionIndex];

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50">
        <div className="text-stone-700">Įkeliami testo klausimai...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-stone-50">
      {/* Sidebar Navigation */}
      <aside className="hidden w-64 border-r border-stone-200 bg-white px-3 py-6 md:block">
        <div className="mb-6 text-lg font-medium text-stone-800">
          Testo klausimai
        </div>

        {/* {timeRemaining !== null && !submitted && (
          <div className="mb-4 flex items-center justify-center rounded-md bg-stone-100 p-2 text-stone-700">
            <Clock size={18} className="mr-2" />
            <span className="font-medium">{formatTime(timeRemaining)}</span>
          </div>
        )} */}

        <div className="mb-4 text-sm text-stone-500">
          {getAnsweredQuestionsCount()}/{questions.length} atsakytų klausimų
        </div>

        <nav className="mb-6 max-h-96 overflow-y-auto">
          <ul className="space-y-2">
            {questions.map((question, index) => (
              <li key={question.id}>
                <button
                  onClick={() => handleQuestionSelect(index)}
                  className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-1 ${
                    currentQuestionIndex === index
                      ? "bg-stone-800 text-white"
                      : isQuestionAnswered(question.id)
                        ? "bg-stone-200 text-stone-800"
                        : "bg-white text-stone-700 hover:bg-stone-100"
                  }`}
                >
                  <span>{index + 1} Klausimas</span>
                  {isQuestionAnswered(question.id) && (
                    <CheckCircle size={16} className="text-stone-600" />
                  )}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <button
          onClick={handleSubmit}
          disabled={submitting || submitted}
          className={`w-full rounded-md px-4 py-2 font-medium text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-1 ${
            submitted || submitting
              ? "cursor-not-allowed bg-stone-400"
              : "bg-stone-800 hover:bg-stone-700"
          }`}
        >
          {submitting
            ? "Užbaigiama..."
            : submitted
              ? "Užbaigtas"
              : "Baigti testą"}
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8">
        {/* Mobile Question Navigation */}
        <div className="mb-4 flex items-center justify-between md:hidden">
          <div className="text-stone-800">
            Klausimas {currentQuestionIndex + 1}/{questions.length}
          </div>
          {timeRemaining !== null && !submitted && (
            <div className="flex items-center text-stone-700">
              <Clock size={16} className="mr-1" />
              <span>{formatTime(timeRemaining)}</span>
            </div>
          )}
        </div>

        <div className="rounded-lg bg-white p-6 shadow-sm">
          {submitted ? (
            <div className="space-y-6">
              <h2 className="text-center text-2xl font-semibold text-stone-800">
                Testo rezultatai
              </h2>

              <div className="flex flex-col items-center justify-center space-y-4 p-6">
                <div className="text-6xl font-bold text-stone-800">
                  {score ? score.toFixed(0) : "0"}
                </div>
                <div className="text-stone-500">iš 100 taškų</div>

                <div className="h-4 w-full max-w-md overflow-hidden rounded-full bg-stone-200">
                  <div
                    className="h-full bg-stone-800"
                    style={{ width: `${score}%` }}
                  ></div>
                </div>

                <div className="mt-6 text-stone-600">
                  {score >= 90 ? (
                    <div className="flex items-center text-green-600">
                      <CheckCircle className="mr-2" />
                      Jūs išlaikėte puikiai !
                    </div>
                  ) : score >= 70 ? (
                    <div className="flex items-center text-stone-600">
                      <CheckCircle className="mr-2" />
                      Testas išlaikytas !
                    </div>
                  ) : (
                    <div className="flex items-center text-red-600">
                      <XCircle className="mr-2" />
                      Reiktų pasikartoti kurso medžiagą.
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <>
              {currentQuestion && (
                <div>
                  <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-xl font-medium text-stone-800">
                      {currentQuestion.question}
                    </h2>
                    <span className="hidden rounded-full bg-stone-100 px-3 py-1 text-sm text-stone-600 md:block">
                      Klausimas {currentQuestionIndex + 1} iš {questions.length}
                    </span>
                  </div>

                  <div className="mb-8">
                    {currentQuestion.type === 1 ? (
                      // Single Choice
                      <div className="space-y-3">
                        {currentQuestion.choices?.map((choice) => (
                          <button
                            key={choice.choiceId}
                            onClick={() =>
                              handleAnswerSelect(
                                currentQuestion.id,
                                choice.choice,
                                choice.choiceId,
                                1,
                              )
                            }
                            className={`w-full rounded-md border px-4 py-3 text-left transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-1 ${
                              (
                                selectedAnswers[
                                  currentQuestion.id
                                ] as SelectedAnswer
                              )?.choiceId === choice.choiceId
                                ? "border-stone-800 bg-stone-100"
                                : "border-stone-200 hover:bg-stone-50"
                            }`}
                          >
                            {choice.choice}
                          </button>
                        ))}
                      </div>
                    ) : (
                      // Multi Choice
                      <div className="space-y-3">
                        {currentQuestion.choices?.map((choice) => {
                          const isSelected = (
                            (selectedAnswers[
                              currentQuestion.id
                            ] as SelectedAnswer[]) || []
                          ).some(
                            (answer) => answer.choiceId === choice.choiceId,
                          );

                          return (
                            <button
                              key={choice.choiceId}
                              onClick={() =>
                                handleAnswerSelect(
                                  currentQuestion.id,
                                  choice.choice,
                                  choice.choiceId,
                                  2,
                                )
                              }
                              className={`flex w-full items-center rounded-md border px-4 py-3 text-left transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-1 ${
                                isSelected
                                  ? "border-stone-800 bg-stone-100"
                                  : "border-stone-200 hover:bg-stone-50"
                              }`}
                            >
                              <div
                                className={`mr-3 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border ${
                                  isSelected
                                    ? "border-stone-800 bg-stone-800"
                                    : "border-stone-300"
                                }`}
                              >
                                {isSelected && (
                                  <svg
                                    className="h-3 w-3 text-white"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                )}
                              </div>
                              {choice.choice}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <button
                      onClick={navigateToPrevQuestion}
                      disabled={currentQuestionIndex === 0}
                      className={`flex items-center rounded-md px-4 py-2 text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-1 ${
                        currentQuestionIndex === 0
                          ? "cursor-not-allowed text-stone-400"
                          : "bg-stone-100 text-stone-800 hover:bg-stone-200"
                      }`}
                    >
                      <ChevronLeft size={16} className="mr-1" />
                      Praeitas
                    </button>

                    <div className="md:hidden">
                      <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className={`rounded-md bg-stone-800 px-4 py-2 text-sm font-medium text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-1 ${
                          submitting
                            ? "cursor-not-allowed opacity-70"
                            : "hover:bg-stone-700"
                        }`}
                      >
                        {submitting ? "Užbaigiama..." : "Baigti testą"}
                      </button>
                    </div>

                    <button
                      onClick={navigateToNextQuestion}
                      disabled={currentQuestionIndex === questions.length - 1}
                      className={`flex items-center rounded-md px-4 py-2 text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-1 ${
                        currentQuestionIndex === questions.length - 1
                          ? "cursor-not-allowed text-stone-400"
                          : "bg-stone-100 text-stone-800 hover:bg-stone-200"
                      }`}
                    >
                      Sekantis
                      <ChevronRight size={16} className="ml-1" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
