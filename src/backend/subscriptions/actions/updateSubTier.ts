"use server";
import { STRIPE_CUSTOMER_ID_KV } from "../store";
import { syncStripeDataToKV } from "../stripe-sync";

export async function triggerStripeSyncForUser(userId: string) {
  const stripeCustomerId = await STRIPE_CUSTOMER_ID_KV.get(userId);
  if (!stripeCustomerId) return;
  return await syncStripeDataToKV(stripeCustomerId);
}
