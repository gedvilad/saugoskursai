import redis from "../utils/redis";
import Stripe from "stripe";

/*export type STRIPE_SUB_CACHE =
  | {
      subscriptionId: string | null;
      status: Stripe.Subscription.Status;
      priceId: string | null;
      currentPeriodStart: number | null;
      currentPeriodEnd: number | null;
      cancelAtPeriodEnd: boolean;
      paymentMethod: {
        brand: string | null; // e.g., "visa", "mastercard"
        last4: string | null; // e.g., "4242"
      } | null;
    }
  | {
      status: "none";
    };*/
export type STRIPE_SUB_CACHE =
  | {
      subscriptions: {
        subscriptionId: string | null;
        status: Stripe.Subscription.Status;
        priceId: string | null | undefined;
        productId: string | null | undefined;
        currentPeriodStart: number | null;
        currentPeriodEnd: number | null;
        cancelAtPeriodEnd: boolean;
        paymentMethod: {
          brand: string | null;
          last4: string | null;
        } | null;
      }[];
    }
  | { status: "none" };

export const STRIPE_CACHE_KV = {
  generateKey(stripeCustomerId: string) {
    return `stripe:customer:${stripeCustomerId}:sub-status`;
  },
  async get(stripeCustomerId: string): Promise<STRIPE_SUB_CACHE> {
    const response = await redis.get(this.generateKey(stripeCustomerId));

    if (!response) return { status: "none" };

    return JSON.parse(response) as STRIPE_SUB_CACHE;
  },
  async set(stripeCustomerId: string, status: STRIPE_SUB_CACHE) {
    await redis.set(this.generateKey(stripeCustomerId), JSON.stringify(status));
  },
};

export const STRIPE_CUSTOMER_ID_KV = {
  generateKey(userId: string) {
    return `user:${userId}:stripe-customer-id`;
  },
  async get(userId: string) {
    return await redis.get(this.generateKey(userId));
  },
  async set(userId: string, customerId: string) {
    await redis.set(this.generateKey(userId), customerId);
  },
  async getUserId(customerId: string): Promise<string | null> {
    // Iterate through all keys in Redis (This is generally NOT recommended for large datasets)
    // A better approach might be to maintain a separate index if performance is critical
    const keys = await redis.keys("user:*:stripe-customer-id");

    for (const key of keys) {
      const userId = key.split(":")[1]; // Extract userId from the key
      const storedCustomerId = await redis.get(key);

      if (storedCustomerId === customerId && userId) {
        return userId;
      }
    }

    return null; // Customer ID not found
  },
};

export async function getStripeSubByUserId(userId: string) {
  const stripeCustomerId = await STRIPE_CUSTOMER_ID_KV.get(userId);
  if (!stripeCustomerId) return null;
  return await STRIPE_CACHE_KV.get(stripeCustomerId);
}
