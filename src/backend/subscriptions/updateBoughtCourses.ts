"use server";

import {
  getStripeSubByUserId,
  STRIPE_CACHE_KV,
  STRIPE_CUSTOMER_ID_KV,
} from "./store";
import { db } from "~/server/db";
import { eq, and, inArray, sql } from "drizzle-orm";
import { courses, user_bought_courses } from "~/server/db/schema";

export async function updateBoughtCourses(userId: string) {
  /*console.log("Updating bought courses for user", userId);
  const user = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.clerk_id, userId),
  });
  if (!user) {
    return;
  }
  const stripeSub = await getStripeSubByUserId(userId);
  if (!stripeSub) {
    return;
  }

  const customerId = await STRIPE_CUSTOMER_ID_KV.get(userId);
  if (!customerId) {
    return;
  }
  const userSubscriptions = await STRIPE_CACHE_KV.get(customerId);
  if (!("subscriptions" in userSubscriptions)) return;

  const activeProductIds = userSubscriptions.subscriptions
    .map((sub) => sub.productId)
    .filter((pid): pid is string => typeof pid === "string");

  // Fetch courses based on active product IDs
  const subscribedCourses = await db
    .select({
      id: courses.id,
    })
    .from(courses)
    .where(inArray(courses.productId, activeProductIds));

  // Insert the courses that the user doesn't have.
  if (subscribedCourses.length > 0) {
    await db.insert(user_bought_courses).values(
      subscribedCourses.map((course) => ({
        userId: userId,
        courseId: course.id,
      })),
    );
  }

  // Remove courses that are not valid anymore.
  try {
    if (subscribedCourses.length > 0) {
      await db
        .delete(user_bought_courses)
        .where(
          and(
            eq(user_bought_courses.userId, userId),
            sql`${user_bought_courses.courseId} NOT IN ${subscribedCourses.map(
              (course) => course.id,
            )}`,
          ),
        );
    }
  } catch (error) {
    console.error("Error deleting courses:", error); // Added try-catch for delete
  }*/
}
