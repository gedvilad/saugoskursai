import { db } from "~/server/db";
import { groups, notifications, userGroups, users } from "~/server/db/schema";
import { and, eq } from "drizzle-orm";
interface CreateUserRequest {
  clerkId: string;
  groupId: number;
}
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      action: string;
      clerkId: string;
      groupId: number;
    };

    if (body.action === "refuseInvite") {
      if (!body.clerkId || !body.groupId) {
        return new Response(
          JSON.stringify({
            message: "Trūksta privalomų reikšmių (grupės id, vartotojo id)",
          }),
          { status: 400, headers: { "Content-Type": "application/json" } },
        );
      }

      const group = await db.query.groups.findFirst({
        where: eq(groups.id, body.groupId),
      });

      if (!group) {
        return new Response(JSON.stringify({ message: "Grupė nerasta" }), {
          status: 409,
          headers: { "Content-Type": "application/json" },
        });
      }

      await db
        .delete(userGroups)
        .where(
          and(
            eq(userGroups.userId, body.clerkId),
            eq(userGroups.groupId, body.groupId),
          ),
        );

      return new Response(
        JSON.stringify({ message: "Kvietimas sėkmingai atmestas" }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    }

    if (body.action === "acceptInvite") {
      if (!body.clerkId || !body.groupId) {
        return new Response(
          JSON.stringify({
            message: "Trūksta privalomų reikšmių (grupės id, vartotojo id)",
          }),
          { status: 400, headers: { "Content-Type": "application/json" } },
        );
      }

      const group = await db.query.groups.findFirst({
        where: eq(groups.id, body.groupId),
      });

      if (!group) {
        return new Response(JSON.stringify({ message: "Grupė nerasta" }), {
          status: 409,
          headers: { "Content-Type": "application/json" },
        });
      }

      await db
        .update(userGroups)
        .set({
          role: "Narys",
        })
        .where(
          and(
            eq(userGroups.userId, body.clerkId),
            eq(userGroups.groupId, body.groupId),
          ),
        );

      return new Response(
        JSON.stringify({ message: "Kvietimas sėkmingai priimtas" }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    }

    if (body.action === "addUser") {
      if (!body.clerkId || !body.groupId) {
        return new Response(
          JSON.stringify({
            message: "Trūksta privalomų reikšmių (grupės id, vartotojo id)",
          }),
          { status: 400, headers: { "Content-Type": "application/json" } },
        );
      }

      const group = await db.query.groups.findFirst({
        where: eq(groups.id, body.groupId),
      });

      if (!group) {
        return new Response(JSON.stringify({ message: "Grupė nerasta" }), {
          status: 409,
          headers: { "Content-Type": "application/json" },
        });
      }

      const existingUserGroup = await db.query.userGroups.findFirst({
        where: and(
          eq(userGroups.userId, body.clerkId),
          eq(userGroups.groupId, body.groupId),
        ),
      });

      if (existingUserGroup) {
        return new Response(
          JSON.stringify({ message: "Vartotojas jau yra grupėje" }),
          { status: 409, headers: { "Content-Type": "application/json" } },
        );
      }

      await db.insert(notifications).values({
        userId: body.clerkId,
        message: `Jūs buvote pakviestas į grupę ${group.name}`,
        createdAt: new Date(),
      });

      await db.insert(userGroups).values({
        userId: body.clerkId,
        groupId: body.groupId,
        role: "Pakviestas",
        createdAt: new Date(),
      });
      //-----------------------------------------------------------------------------

      return new Response(
        JSON.stringify({ message: "Vartotojas sėkmingai pakviestas" }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    }
    if (body.action === "removeUser") {
      if (!body.clerkId || !body.groupId) {
        return new Response(
          JSON.stringify({
            message: "Trūksta privalomų reikšmių (grupės id, vartotojo id)",
          }),
          { status: 400, headers: { "Content-Type": "application/json" } },
        );
      }

      const group = await db.query.groups.findFirst({
        where: eq(groups.id, body.groupId),
      });

      if (!group) {
        return new Response(JSON.stringify({ message: "Grupė nerasta" }), {
          status: 409,
          headers: { "Content-Type": "application/json" },
        });
      }

      const existingUserGroup = await db.query.userGroups.findFirst({
        where: and(
          eq(userGroups.userId, body.clerkId),
          eq(userGroups.groupId, body.groupId),
        ),
      });

      if (!existingUserGroup) {
        return new Response(
          JSON.stringify({ message: "Vartotojas nėra grupėje" }),
          { status: 409, headers: { "Content-Type": "application/json" } },
        );
      }

      await db
        .delete(userGroups)
        .where(
          and(
            eq(userGroups.userId, body.clerkId),
            eq(userGroups.groupId, body.groupId),
          ),
        );
      //-----------------------------------------------------------------------------

      return new Response(
        JSON.stringify({ message: "Vartotojas sėkmingai pašalintas" }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    }
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
