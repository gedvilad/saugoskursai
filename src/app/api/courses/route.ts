import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { courses } from "~/server/db/schema";
export async function GET(req: Request) {
  try {
    const fetchedCourses = await db
      .select({
        id: courses.id,
        name: courses.name,
        productId: courses.productId,
      })
      .from(courses);
    return NextResponse.json({
      courses: fetchedCourses,
    });
  } catch (error) {
    console.error("Error fetching courses:", error);
    return NextResponse.json(
      { message: "Failed to fetch courses" },
      { status: 500 },
    );
  }
}
