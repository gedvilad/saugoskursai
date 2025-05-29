import { auth } from "@clerk/nextjs/server";
import { db } from "~/server/db";
import {
  courses,
  user_assigned_courses,
  user_test_responses,
} from "~/server/db/schema";
import { and, eq, or } from "drizzle-orm";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const testId = url.searchParams.get("testId");
  const userId = url.searchParams.get("userId");
  const assignedCourseId = url.searchParams.get("assignedCourseId");
  const courseId = url.searchParams.get("courseId");
  if (!testId || !userId || !assignedCourseId || !courseId) {
    return new Response(JSON.stringify({ message: "Trūksta duomenų" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
  try {
    /*const user = await auth();
        if (!user) {
            return new Response(JSON.stringify({ message: "Neturite prieigos" }), { status: 400, headers: { "Content-Type": "application/json" } });
        }*/
    const course = await db
      .select()
      .from(courses)
      .where(eq(courses.id, Number(courseId)));
    if (!course) {
      return new Response(
        JSON.stringify({ message: "Kursas su tokiu ID nerastas" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }
    if (course[0]?.courseTest !== Number(testId)) {
      return new Response(
        JSON.stringify({ message: "Neatitinka kurso ir testo ID" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }
    const test_respone = await db
      .select()
      .from(user_test_responses)
      .where(
        and(
          eq(user_test_responses.userId, userId),
          eq(user_test_responses.assignedCourse, Number(assignedCourseId)),
        ),
      )
      .limit(1);
    if (test_respone.length === 0) {
      return new Response(JSON.stringify({ message: "Neturite prieigos" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    const assignedCourse = await db
      .select()
      .from(user_assigned_courses)
      .where(
        and(
          eq(user_assigned_courses.userId, userId),
          eq(user_assigned_courses.id, Number(assignedCourseId)),
          eq(user_assigned_courses.courseId, Number(courseId)),
          or(
            eq(user_assigned_courses.status, "Priskirtas"),
            eq(user_assigned_courses.status, "Pradėtas"),
          ),
        ),
      )
      .limit(1);
    if (assignedCourse.length === 0) {
      return new Response(JSON.stringify({ message: "Neturite prieigos" }), {
        status: 402,
        headers: { "Content-Type": "application/json" },
      });
    }
    return new Response(
      JSON.stringify({ accessStatus: assignedCourse[0]?.status }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("Error validating test access:", error);
    return new Response(JSON.stringify({ message: "Įvyko klaida" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
}
