import { db } from "~/server/db";
import { eq } from "drizzle-orm";
import { tests } from "~/server/db/schema";
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
    return new Response(
      JSON.stringify({ questions: questions }), // Wrap the array in an object
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ message: "Įvyko klaida: " + String(error) }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
