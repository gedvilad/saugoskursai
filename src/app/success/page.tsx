// app/success/page.tsx

import { Suspense } from "react";
import ClientConfirmStripeSession from "./clientConfirmStripeSession";

export const dynamic = "force-dynamic";

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: { session_id: string | undefined };
}) {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <ClientConfirmStripeSession sessionId="asd" />
      </Suspense>
    </div>
  );
}
