"use server";

import { auth } from "@clerk/nextjs/server";
import { STRIPE_CUSTOMER_ID_KV } from "../store";
import { syncStripeDataToKV } from "../stripe-sync";

export async function triggerStripeSyncForUser() {
  const user = await auth();
  console.log("USERID: ", user);
  if (!user.userId) return;

  const stripeCustomerId = await STRIPE_CUSTOMER_ID_KV.get(user.userId);
  if (!stripeCustomerId) return;

  return await syncStripeDataToKV(stripeCustomerId);
}
