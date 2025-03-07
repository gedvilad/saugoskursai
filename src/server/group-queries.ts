import "server-only";
import { db } from "~/server/db";
import { groups, userGroups, users } from "./db/schema";
import { eq } from "drizzle-orm";
import { group } from "console";

export async function createGroup(name: string, ownerId: string) {
  // Step 1: Insert into `groups` and get the new group ID
  const [newGroup] = await db
    .insert(groups)
    .values({
      name,
      ownerId,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning({ id: groups.id }); // Returns the new group ID

  if (!newGroup) throw new Error("Failed to create group");

  await db.insert(userGroups).values({
    groupId: newGroup.id,
    userId: ownerId,
    role: "owner",
    createdAt: new Date(),
  });

  return newGroup;
}

export async function deleteGroup(groupId: number) {
  await db.delete(groups).where(eq(groups.id, groupId));
}

export async function getUserGroups(userId: string) {
  const userGroupData = await db
    .select({
      id: groups.id,
      name: groups.name,
      createdAt: groups.createdAt,
      role: userGroups.role,
    })
    .from(userGroups)
    .innerJoin(groups, eq(userGroups.groupId, groups.id)) // Join groups table
    .where(eq(userGroups.userId, userId));

  return userGroupData;
}
export async function getGroupAllUsers(groupId: number) {
  const userGroupData = await db
    .select({
      id: users.id,
      email: users.email,
      first_name: users.first_name,
      last_name: users.last_name,
    })
    .from(userGroups)
    .innerJoin(users, eq(userGroups.userId, users.clerk_id)) // Join users table
    .where(eq(userGroups.groupId, groupId));

  return userGroupData;
}
