import { db } from "~/server/db";
import { eq } from "drizzle-orm";
import { tests } from "~/server/db/schema";
export async function GET(req: Request) {
  try {
    const test = await db.query.tests.findMany();
    if (!test) {
      return new Response(
        JSON.stringify({ message: "Įvyko klaida: Nerasta jokių testų" }),
        { status: 409, headers: { "Content-Type": "application/json" } },
      );
    }
    return new Response(
      JSON.stringify({ tests: test }), // Wrap the array in an object
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ message: "Įvyko klaida: " + String(error) }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
