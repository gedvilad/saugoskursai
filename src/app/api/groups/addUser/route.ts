import { NextResponse } from "next/server";
import { addUserToGroup } from "~/server/group-queries";

interface CreateUserRequest {
  clerkId: string;
  groupId: string;
}
export async function POST(req: Request) {
  try {
    // Validate and type the request body
    const body = (await req.json()) as CreateUserRequest;

    if (!body.clerkId || !body.groupId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    await addUserToGroup(Number(body.groupId), body.clerkId);

    return NextResponse.json(
      { message: "User added successfully" },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error adding user:", error);
    return NextResponse.json({ error: "Failed to add user" }, { status: 500 });
  }
}
