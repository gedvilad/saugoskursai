import { db } from "~/server/db";
import { user_assigned_courses } from "~/server/db/schema";

export async function POST(req: Request) {
  try {
    // Parse the request body
    const body = (await req.json()) as {
      courseId: number;
      userIds: string[];
      groupId: number;
    };
    if (!body.courseId || !body.userIds) {
      return new Response(
        JSON.stringify({
          message: "Privaloma pasirinkti kursą ir bent vieną narį.",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }
    const userIds = body.userIds.map((id) => id);

    const valuesToInsert = userIds.map((id) => ({
      userId: id,
      courseId: body.courseId,
      groupId: body.groupId,
    }));

    await db.insert(user_assigned_courses).values(valuesToInsert);
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
