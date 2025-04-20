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
    console.log(existingResponse[0]);
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
    }
  } catch (error) {
    console.error("Error inserting user_test_responses:", error);
    return new Response(
      JSON.stringify({ message: "Serverio klaida apdorojant užklausą!" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
export async function PUT(req: Request) {
  const body = (await req.json()) as {
    testId: number;
    userId: string;
    answers: {
      questionId: number;
      choiceId: number;
      answer: string;
    }[];
    assignedCourseId: number;
  };

  if (!body.userId) {
    return new Response(
      JSON.stringify({ message: "Vartotojo ID privalomas!" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }
  if (typeof body.userId !== "string") {
    return new Response(
      JSON.stringify({ message: "Netinkamas vartotojo ID formatas!" }),
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

  try {
    if (!body.testId || !body.answers || !Array.isArray(body.answers)) {
      return new Response(
        JSON.stringify({
          message: "Netinkamas testo ID arba atsakymų formatas!",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    // Basic validation of answers structure
    for (const answer of body.answers) {
      if (
        typeof answer.questionId !== "number" ||
        typeof answer.choiceId !== "number" ||
        typeof answer.answer !== "string"
      ) {
        return new Response(
          JSON.stringify({
            message:
              "Netinkamas klausimo ID, pasirinkimo ID arba atsakymo formatas!",
          }),
          { status: 400, headers: { "Content-Type": "application/json" } },
        );
      }
    }

    // 1. Create a user_test_response record
    const startTime = new Date(); // Capture start time
    const endTime = new Date(); // Capture end time

    const correctAnswers = await db
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

    // Build maps of correct choices and all choices per question
    const correctChoicesMap = new Map(); // Map<questionId, Set<correctChoiceIds>>
    const allChoicesMap = new Map(); // Map<questionId, Set<allChoiceIds>>

    for (const ca of correctAnswers) {
      if (!correctChoicesMap.has(ca.questionId)) {
        correctChoicesMap.set(ca.questionId, new Set());
        allChoicesMap.set(ca.questionId, new Set());
      }
      if (ca.isCorrect) {
        correctChoicesMap.get(ca.questionId).add(ca.choiceId);
      }
      allChoicesMap.get(ca.questionId).add(ca.choiceId);
    }

    // Group user answers per question
    const userAnswersByQuestion = new Map(); // Map<questionId, Set<selectedChoiceIds>>
    for (const answer of body.answers) {
      if (!userAnswersByQuestion.has(answer.questionId)) {
        userAnswersByQuestion.set(answer.questionId, new Set());
      }
      userAnswersByQuestion.get(answer.questionId).add(answer.choiceId);
    }

    let totalScore = 0;
    let totalQuestions = correctChoicesMap.size;

    for (const [questionId, correctChoiceSet] of correctChoicesMap.entries()) {
      const userChoiceSet = userAnswersByQuestion.get(questionId) || new Set();
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
        // Single-choice question
        questionScore = correctSelected === 1 ? 1 : 0;
      } else {
        // Multi-choice question — partial credit, penalize incorrect picks
        questionScore =
          correctSelected / totalCorrect - incorrectSelected / totalCorrect;
        questionScore = Math.max(0, Math.min(1, questionScore)); // Clamp between 0 and 1
      }

      totalScore += questionScore;
    }

    const overallScore = (totalScore / totalQuestions) * 100;

    const course = await db
      .select({
        id: courses.id,
      })
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
        JSON.stringify({
          message: "Nepavyko sukurti vartotojo testo atsakymo!",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }

    // 2. Create user_test_answers records for each answer
    for (const answer of body.answers) {
      try {
        // Fetch the question and choice details to populate user_test_answers
        const question = await db.query.test_questions.findFirst({
          where: (tq, { eq }) => eq(tq.id, answer.questionId),
        });

        const choice = await db.query.test_question_choices.findFirst({
          where: (tqc, { eq }) => eq(tqc.id, answer.choiceId),
        });

        if (!question || !choice) {
          console.error(
            `Question or choice not found for questionId: ${answer.questionId}, choiceId: ${answer.choiceId}`,
          );
          continue; // Skip this answer and continue with the next
        }

        await db.insert(user_test_answers).values({
          user_test_response_id: userTestResponse.id,
          test_questions_id: answer.questionId,
          test_question_choices_id: answer.choiceId,
          userId: body.userId, // Use userId from the request
          testId: body.testId,
          answer: answer.answer,
          createdAt: new Date(),
          isCorrect: choice.isCorrect, // Save the correct status,
        });
      } catch (answerError) {
        console.error(
          `Error inserting user_test_answers for questionId: ${answer.questionId}, choiceId: ${answer.choiceId}`,
          answerError,
        );
        return new Response(
          JSON.stringify({
            message: `Klaida įterpiant vartotojo testo atsakymus klausimui: ${answer.questionId}, pasirinkimui: ${answer.choiceId}`,
          }),
          { status: 500, headers: { "Content-Type": "application/json" } },
        );
      }
    }

    await db
      .update(user_assigned_courses)
      .set({
        status: "Atliktas",
      })
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
