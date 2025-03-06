/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { db } from "~/server/db"; // Your database connection setup
import { users } from "~/server/db/schema"; // Your Drizzle schema
import { eq } from "drizzle-orm"; // Drizzle ORM comparison operator
import { getUserByClerkId } from "~/server/db/user-queries";

interface UserJSON {
  type: "user";
  id: string;
  email_addresses: string[];
  first_name: string;
  last_name: string;
}

export async function POST(req: Request) {
  const SIGNING_SECRET = process.env.SIGNING_SECRET;

  if (!SIGNING_SECRET) {
    throw new Error(
      "Error: Please add SIGNING_SECRET from Clerk Dashboard to .env or .env.local",
    );
  }

  // Create new Svix instance with secret
  const wh = new Webhook(SIGNING_SECRET);

  // Get headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error: Missing Svix headers", {
      status: 400,
    });
  }

  // Get body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  let evt: WebhookEvent;

  // Verify payload with headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error: Could not verify webhook:", err);
    return new Response("Error: Verification error", {
      status: 400,
    });
  }

  // Assuming each item in email_addresses is an object with an `email_address` property
  const { id, email_addresses, first_name, last_name } =
    evt.data as unknown as {
      email_addresses: { email_address: string }[];
      id: string;
      first_name: string;
      last_name: string;
    };

  // Safely access the first email address
  const email = email_addresses?.[0]?.email_address ?? "";

  // Check if the user already exists in the Neon database
  const existingUser = await getUserByClerkId(id);

  if (!existingUser) {
    await db.insert(users).values({
      clerk_id: id,
      email,
      first_name,
      last_name,
      createdAt: new Date(),
    });

    console.log(`User with ID ${id} created successfully.`);
  } else {
    console.log(`User with ID ${id} already exists.`);
  }

  return new Response("Webhook received and user processed", { status: 200 });
}
