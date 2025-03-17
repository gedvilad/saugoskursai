"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Question {
  question: string;
  answer: string;
  type: number;
}
interface ApiResponseQuestions {
  questions: Question[];
}

export default function TestPage() {
  const params = useParams();
  const id = Number(params.id);

  const [questions, setQuestions] = useState<Question[]>([]);

  useEffect(() => {
    const fetchQuestions = async () => {
      const response = await fetch("/api/tests/testQuestions?id=" + id);
      const data = (await response.json()) as ApiResponseQuestions;
      console.log(data);
      setQuestions(data.questions);
    };
    fetchQuestions().catch((error) =>
      console.error("Error fetching questions:", error),
    );
  }, [id]);

  return (
    <div className="p-4">
      {questions.map((question) => (
        <div key={question.question}>
          <h2>{question.question}</h2>
          <p>{question.answer}</p>
        </div>
      ))}
    </div>
  );
}
