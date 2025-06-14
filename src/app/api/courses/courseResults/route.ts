import { db } from "~/server/db";
import {
  user_assigned_courses,
  user_test_responses,
  courses,
  users,
  groups,
  tests,
  userGroups,
} from "~/server/db/schema";
import { eq, desc } from "drizzle-orm";

export type CourseResult = {
  id: number;
  user_id: string;
  course_id: number;
  completed_at: string;
  score: number;
  time_spent_seconds: number;
  passed: boolean;
};

export async function GET(req: Request) {
  const url = new URL(req.url);
  const groupId = url.searchParams.get("groupId");
  if (!groupId) {
    return new Response(JSON.stringify({ message: "Privalomas grupės ID." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
  try {
    const group = await db.query.groups.findFirst({
      where: (groups, { eq }) => eq(groups.id, Number(groupId)),
    });
    if (!group) {
      return new Response(
        JSON.stringify({ message: "Grupė su tokiu ID nerasta" }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }
    const courseResults = await db
      .select({
        id: user_assigned_courses.id,
        userId: user_assigned_courses.userId,
        courseId: user_assigned_courses.courseId,
        groupId: user_assigned_courses.groupId,
        status: user_assigned_courses.status,
        testId: user_test_responses.testId,
        startTime: user_test_responses.startTime,
        endTime: user_test_responses.endTime,
        score: user_test_responses.score,
        updatedAt: user_test_responses.createdAt,
        count: user_test_responses.submitCount,
      })
      .from(user_assigned_courses)
      .innerJoin(courses, eq(user_assigned_courses.courseId, courses.id))
      .leftJoin(
        user_test_responses,
        eq(user_assigned_courses.id, user_test_responses.assignedCourse),
      )
      .where(eq(user_assigned_courses.groupId, Number(groupId)))
      .orderBy(desc(user_test_responses.endTime)); // Add this line

    return new Response(JSON.stringify({ results: courseResults }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching course results:", error);
    return new Response(
      JSON.stringify({ message: "Serverio klaida apdorojant užklausą!" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
