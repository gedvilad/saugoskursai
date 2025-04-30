import { and, eq } from "drizzle-orm";
import { db } from "~/server/db";
import { user_assigned_courses, user_bought_courses } from "~/server/db/schema";
import { getUserByClerkId } from "~/server/user-queries";

export async function validateCourseAccess(
  userId: string,
  requestedCourseId: number,
  status: string,
) {
  const user = await getUserByClerkId(userId);
  if (!user) {
    return null;
  }
  if (status === "assigned" || status === "done") {
    const course = await db
      .select()
      .from(user_assigned_courses)
      .where(
        and(
          eq(user_assigned_courses.userId, userId),
          eq(user_assigned_courses.id, requestedCourseId),
        ),
      )
      .limit(1);
    if (course.length === 0) {
      return null;
    }
    return course[0]?.status;
  } else if (status === "purchased") {
    const boughtCourse = await db
      .select()
      .from(user_bought_courses)
      .where(
        and(
          eq(user_bought_courses.userId, userId),
          eq(user_bought_courses.id, requestedCourseId),
        ),
      )
      .limit(1);
    if (boughtCourse.length === 0) {
      return null;
    }
    return "purchased-active";
    //TODO: when subs fully implemented, check if sub active and etc..
  }
}
