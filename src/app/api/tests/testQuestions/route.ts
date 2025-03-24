import { db } from "~/server/db";
import { eq } from "drizzle-orm";
import {
  test_question_choices,
  test_questions,
  tests,
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
    const body = await req.json();
    const { testId, answers, userId } = body; // Get userId from body

    if (!userId) {
      return new Response(
        JSON.stringify({ message: "Vartotojo ID privalomas!" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }
    // Check if the userId is a string (or validate as needed)
    if (typeof userId !== "string") {
      return new Response(
        JSON.stringify({ message: "Netinkamas vartotojo ID formatas!" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    if (!testId || !answers || !Array.isArray(answers)) {
      return new Response(
        JSON.stringify({
          message: "Netinkamas testo ID arba atsakymų formatas!",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    // Basic validation of answers structure
    for (const answer of answers) {
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

    // Calculate score (This is a placeholder - improve as needed)
    let score = 0;
    for (const answer of answers) {
      try {
        // Fetch the correct choice to check `isCorrect`
        const correctChoice = await db.query.test_question_choices.findFirst({
          where: (tqc, { eq }) => eq(tqc.id, answer.choiceId),
        });

        if (correctChoice?.isCorrect) {
          score++;
        }
      } catch (choiceError) {
        console.error("Error fetching choice:", choiceError);
        // Handle the error, e.g., log and continue, or return an error
        return new Response(
          JSON.stringify({
            message: `Klaida gaunant pasirinkimą su ID ${answer.choiceId}`,
          }),
          { status: 500, headers: { "Content-Type": "application/json" } },
        );
      }
    }

    const [userTestResponse] = await db
      .insert(user_test_responses)
      .values({
        userId: userId, // Use userId from the request
        testId: testId,
        startTime: startTime,
        endTime: endTime,
        score: score,
      })
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
    for (const answer of answers) {
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
          userId: userId, // Use userId from the request
          testId: testId,
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

    return new Response(
      JSON.stringify({ message: "Testas sėkmingai pateiktas!" }),
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
