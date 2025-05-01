// components/tabs/SettingsTab.tsx
import { useState } from "react";
import toast from "react-hot-toast";
import { type Group, type ErrorResponse } from ".././types";
import DeleteConfirmationModal from "../../_modals/DeleteConfirmationModal";

interface SettingsTabProps {
  selectedGroup: Group;
  onDelete: () => Promise<void>;
}

export default function SettingsTab({
  selectedGroup,
  onDelete,
}: SettingsTabProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleGroupDelete = async () => {
    setShowDeleteConfirm(false);

    const response = await fetch("/api/groups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "delete",
        groupId: selectedGroup?.id,
      }),
    });

    const errorData = (await response.json()) as ErrorResponse;
    if (!response.ok) {
      toast.error(errorData.message);
      return;
    }

    toast.success(errorData.message);
    await onDelete();
  };

  return (
    <div className="space-y-6">
      {showDeleteConfirm && (
        <DeleteConfirmationModal
          title="Ar tikrai norite ištrinti grupę?"
          description="Šio veiksmo atkurti negalima."
          onCancel={() => setShowDeleteConfirm(false)}
          onConfirm={handleGroupDelete}
          confirmLabel="Ištrinti"
        />
      )}

      <div className="rounded-lg bg-stone-50 p-6">
        <h3 className="mb-4 text-lg font-medium text-stone-800">
          Grupės nustatymai
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-700">
              Grupės pavadinimas
            </label>
            <input
              type="text"
              value={selectedGroup?.name}
              disabled
              className="mt-1 w-full rounded-lg border border-stone-300 bg-stone-100 p-2 text-stone-800"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700">
              Jūsų rolė
            </label>
            <input
              type="text"
              value={selectedGroup?.role}
              disabled
              className="mt-1 w-full rounded-lg border border-stone-300 bg-stone-100 p-2 text-stone-800"
            />
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-red-100 bg-red-50 p-6">
        <h3 className="mb-2 text-lg font-medium text-red-800">
          Šio veiksmo atkurti negalėsite !
        </h3>
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="rounded-lg bg-white px-4 py-2 text-sm text-red-600 transition duration-200 hover:bg-red-600 hover:text-white"
        >
          Ištrinti grupę
        </button>
      </div>
    </div>
  );
}
