/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import "server-only";
import { db } from "~/server/db";
import { groups, users } from "./db/schema";
import { eq } from "drizzle-orm";
import { group } from "console";

export async function createGroup(name: string, ownerId: string) {
  await db.insert(groups).values({
    name,
    ownerId,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}
export async function deleteGroup(groupId: number) {
  await db.delete(groups).where(eq(groups.id, groupId));
}
