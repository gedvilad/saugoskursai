import { db } from "~/server/db";
import { notifications, user_assigned_courses } from "~/server/db/schema";

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
