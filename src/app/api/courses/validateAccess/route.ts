// pages/api/courses/validate-access.ts

import { NextApiRequest, NextApiResponse } from "next";
import { and, eq } from "drizzle-orm";
import { db } from "~/server/db";
import { user_assigned_courses, user_bought_courses } from "~/server/db/schema";
import { getUserByClerkId } from "~/server/user-queries";
import { NextResponse } from "next/server";

export async function GET(req: Request, res: NextApiResponse) {
  const url = new URL(req.url);
  const userId = url.searchParams.get("userId");
  const requestedCourseId = url.searchParams.get("requestedCourseId");
  const requestType = url.searchParams.get("requestType");

  if (!userId || !requestedCourseId || !requestType) {
    return res
      .status(400)
      .json({ message: "Missing required query parameters." });
  }

  const user = await getUserByClerkId(userId);
  if (!user) {
    return res.status(401).json({ message: "User not found." });
  }

  try {
    if (requestType === "assigned" || requestType === "done") {
      const course = await db
        .select()
        .from(user_assigned_courses)
        .where(
          and(
            eq(user_assigned_courses.userId, userId),
            eq(user_assigned_courses.courseId, Number(requestedCourseId)),
          ),
        )
        .limit(1);

      if (course.length === 0) {
        return NextResponse.json({ message: "Access denied." });
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

      if (boughtCourse.length === 0) {
        return res.status(403).json({ message: "Access denied." });
      }

      return res.status(200).json({ accessStatus: "purchased-active" });
    }

    return res.status(400).json({ message: "Invalid status type." });
  } catch (error) {
    console.error("Error validating course access:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
}
