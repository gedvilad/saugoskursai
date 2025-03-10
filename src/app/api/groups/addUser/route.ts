import { db } from "~/server/db";
import { groups, userGroups, users } from "~/server/db/schema";
import { and, eq } from "drizzle-orm";
interface CreateUserRequest {
  clerkId: string;
  groupId: number;
}
export async function POST(req: Request) {
  try {
    const { clerkId, groupId } = (await req.json()) as CreateUserRequest;

    if (!clerkId || !groupId) {
      return new Response(
        JSON.stringify({ message: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    //-----------------------------------------------------------------------------
    const group = await db.query.groups.findFirst({
      where: eq(groups.id, groupId),
    });

    if (!group) {
      return new Response(
        JSON.stringify({ message: "KLAIDA: Grupė nerasta" }),
        { status: 409, headers: { "Content-Type": "application/json" } },
      );
    }

    // Check if the user is already in the group
    const existingUserGroup = await db.query.userGroups.findFirst({
      where: and(
        eq(userGroups.userId, clerkId),
        eq(userGroups.groupId, groupId),
      ),
    });

    if (existingUserGroup) {
      return new Response(
        JSON.stringify({ message: "User is already in this group" }),
        { status: 409, headers: { "Content-Type": "application/json" } },
      );
    }

    // If the user isn't already in the group, add them
    await db.insert(userGroups).values({
      userId: clerkId,
      groupId: groupId,
      role: "Narys", // Default role for the user
      createdAt: new Date(),
    });
    //-----------------------------------------------------------------------------

    return new Response(
      JSON.stringify({ message: "User added successfully" }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (error: unknown) {
    let status = 500;
    let message = "Internal Server Error";

    if (error instanceof Error) {
      message = error.message;

      if (error.message === "User is already in this group") {
        status = 409;
      } else if (error.message === "Group not found") {
        status = 404;
      }
    }

    return new Response(JSON.stringify({ message }), {
      status,
      headers: { "Content-Type": "application/json" },
    });
  }
}
