import { db } from "~/server/db";
import { eq } from "drizzle-orm";
import {
  test_answers,
  test_question_choices,
  test_questions,
  tests,
} from "~/server/db/schema";
export async function GET(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");

  try {
    const questions = await db.query.test_questions.findMany({
      where: (test_questions, { eq }) => eq(test_questions.testId, Number(id)),
    });
    if (!questions) {
      return new Response(
        JSON.stringify({ message: "Įvyko klaida gaunant duomenis!" }),
        { status: 409, headers: { "Content-Type": "application/json" } },
      );
    }

    const questionChoices = await db
      .select({
        choice: test_question_choices.choice,
        isCorrect: test_question_choices.isCorrect,
        questionId: test_question_choices.testQuestionId,
      })
      .from(test_question_choices)
      .innerJoin(
        test_questions,
        eq(test_question_choices.testQuestionId, test_questions.id),
      )
      .innerJoin(tests, eq(test_questions.testId, tests.id))
      .where(eq(tests.id, Number(id)));

    if (!questionChoices) {
      return new Response(
        JSON.stringify({ message: "Įvyko klaida gaunant duomenis!" }),
        { status: 409, headers: { "Content-Type": "application/json" } },
      );
    }
    /*const questionAnswers = await db
      .select({
        answer: test_answers.answer,
        questionId: test_answers.questionId,
      })
      .from(test_answers)
      .innerJoin(test_questions, eq(test_answers.questionId, test_questions.id))
      .innerJoin(tests, eq(test_questions.testId, tests.id))
      .where(eq(tests.id, Number(id)));

    if (!questionAnswers) {
      return new Response(
        JSON.stringify({ message: "Įvyko klaida gaunant duomenis!" }),
        { status: 409, headers: { "Content-Type": "application/json" } },
      );
    }
    console.log(questionAnswers);*/
    return new Response(
      JSON.stringify({
        questions: questions,
        questionChoices: questionChoices,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ message: "Įvyko klaida: " + String(error) }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
