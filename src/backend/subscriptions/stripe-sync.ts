/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/non-nullable-type-assertion-style */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import {
  STRIPE_CACHE_KV,
  STRIPE_CUSTOMER_ID_KV,
  STRIPE_SUB_CACHE,
} from "./store";
import stripe from "../utils/stripe";
import { courses, user_bought_courses } from "~/server/db/schema";
import { db } from "~/server/db";
import { and, eq, inArray } from "drizzle-orm";

export async function syncStripeDataToKV(customerId: string) {
  // Fetch latest subscription data from Stripe

  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    limit: 2,
    status: "active",
    expand: ["data.default_payment_method"],
  });
  if (subscriptions.data.length === 0) {
    await STRIPE_CACHE_KV.set(customerId, { status: "none" });
    const userId = await STRIPE_CUSTOMER_ID_KV.getUserId(customerId);
    if (!userId) {
      throw new Error(`No user ID found for customer ID: ${customerId}`);
    }
    await db
      .delete(user_bought_courses)
      .where(eq(user_bought_courses.userId, userId));
    return { status: "none" };
  }
  const subDataArray = subscriptions.data
    .filter((sub) => sub.items.data.length > 0)
    .map((sub) => ({
      subscriptionId: sub.id,
      status: sub.status,
      priceId: sub.items.data[0]?.price.id,
      productId: sub.items.data[0]?.price.product as string,
      currentPeriodStart: sub.current_period_start,
      currentPeriodEnd: sub.current_period_end,
      cancelAtPeriodEnd: sub.cancel_at_period_end,
      paymentMethod:
        sub.default_payment_method &&
        typeof sub.default_payment_method !== "string"
          ? {
              brand: sub.default_payment_method.card?.brand ?? null,
              last4: sub.default_payment_method.card?.last4 ?? null,
            }
          : null,
    }));
  console.log("[STRIPE][subDataArray]", subDataArray);
  const cacheData: STRIPE_SUB_CACHE = { subscriptions: subDataArray };
  await STRIPE_CACHE_KV.set(customerId, cacheData);
  await updateUserBoughtCourses(customerId, subDataArray);
  return subDataArray;
}
interface subData {
  subscriptionId: string;
  status: string;
  priceId: string | undefined;
  productId: string;
  currentPeriodStart: number;
  currentPeriodEnd: number;
  cancelAtPeriodEnd: boolean;
  paymentMethod: {
    brand: string | null;
    last4: string | null;
  } | null;
}
async function updateUserBoughtCourses(
  customerId: string,
  subscriptions: subData[],
) {
  const userId = await STRIPE_CUSTOMER_ID_KV.getUserId(customerId);
  if (!userId) {
    throw new Error(`No user ID found for customer ID: ${customerId}`);
  }
  const productIds = [...new Set(subscriptions.map((sub) => sub.productId))];
  console.log("[STRIPE][productIds]", productIds);

  //DELETE ALL BOUGHT COURSES
  const deletedOldBoughtCourses = await db
    .delete(user_bought_courses)
    .where(eq(user_bought_courses.userId, userId));
  console.log("[STRIPE][deletedOldBoughtCourses]", deletedOldBoughtCourses);

  const matchedCourses = await db
    .select()
    .from(courses)
    .where(inArray(courses.productId, productIds));
  console.log("[STRIPE][matchedCourses]", matchedCourses);
  const newCourseIds = matchedCourses.map((course) => course.id);
  console.log("[STRIPE][newCourseIds]", newCourseIds);
  const currentCourses = await db
    .select({ courseId: user_bought_courses.courseId })
    .from(user_bought_courses)
    .where(eq(user_bought_courses.userId, userId));
  console.log("[STRIPE][currentCourses]", currentCourses);
  const currentCourseIds = new Set(currentCourses.map((c) => c.courseId));
  console.log("[STRIPE][currentCourseIds]", currentCourseIds);
  // Determine which to insert (new purchases)
  const coursesToInsert = newCourseIds.filter(
    (id) => !currentCourseIds.has(id),
  );
  console.log("[STRIPE][coursesToInsert]", coursesToInsert);
  // Determine which to delete (no longer subscribed)
  const newCourseIdSet = new Set(newCourseIds);
  console.log("[STRIPE][newCourseIdSet]", newCourseIdSet);
  const coursesToDelete = [...currentCourseIds].filter(
    (id) => !newCourseIdSet.has(id),
  );
  console.log("[STRIPE][coursesToDelete]", coursesToDelete);
  // Insert only new courses
  if (coursesToInsert.length > 0) {
    const uniqueCourseIds = [...new Set(coursesToInsert)];
    const insertValues = uniqueCourseIds.map((courseId) => ({
      userId,
      courseId,
    }));
    const insertedCourses = await db
      .insert(user_bought_courses)
      .values(insertValues);
    console.log("[STRIPE][insertedCourses]", insertedCourses);
  }

  // Delete only outdated courses
  if (coursesToDelete.length > 0) {
    const deletedCourses = await db
      .delete(user_bought_courses)
      .where(
        and(
          eq(user_bought_courses.userId, userId),
          inArray(user_bought_courses.courseId, coursesToDelete),
        ),
      );
    console.log("[STRIPE][deletedCourses]", deletedCourses);
  }
}
