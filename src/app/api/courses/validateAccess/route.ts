// pages/api/courses/validate-access.ts

import { and, eq } from "drizzle-orm";
import { db } from "~/server/db";
import { user_assigned_courses, user_bought_courses } from "~/server/db/schema";
import { getUserByClerkId } from "~/server/user-queries";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const userId = url.searchParams.get("userId");
  const requestedCourseId = url.searchParams.get("requestedCourseId");
  const requestType = url.searchParams.get("requestType");

  if (!userId || !requestedCourseId || !requestType) {
    return new Response(JSON.stringify({ message: "Trūksta duomenų" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const user = await getUserByClerkId(userId);
  if (!user) {
    return new Response(
      JSON.stringify({ message: "Neegzistuoja toks vartotojas." }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  try {
    if (requestType === "assigned" || requestType === "done") {
      const course = await db
        .select()
        .from(user_assigned_courses)
        .where(
          and(
            eq(user_assigned_courses.userId, userId),
            eq(user_assigned_courses.id, Number(requestedCourseId)),
          ),
        )
        .limit(1);
      if (course.length === 0) {
        return new Response(JSON.stringify({ message: "Neturite prieigos" }), {
          status: 402,
          headers: { "Content-Type": "application/json" },
        });
      }

      return NextResponse.json({ accessStatus: course[0]?.status });
    }

    if (requestType === "purchased") {
      const boughtCourse = await db
        .select()
        .from(user_bought_courses)
        .where(
          and(
            eq(user_bought_courses.userId, userId),
            eq(user_bought_courses.courseId, Number(requestedCourseId)),
          ),
        )
        .limit(1);
      console.log("boughtCourse", requestedCourseId);
      if (boughtCourse.length === 0) {
        return new Response(JSON.stringify({ message: "Neturite prieigos" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }
      return new Response(
        JSON.stringify({ accessStatus: "purchased-active" }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    }

    return new Response(JSON.stringify({ message: "Netinkamas statusas" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error validating course access:", error);
    return new Response(JSON.stringify({ message: "Įvyko klaida" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
}
