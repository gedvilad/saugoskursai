"use server";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getStripeSubByUserId, STRIPE_CUSTOMER_ID_KV } from "../store";
import stripe from "~/backend/utils/stripe";
import { getUserByClerkId } from "~/server/user-queries";
import toast from "react-hot-toast";

export async function createCheckoutSession() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/");
  }

  const existingSub = await getStripeSubByUserId(userId);
  if (existingSub?.status === "active") {
    throw new Error("You already have an active subscription");
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

  let session;
  try {
    session = await stripe.checkout.sessions.create({
      line_items: [{ price: process.env.STRIPE_PRICE_ID_1, quantity: 1 }],
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
