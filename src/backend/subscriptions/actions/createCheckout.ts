"use server";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getStripeSubByUserId, STRIPE_CUSTOMER_ID_KV } from "../store";
import stripe from "~/backend/utils/stripe";
import { getUserByClerkId } from "~/server/user-queries";
import toast from "react-hot-toast";
import { db } from "~/server/db";
import { courses } from "~/server/db/schema";
import { eq } from "drizzle-orm";

export async function createCheckoutSession(productID: string) {
  const { userId } = await auth();
  if (!userId) {
    redirect("/");
  }

  const existingSub = await getStripeSubByUserId(userId);
  if (existingSub) {
    if ("subscriptions" in existingSub) {
      const hasExistingProductSub = existingSub.subscriptions.some(
        (sub) => sub.productId === productID,
      );

      if (hasExistingProductSub) {
        const error = "Jau turite prenumeratą šiam produktui.";
        return error;
      }
    }
  }

  let stripeCustomerId = (await STRIPE_CUSTOMER_ID_KV.get(userId)) ?? undefined;
  const user = await getUserByClerkId(userId);
  if (!stripeCustomerId) {
    const newCustomer = await stripe.customers.create({
      email: user?.email,
      metadata: {
        userId: userId,
      },
    });

    await STRIPE_CUSTOMER_ID_KV.set(userId, newCustomer.id);
    stripeCustomerId = newCustomer.id;
  }

  const stripePriceNr = await db
    .select({
      stripePriceNr: courses.productPriceNr,
    })
    .from(courses)
    .where(eq(courses.productId, productID))
    .limit(1);
  let priceId;
  if (stripePriceNr[0]?.stripePriceNr === 1) {
    priceId = process.env.STRIPE_PRICE_ID_1;
  }
  if (stripePriceNr[0]?.stripePriceNr === 2) {
    priceId = process.env.STRIPE_PRICE_ID_2;
  }
  if (stripePriceNr[0]?.stripePriceNr === 3) {
    priceId = process.env.STRIPE_PRICE_ID_3;
  }
  let session;
  try {
    session = await stripe.checkout.sessions.create({
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      success_url: `http://localhost:3000/success?userId=${userId}`,
      cancel_url: "http://localhost:3000/",
      subscription_data: {
        metadata: {
          userId: userId,
        },
      },
      customer: stripeCustomerId,
      allow_promotion_codes: true,
    });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    throw new Error(
      "Failed to create checkout session. Please refresh and try again.",
    );
  }
  redirect(session.url!);
}
