/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { NextResponse } from "next/server";
import { addUserToGroup } from "~/server/group-queries";
import { db } from "~/server/db";
import { groups, userGroups, users } from "~/server/db/schema";
import { and, eq } from "drizzle-orm";
interface CreateUserRequest {
  clerkId: string;
  groupId: string;
}
export async function POST(req: Request) {
  try {
    const { clerkId, groupId } = await req.json();

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
      //throw new Error("Group not found");
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
  } catch (error: any) {
    console.error("Error adding user:", error);

    // Check error message and return specific status
    let status = 500;
    if (error.message === "User is already in this group") {
      status = 409; // 409 Conflict - User is already in group
    } else if (error.message === "Group not found") {
      status = 404; // 404 Not Found - Group doesn't exist
    }

    return new Response(
      JSON.stringify({ message: error.message || "Internal Server Error" }),
      { status, headers: { "Content-Type": "application/json" } },
    );
  }
}
