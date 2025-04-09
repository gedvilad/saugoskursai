import { eq, desc, and } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { notifications } from "~/server/db/schema";

export async function PUT(request: Request) {
  const url = new URL(request.url);
  const userId = url.searchParams.get("userId");

  if (userId) {
    try {
      await db
        .update(notifications)
        .set({
          status: 0,
        })
        .where(eq(notifications.userId, userId));
      const data = await db
        .select({
          message: notifications.message,
          created_at: notifications.createdAt,
          status: notifications.status,
          url: notifications.url,
        })
        .from(notifications)
        .where(eq(notifications.userId, userId))
        .orderBy(desc(notifications.createdAt))
        .limit(4);
      return NextResponse.json({ data });
    } catch (error) {
      console.error("Error updating notifications:", error);
      return NextResponse.json(
        { error: "Failed to update notifications" },
        { status: 500 },
      );
    }
  }
}

export async function GET(req: Request) {
  const url = new URL(req.url);

  const userId = url.searchParams.get("userId");

  if (userId) {
    try {
      const dataNew = await db
        .select({
          message: notifications.message,
          created_at: notifications.createdAt,
          status: notifications.status,
          url: notifications.url,
        })
        .from(notifications)
        .where(
          and(eq(notifications.userId, userId), eq(notifications.status, 1)), // Removed duplicate condition
        )
        .orderBy(desc(notifications.createdAt))
        .limit(4);

      const data =
        dataNew.length < 4
          ? await db
              .select({
                message: notifications.message,
                created_at: notifications.createdAt,
                status: notifications.status,
                url: notifications.url,
              })
              .from(notifications)
              .where(
                and(
                  eq(notifications.userId, userId),
                  eq(notifications.status, 0),
                ),
              )
              .orderBy(desc(notifications.createdAt))
              .limit(4 - dataNew.length)
          : []; // Instead of "null", return an empty array
      return NextResponse.json({ data, dataNew });
    } catch (error) {
      console.error("Error fetching users for group:", error);
      return new Response(
        JSON.stringify({ message: "Įvyko klaida: " + String(error) }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
  }
}
