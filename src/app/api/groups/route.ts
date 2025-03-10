// app/api/groups/route.ts
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { groups } from "~/server/db/schema";
import {
  createGroup,
  getUserGroups,
  getGroupAllUsers,
} from "~/server/group-queries";

export async function POST(req: Request) {
  try {
    // Parse the request body
    const body = (await req.json()) as {
      action: string;
      name?: string;
      ownerId?: string;
      groupId?: number;
    };

    // Handle creating a group
    if (body.action === "create") {
      if (!body.name || !body.ownerId) {
        return new Response(
          JSON.stringify({ message: "Grupė privalo turėti pavadinimą!" }),
          { status: 409, headers: { "Content-Type": "application/json" } },
        );
      }

      await createGroup(body.name, body.ownerId);

      return new Response(
        JSON.stringify({ message: "Grupė sėkmingai sukurta" }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    }

    // Handle deleting a group
    if (body.action === "delete") {
      if (!body.groupId) {
        return new Response(
          JSON.stringify({ message: "Nenurodytas grupės ID" }),
          { status: 409, headers: { "Content-Type": "application/json" } },
        );
      }

      const result = await db.delete(groups).where(eq(groups.id, body.groupId));

      if (result.count === 0) {
        throw new Error("Grupė nerasta");
      }

      return new Response(
        JSON.stringify({ message: "Grupė sėkmingai pašalinta" }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    }

    // If the action is not recognized
    return new Response(
      JSON.stringify({ message: "Įvyko klaidą - nenurodytas veiksmas!" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ message: "Įvyko klaida: " + String(error) }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
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
