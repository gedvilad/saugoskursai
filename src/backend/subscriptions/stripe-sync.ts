/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/non-nullable-type-assertion-style */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import { STRIPE_CACHE_KV, STRIPE_SUB_CACHE } from "./store";
import stripe from "../utils/stripe";

export async function syncStripeDataToKV(customerId: string) {
  // Fetch latest subscription data from Stripe

  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    limit: 3,
    status: "active",
    expand: ["data.default_payment_method"],
  });
  if (subscriptions.data.length === 0) {
    await STRIPE_CACHE_KV.set(customerId, { status: "none" });
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

  const cacheData: STRIPE_SUB_CACHE = { subscriptions: subDataArray };
  await STRIPE_CACHE_KV.set(customerId, cacheData);
  //await STRIPE_CACHE_KV.set(customerId, subDataArray);

  return subDataArray;
}
