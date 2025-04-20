import React from "react";

interface DeleteConfirmationModalProps {
  title: string;
  description: string;
  onCancel: () => void;
  onConfirm: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
}

export default function DeleteConfirmationModal({
  title,
  description,
  onCancel,
  onConfirm,
  confirmLabel = "Delete",
  cancelLabel = "Atšaukti",
}: DeleteConfirmationModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-lg font-semibold text-stone-800">{title}</h2>
        <p className="text-sm text-stone-600">{description}</p>
        <div className="mt-5 flex justify-end space-x-3">
          <button
            className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm text-stone-700 transition duration-200 hover:bg-stone-100"
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
          <button
            className="rounded-lg bg-red-500 px-4 py-2 text-sm text-white transition duration-200 hover:bg-red-600"
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
