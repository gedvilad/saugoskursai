import { and, eq } from "drizzle-orm";
import { db } from "~/server/db";
import {
  notifications,
  user_assigned_courses,
  users,
} from "~/server/db/schema";

export async function POST(req: Request) {
  try {
    // Parse the request body
    const body = (await req.json()) as {
      courseId: number;
      userIds: string[];
      groupId: number;
      assignedById: string;
    };
    if (!body.courseId || !body.userIds) {
      return new Response(
        JSON.stringify({
          message: "Privaloma pasirinkti kursą ir bent vieną narį.",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }
    const course = await db.query.courses.findFirst({
      where: (courses, { eq }) => eq(courses.id, body.courseId),
    });

    if (!course) {
      return new Response(
        JSON.stringify({ message: "Toks kursas nerastas." }),
        { status: 409, headers: { "Content-Type": "application/json" } },
      );
    }
    const userIds = body.userIds.map((id) => id);

    for (const element of userIds) {
      const activeCourse = await db
        .select()
        .from(user_assigned_courses)
        .where(
          and(
            eq(user_assigned_courses.userId, element),
            eq(user_assigned_courses.status, "Priskirtas"),
            eq(user_assigned_courses.courseId, body.courseId),
          ),
        );

      if (activeCourse[0]) {
        const userWithActiveCourse = await db
          .select()
          .from(users)
          .where(eq(users.clerk_id, activeCourse[0].userId));

        return new Response(
          JSON.stringify({
            message: `${userWithActiveCourse[0]?.first_name} ${userWithActiveCourse[0]?.last_name} jau turi priskirtą šį kursą.`,
          }),
          { status: 409, headers: { "Content-Type": "application/json" } },
        );
      }
    }

    const valuesToInsert = userIds.map((id) => ({
      userId: id,
      courseId: body.courseId,
      groupId: body.groupId,
      assignedById: body.assignedById,
    }));
    const valuesToInsertNotif = userIds.map((id) => ({
      userId: id,
      message: `Jums priskirtas naujas kursas: ${course.name}`,
      createdAt: new Date(),
      url: "https://pvpwebsite.vercel.app/my-courses/",
    }));
    await db.insert(user_assigned_courses).values(valuesToInsert);
    await db.insert(notifications).values(valuesToInsertNotif);

    return new Response(
      JSON.stringify({ message: "Kursai sėkmingai priskirti" }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ message: "Įvyko klaida: " + String(error) }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
