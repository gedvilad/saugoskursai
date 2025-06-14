"use server";
import { db } from "~/server/db";
import { STRIPE_CACHE_KV, STRIPE_CUSTOMER_ID_KV } from "../store";
import stripe from "~/backend/utils/stripe";
import { courses, user_bought_courses } from "~/server/db/schema";
import { and, eq } from "drizzle-orm";
import { syncStripeDataToKV } from "../stripe-sync";
export async function cancelSub(courseId: number, userId: string) {
  let error = "";
  const stripeCustomerId =
    (await STRIPE_CUSTOMER_ID_KV.get(userId)) ?? undefined;
  if (!stripeCustomerId) {
    error =
      "Neleistinas veiksmas! Jei manote, kad įvyko klaida, prašome susisiekti su mumis.";
    return error;
  }
  const course = await db
    .select()
    .from(courses)
    .where(eq(courses.id, courseId))
    .limit(1);
  if (!course) {
    error = "Prenumerata su tokiu kursu nerasta.";
    return error;
  }
  const userAllSubs = await STRIPE_CACHE_KV.get(stripeCustomerId);
  if ("subscriptions" in userAllSubs) {
    const matchingSub = userAllSubs.subscriptions.find(
      (sub) => sub.productId === course[0]?.productId,
    );

    if (!matchingSub) {
      error = "Nerasta prenumerata šiam kursui.";
      return error;
    }

    try {
      const subscription = await stripe.subscriptions.retrieve(
        matchingSub.subscriptionId!,
      );
      if (subscription.status !== "active") {
        error = "Prenumerata nėra aktyvi.";
        return error;
      }
      if (subscription.metadata?.userId !== userId) {
        error =
          "Negalimas veiksmas! Jei manote, kad įvyko klaida, prašome susisiekti su mumis.";
        return error;
      }
      const canceledSubscription = await stripe.subscriptions.update(
        matchingSub.subscriptionId!,
        {
          cancel_at_period_end: true,
          metadata: {
            ...subscription.metadata,
            canceled_at: new Date().toISOString(),
            canceled_by: userId,
          },
        },
      );
      const periodEndDate = new Date(
        canceledSubscription.current_period_end * 1000,
      );
      await syncStripeDataToKV(stripeCustomerId);
      /*await db
        .update(user_bought_courses)
        .set({
          status: "Atšaukta",
          endTime: periodEndDate,
        })
        .where(
          and(
            eq(user_bought_courses.userId, userId),
            eq(user_bought_courses.courseId, courseId),
          ),
        );*/

      return periodEndDate;
    } catch (errorr) {
      console.error("Error retrieving subscription:", errorr);
      error = "Įvyko klaida. Bandykite dar kartą.";
      return error;
    }
  } else {
    error = "Jūs neturite aktyvių prenumeratų.";
    return error;
  }
}
