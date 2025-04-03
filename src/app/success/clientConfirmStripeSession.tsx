// app/success/ClientConfirmStripeSession.tsx
"use client";

import { useAuth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { triggerStripeSyncForUser } from "~/backend/subscriptions/actions/updateSubTier";
import { useEffect, useState } from "react";

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

function ClientConfirmStripeSession() {
  const { userId, isSignedIn, isLoaded } = useAuth();
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    if (!isSignedIn) {
      redirect("/");
    }

    async function syncStripe() {
      console.log("Syncing with Stripe...");
      setSyncing(true);
      if (!userId) return;
      const { error } = await tryCatch(triggerStripeSyncForUser(userId));
      setSyncing(false);

      if (error) {
        console.error("Failed to sync with Stripe:", error);
        // Handle error (e.g., display an error message)
      } else {
        redirect("/");
      }
    }

    void syncStripe(); // Mark as explicitly ignored
  }, [userId, isSignedIn, isLoaded]);

  if (!isLoaded) {
    return <div>Loading authentication...</div>;
  }

  if (syncing) {
    return <div>Syncing with Stripe...</div>;
  }

  return <div>Processing...</div>; // Or any other appropriate message
}

export default ClientConfirmStripeSession;
