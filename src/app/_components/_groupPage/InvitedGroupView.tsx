// components/InvitedGroupView.tsx
import toast from "react-hot-toast";
import { type Group, type ErrorResponse } from "./types";

interface InvitedGroupViewProps {
  selectedGroup: Group;
  userId: string | null;
  onGroupAction: () => Promise<void>;
}

export default function InvitedGroupView({
  selectedGroup,
  userId,
  onGroupAction,
}: InvitedGroupViewProps) {
  const handleAcceptInvite = async () => {
    const response = await fetch(`/api/groups/groupUser`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "acceptInvite",
        clerkId: userId,
        groupId: selectedGroup.id,
      }),
    });

    const errorData = (await response.json()) as ErrorResponse;
    if (!response.ok) {
      toast.error(errorData.message);
      return;
    }

    toast.success(errorData.message);
    await onGroupAction();
  };

  const handleRefuseInvite = async () => {
    const response = await fetch(`/api/groups/groupUser`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "refuseInvite",
        clerkId: userId,
        groupId: selectedGroup.id,
      }),
    });

    const errorData = (await response.json()) as ErrorResponse;
    if (!response.ok) {
      toast.error(errorData.message);
      return;
    }

    toast.success(errorData.message);
    await onGroupAction();
  };

  return (
    <div className="flex-1 bg-stone-50/30 bg-gradient-to-b from-stone-100 to-stone-50 p-8">
      <div className="mb-6 border-b border-stone-100 pb-4">
        <h1 className="text-2xl font-bold text-stone-800">
          Grupė: {selectedGroup?.name}
        </h1>
      </div>
      <div className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
        <p className="mb-4 text-stone-700">
          Esate pakviestas į šią grupę! Ar norite priimti kvietimą?
        </p>
        <div className="space-x-3">
          <button
            className="rounded-lg bg-stone-800 px-4 py-2 text-sm text-white transition duration-200 hover:bg-stone-700"
            onClick={handleAcceptInvite}
          >
            Priimti
          </button>
          <button
            className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm text-stone-700 transition duration-200 hover:bg-stone-100"
            onClick={handleRefuseInvite}
          >
            Atmesti
          </button>
        </div>
      </div>
    </div>
  );
}
