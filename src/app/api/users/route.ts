import { useAuth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { getAllUsers, getUserByClerkId } from "~/server/user-queries";

export async function GET(req: Request) {
  const acceptHeader = req.headers.get("accept") ?? "";
  if (acceptHeader.includes("text/html")) {
    return NextResponse.json(
      { error: "Direct access not allowed" },
      { status: 403 },
    );
  }

  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get("clerkId");

    if (userId) {
      const user = await getUserByClerkId(userId);
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
      return new Response(JSON.stringify({ user }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // If no ID is provided, return all users
    const users = await getAllUsers();
    return NextResponse.json({ users });
  } catch (error) {
    console.error("Error fetching user(s):", error);
    return NextResponse.json(
      { error: "Failed to fetch user(s)" },
      { status: 500 },
    );
  }
}
