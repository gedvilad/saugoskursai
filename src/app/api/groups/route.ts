// app/api/groups/route.ts
import { NextResponse } from "next/server";
import {
  createGroup,
  getUserGroups,
  getGroupAllUsers,
} from "~/server/group-queries";

interface CreateGroupRequest {
  name: string;
  ownerId: string;
}

export async function POST(req: Request) {
  try {
    // Validate and type the request body
    const body = (await req.json()) as CreateGroupRequest;

    if (!body.name || !body.ownerId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    await createGroup(body.name, body.ownerId);

    return NextResponse.json(
      { message: "Group created successfully" },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating group:", error);
    return NextResponse.json(
      { error: "Failed to create group" },
      { status: 500 },
    );
  }
}

export async function GET(req: Request) {
  const url = new URL(req.url);

  // Check if we're requesting users for a specific group (via groupId)
  const groupId = url.searchParams.get("groupId");

  if (groupId) {
    try {
      // Call your server-side function to fetch users of the specified group
      const users = await getGroupAllUsers(Number(groupId)); // Ensure groupId is a number
      return NextResponse.json({ users });
    } catch (error) {
      console.error("Error fetching users for group:", error);
      return NextResponse.json(
        { error: "Failed to fetch users" },
        { status: 500 },
      );
    }
  }

  // Otherwise, return groups for the user
  const userId = url.searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ error: "UserId is required" }, { status: 400 });
  }

  try {
    // Fetch the groups for the user
    const groups = await getUserGroups(userId);
    return NextResponse.json({ groups });
  } catch (error) {
    console.error("Error fetching groups:", error);
    return NextResponse.json(
      { error: "Failed to fetch groups" },
      { status: 500 },
    );
  }
}
