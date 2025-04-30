import { db } from "~/server/db";
import { and, eq } from "drizzle-orm";
import {
  courses,
  test_question_choices,
  test_questions,
  tests,
  user_assigned_courses,
  user_test_answers,
  user_test_responses,
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
        choiceId: test_question_choices.id,
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
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      testId: number;
      userId: string;
      assignedCourseId: number;
    };
    if (!body.userId) {
      return new Response(
        JSON.stringify({ message: "Vartotojo ID privalomas!" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }
    if (!body.testId) {
      return new Response(
        JSON.stringify({
          message: "Privalomas testo ID!",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }
    if (!body.assignedCourseId) {
      return new Response(
        JSON.stringify({
          message: "Privalomas priskirto kurso ID!",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }
    const existingResponse = await db
      .select()
      .from(user_test_responses)
      .where(eq(user_test_responses.assignedCourse, body.assignedCourseId));
    if (existingResponse.length === 0) {
      const overallScore = 0;
      await db.insert(user_test_responses).values({
        userId: body.userId,
        testId: body.testId,
        score: overallScore.toFixed(2),
        assignedCourse: body.assignedCourseId,
        startTime: new Date(),
      });

      return new Response(
        JSON.stringify({
          message: "Sukurtas atsakymas su pradiniu laiku.",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    } else {
      return new Response(
        JSON.stringify({
          message: "Įvyko klaida, prašome kreiptis į administratorių.",
        }),
        { status: 409, headers: { "Content-Type": "application/json" } },
      );
    }
  } catch (error) {
    console.error("Error inserting user_test_responses:", error);
    return new Response(
      JSON.stringify({ message: "Serverio klaida apdorojant užklausą!" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
interface Answer {
  questionId: number;
  choiceId: number;
  answer: string;
}

interface CorrectAnswer {
  isCorrect: boolean;
  question: string;
  choice: string;
  questionId: number;
  choiceId: number;
}

interface RequestBody {
  testId: number;
  userId: string;
  assignedCourseId: number;
  answers: Answer[];
}

export async function PUT(req: Request) {
  const body = (await req.json()) as RequestBody;

  // Validations
  if (!body.userId || typeof body.userId !== "string") {
    return new Response(
      JSON.stringify({ message: "Netinkamas vartotojo ID!" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  if (!body.testId || !body.assignedCourseId || !Array.isArray(body.answers)) {
    return new Response(
      JSON.stringify({ message: "Netinkami testo duomenys!" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  for (const answer of body.answers) {
    if (
      typeof answer.questionId !== "number" ||
      typeof answer.choiceId !== "number" ||
      typeof answer.answer !== "string"
    ) {
      return new Response(
        JSON.stringify({ message: "Netinkamas atsakymo formatas!" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }
  }

  try {
    const correctAnswers: CorrectAnswer[] = await db
      .select({
        isCorrect: test_question_choices.isCorrect,
        question: test_questions.question,
        choice: test_question_choices.choice,
        questionId: test_questions.id,
        choiceId: test_question_choices.id,
      })
      .from(test_question_choices)
      .innerJoin(
        test_questions,
        eq(test_questions.id, test_question_choices.testQuestionId),
      )
      .where(eq(test_questions.testId, body.testId));

    // Group correct answers and all choices
    const correctChoicesMap = new Map<number, Set<number>>();
    const allChoicesMap = new Map<number, Set<number>>();

    for (const ca of correctAnswers) {
      if (!correctChoicesMap.has(ca.questionId)) {
        correctChoicesMap.set(ca.questionId, new Set());
        allChoicesMap.set(ca.questionId, new Set());
      }
      if (ca.isCorrect) {
        correctChoicesMap.get(ca.questionId)!.add(ca.choiceId);
      }
      allChoicesMap.get(ca.questionId)!.add(ca.choiceId);
    }

    // Group user answers
    const userAnswersByQuestion = new Map<number, Set<number>>();
    for (const answer of body.answers) {
      if (!userAnswersByQuestion.has(answer.questionId)) {
        userAnswersByQuestion.set(answer.questionId, new Set());
      }
      userAnswersByQuestion.get(answer.questionId)!.add(answer.choiceId);
    }

    let totalScore = 0;
    const totalQuestions = correctChoicesMap.size;

    for (const [questionId, correctChoiceSet] of correctChoicesMap.entries()) {
      const userChoiceSet =
        userAnswersByQuestion.get(questionId) ?? new Set<number>();

      const totalCorrect = correctChoiceSet.size;
      const totalSelected = userChoiceSet.size;

      let correctSelected = 0;
      let incorrectSelected = 0;

      for (const choiceId of userChoiceSet) {
        if (correctChoiceSet.has(choiceId)) {
          correctSelected++;
        } else {
          incorrectSelected++;
        }
      }

      let questionScore = 0;

      if (totalCorrect === 1) {
        questionScore = correctSelected === 1 ? 1 : 0;
      } else {
        questionScore =
          correctSelected / totalCorrect - incorrectSelected / totalCorrect;
        questionScore = Math.max(0, Math.min(1, questionScore));
      }

      totalScore += questionScore;
    }

    const overallScore = (totalScore / totalQuestions) * 100;

    const course = await db
      .select({ id: courses.id })
      .from(courses)
      .where(eq(courses.courseTest, Number(body.testId)));

    if (!course[0]) {
      return new Response(
        JSON.stringify({ message: "Testas nepriklauso jokiam kursui." }),
        { status: 409, headers: { "Content-Type": "application/json" } },
      );
    }

    const [userTestResponse] = await db
      .update(user_test_responses)
      .set({
        score: overallScore.toFixed(2),
        endTime: new Date(),
      })
      .where(eq(user_test_responses.assignedCourse, body.assignedCourseId))
      .returning();

    if (!userTestResponse) {
      return new Response(
        JSON.stringify({ message: "Nepavyko atnaujinti atsakymo!" }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }

    for (const answer of body.answers) {
      try {
        const question = await db.query.test_questions.findFirst({
          where: (tq, { eq }) => eq(tq.id, answer.questionId),
        });

        const choice = await db.query.test_question_choices.findFirst({
          where: (tqc, { eq }) => eq(tqc.id, answer.choiceId),
        });

        if (!question || !choice) {
          console.error(
            `Missing data for questionId: ${answer.questionId}, choiceId: ${answer.choiceId}`,
          );
          continue;
        }

        await db.insert(user_test_answers).values({
          user_test_response_id: userTestResponse.id,
          test_questions_id: answer.questionId,
          test_question_choices_id: answer.choiceId,
          userId: body.userId,
          testId: body.testId,
          answer: answer.answer,
          createdAt: new Date(),
          isCorrect: choice.isCorrect,
        });
      } catch (err) {
        console.error("Insert error:", err);
        return new Response(
          JSON.stringify({
            message: `Klaida įrašant atsakymą klausimui ${answer.questionId}`,
          }),
          { status: 500, headers: { "Content-Type": "application/json" } },
        );
      }
    }

    await db
      .update(user_assigned_courses)
      .set({ status: "Atliktas" })
      .where(
        and(
          eq(user_assigned_courses.userId, body.userId),
          eq(user_assigned_courses.courseId, course[0].id),
        ),
      );

    return new Response(
      JSON.stringify({
        message: "Testas sėkmingai pateiktas!",
        score: overallScore,
      }),
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Error submitting test:", error);
    return new Response(
      JSON.stringify({ message: "Serverio klaida apdorojant užklausą!" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
