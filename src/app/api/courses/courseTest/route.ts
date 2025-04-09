import { db } from "~/server/db";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const courseId = url.searchParams.get("courseId");
    if (!courseId) {
      return new Response(JSON.stringify({ message: "Nerastas kurso ID" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const course = await db.query.courses.findFirst({
      where: (courses, { eq }) => eq(courses.id, Number(courseId)),
    });
    if (!course) {
      return new Response(
        JSON.stringify({ message: "Kursas su tokiu ID nerastas" }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }

    const test = await db.query.tests.findFirst({
      where: (tests, { eq }) => eq(tests.id, course.courseTest),
    });
    if (!test) {
      return new Response(
        JSON.stringify({ message: "Testas su tokiu ID nerastas" }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }
    return new Response(JSON.stringify({ test: test }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ message: "Įvyko klaida: " + String(error) }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
