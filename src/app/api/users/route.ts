// app/api/groups/route.ts
import { useAuth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { getAllUsers } from "~/server/user-queries";
export async function GET(req: Request) {
  const acceptHeader = req.headers.get("accept") ?? "";
  if (acceptHeader.includes("text/html")) {
    return NextResponse.json(
      { error: "Direct access not allowed" },
      { status: 403 },
    );
  }

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
