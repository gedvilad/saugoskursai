import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { course } from "~/server/db/schema";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const userId = url.searchParams.get("userId");
  if (!userId) {
    return new Response("Missing userId", { status: 400 });
  }
  const courses = await db
    .select({
      id: course.id,
      name: course.name,
    })
    .from(course);
  return NextResponse.json({ courses: courses, assignedCourses: [] });
}
