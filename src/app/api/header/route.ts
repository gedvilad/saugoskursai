import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { notifications } from "~/server/db/schema";

export async function GET(req: Request) {
  const url = new URL(req.url);

  const userId = url.searchParams.get("userId");

  if (userId) {
    try {
      const data = await db
        .select({
          message: notifications.message,
          created_at: notifications.createdAt,
          status: notifications.status,
        })
        .from(notifications)
        .where(eq(notifications.userId, userId))
        .limit(4);
      //console.log(data);
      return NextResponse.json({ data });
    } catch (error) {
      console.error("Error fetching users for group:", error);
      return NextResponse.json(
        { error: "Failed to fetch users" },
        { status: 500 },
      );
    }
  }
}
