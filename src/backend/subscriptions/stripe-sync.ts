/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/non-nullable-type-assertion-style */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import { STRIPE_CACHE_KV } from "./store";
import stripe from "../utils/stripe";

export async function syncStripeDataToKV(customerId: string) {
  // Fetch latest subscription data from Stripe

  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    limit: 1,
    status: "all",
    expand: ["data.default_payment_method"],
  });
  if (subscriptions.data.length === 0) {
    await STRIPE_CACHE_KV.set(customerId, { status: "none" });
    return { status: "none" };
  }

  // If a user can have multiple subscriptions, that's your problem
  const subscription = subscriptions.data[0];
  if (!subscription) return { status: "none" };
  if (!subscription.items.data[0]) return { status: "none" };
  // Store complete subscription state
  const subData = {
    subscriptionId: subscription.id,
    status: subscription.status,
    priceId: subscription.items.data[0].price.id,
    currentPeriodEnd: subscription.current_period_end,
    currentPeriodStart: subscription.current_period_start,
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
    paymentMethod:
      subscription.default_payment_method &&
      typeof subscription.default_payment_method !== "string"
        ? {
            brand: subscription.default_payment_method.card?.brand ?? null,
            last4: subscription.default_payment_method.card?.last4 ?? null,
          }
        : null,
  };

  // Store in Redis (convert object to JSON string)
  await STRIPE_CACHE_KV.set(customerId, subData);

  return subData;
}
