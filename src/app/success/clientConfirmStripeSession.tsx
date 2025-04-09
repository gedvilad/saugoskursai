// app/success/ClientConfirmStripeSession.tsx
"use client";

import { useAuth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { triggerStripeSyncForUser } from "~/backend/subscriptions/actions/updateSubTier";
import { useEffect, useState } from "react";
import { updateBoughtCourses } from "~/backend/subscriptions/updateBoughtCourses";

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
    let timeoutId: NodeJS.Timeout;
    async function syncStripe() {
      setSyncing(true);

      const minLoadingTime = 3000;

      // Create a promise that resolves after the minimum loading time
      const minTimePromise = new Promise<void>((resolve) => {
        timeoutId = setTimeout(() => {
          resolve();
        }, minLoadingTime);
      });

      // Await both the Stripe sync and the minimum time
      await Promise.all([
        tryCatch(triggerStripeSyncForUser(userId ?? "")),
        //tryCatch(updateBoughtCourses(userId ?? "")),
        minTimePromise,
      ]);

      clearTimeout(timeoutId); // Clear the timeout if the sync finished before

      setSyncing(false);

      redirect("/");
    }

    void syncStripe();
  }, [userId, isSignedIn, isLoaded]);

  if (!isLoaded) {
    return <LoadingScreen message="Mokėjimas apdorojamas" />;
  }

  if (syncing) {
    return <LoadingScreen message="Mokėjimas apdorojamas" />;
  }

  return null; // Don't render anything after syncing. The redirect takes over.
}

function LoadingScreen({ message }: { message: string }) {
  return (
    <div className="flex h-screen flex-col items-center justify-center bg-gray-100">
      <div className="mb-4 text-2xl font-semibold">{message}</div>
      <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
    </div>
  );
}

export default ClientConfirmStripeSession;
