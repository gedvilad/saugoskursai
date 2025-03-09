/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import "server-only";
import { db } from "~/server/db";
import { users } from "./db/schema";
import { eq } from "drizzle-orm";
export async function getUserByClerkId(id: string) {
  const user = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.clerk_id, id),
  });
  return user;
}
export async function createUser(
  email: string,
  first_name: string,
  last_name: string,
  id: string,
) {
  await db.insert(users).values({
    clerk_id: id,
    email,
    first_name,
    last_name,
    createdAt: new Date(),
  });
}
export async function updateUser(
  id: string,
  email: string,
  first_name: string,
  last_name: string,
) {
  await db
    .update(users)
    .set({
      email,
      first_name,
      last_name,
      updatedAt: new Date(),
    })
    .where(eq(users.clerk_id, id));
}
export async function deleteUser(id: string) {
  await db.delete(users).where(eq(users.clerk_id, id));
}
export async function getAllUsers() {
  const allUsers = await db.query.users.findMany();
  return allUsers;
}
