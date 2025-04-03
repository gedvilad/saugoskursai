import { Suspense } from "react";
import ClientConfirmStripeSession from "./clientConfirmStripeSession";

export const dynamic = "force-dynamic";

export default async function SuccessPage() {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <ClientConfirmStripeSession />
      </Suspense>
    </div>
  );
}
