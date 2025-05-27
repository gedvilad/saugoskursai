import { subYears } from "date-fns";
import { eq, lt } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { use } from "react";
import { db } from "~/server/db";
import {
  courses,
  user_assigned_courses,
  user_test_responses,
  users,
} from "~/server/db/schema";

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const authHeader = req.headers.get("authorization");
    const secret = process.env.CRON_SECRET;

    if (!authHeader || authHeader !== `Bearer ${secret}`) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const oneYearAgo = subYears(new Date(), 1);

    const expiredAssignments = await db
      .select()
      .from(user_assigned_courses)
      .where(lt(user_assigned_courses.createdAt, oneYearAgo));

    for (const assignment of expiredAssignments) {
      const [newAssignment] = await db
        .insert(user_assigned_courses)
        .values({
          userId: assignment.userId,
          courseId: assignment.courseId,
          groupId: assignment.groupId,
          assignedById: assignment.assignedById,
          status: "Priskirtas",
          createdAt: new Date(),
        })
        .returning();
      if (!newAssignment) continue;
      const courseInfo = await db
        .select()
        .from(courses)
        .where(eq(courses.id, newAssignment?.courseId))
        .limit(1);
      if (!courseInfo[0]) continue;
      const newResponse = await db.insert(user_test_responses).values({
        userId: assignment.userId,
        assignedCourse: newAssignment?.id,
        testId: courseInfo[0].courseTest,
        createdAt: new Date(),
        score: "0",
        startTime: new Date(),
        endTime: new Date(),
      });
      if (!newResponse) continue;
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.clerk_id, assignment.userId));

      if (user?.email) {
        await sendEmail({
          to: user.email,
          subject: "🕒 Laikas perlaikyti kursą",
          body: `Sveiki ${user.first_name || ""},\n\nPraėjo metai nuo "${courseInfo[0].name}" kurso laikymo datos. Prašome jį perlaikyti.\n\nAčiū!`,
        });
      }
    }

    return NextResponse.json({ status: "OK" });
  } catch (err: unknown) {
    // ✅ Safe error handling
    if (err instanceof Error) {
      console.error("Error in yearly reminder:", err.message);
    } else {
      console.error("Unknown error in yearly reminder");
    }

    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
