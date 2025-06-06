/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/non-nullable-type-assertion-style */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import Stripe from "stripe";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { waitUntil } from "@vercel/functions";
import { syncStripeDataToKV } from "~/backend/subscriptions/stripe-sync";

const allowedEvents: Stripe.Event.Type[] = [
  //"checkout.session.completed",
  //"customer.subscription.created",
  //"customer.subscription.updated",
  "customer.subscription.deleted",
  //"customer.subscription.paused",
  //"customer.subscription.resumed",
  //"customer.subscription.pending_update_applied",
  //"customer.subscription.pending_update_expired",
  //"customer.subscription.trial_will_end",
  //"invoice.paid",
  //"invoice.payment_failed",
  //"invoice.payment_action_required",
  //"invoice.upcoming",
  //"invoice.marked_uncollectible",
  //"invoice.payment_succeeded",
  //"payment_intent.succeeded",
  //"payment_intent.payment_failed",
  //"payment_intent.canceled",
];
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-02-24.acacia",
});

export const config = {
  api: {
    bodyParser: false,
  },
};
async function processEvent(event: Stripe.Event) {
  console.log(event.type);
  if (!allowedEvents.includes(event.type)) return;

  const { customer: customerId } = event?.data?.object as {
    customer: string;
  };

  if (typeof customerId !== "string") {
    throw new Error(
      `[STRIPE HOOK][CANCER] ID isn't string.\nEvent type: ${event.type}`,
    );
  }

  return await syncStripeDataToKV(customerId);
}
export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get("Stripe-Signature");
  if (!signature) return NextResponse.json({}, { status: 400 });

  async function doEventProcessing() {
    if (typeof signature !== "string") {
      throw new Error("[STRIPE HOOK] Header isn't a string???");
    }

    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );

    waitUntil(processEvent(event));
  }

  const { error } = await tryCatch(doEventProcessing());

  if (error) {
    console.error("[STRIPE HOOK] Error processing event", error);
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
type Success<T> = {
  data: T;
  error: null;
};

type Failure<E> = {
  data: null;
  error: E;
};

type Result<T, E = Error> = Success<T> | Failure<E>;
async function tryCatch<T, E = Error>(
  promise: Promise<T>,
): Promise<Result<T, E>> {
  try {
    const data = await promise;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error as E };
  }
}
