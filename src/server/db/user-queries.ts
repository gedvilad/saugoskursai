/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import "server-only";
import { db } from "~/server/db";
import { users } from "./schema";
export async function getUserByClerkId(id: string) {
  const user = await db.query.users.findFirst({
    where: (usersTable, { eq }) => eq(usersTable.clerk_id, id),
  });

  return user;
}
