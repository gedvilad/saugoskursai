// app/api/groups/route.ts
import { NextResponse } from "next/server";
import { getAllUsers } from "~/server/user-queries";
export async function GET(req: Request) {
  try {
    // Fetch the groups for the user
    const users = await getAllUsers();
    return NextResponse.json({ users });
  } catch (error) {
    console.error("Error fetching groups:", error);
    return NextResponse.json(
      { error: "Failed to fetch groups" },
      { status: 500 },
    );
  }
}
