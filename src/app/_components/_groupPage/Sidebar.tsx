"use client";
import { useState } from "react";
import { type Group, type ErrorResponse } from "./types";
import toast from "react-hot-toast";

interface SidebarProps {
  groups: Group[];
  selectedGroup: Group | null;
  isLoadingGroups: boolean;
  userId: string | null;
  onGroupSelect: (group: Group) => void;
  onGroupsChange: () => Promise<void>;
}

export default function Sidebar({
  groups,
  selectedGroup,
  isLoadingGroups,
  userId,
  onGroupSelect,
  onGroupsChange,
}: SidebarProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");

  const handleCreateGroup = () => {
    setIsCreating(true);
  };

  const handleSaveGroup = async () => {
    const response = await fetch("/api/groups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "create",
        name: newGroupName,
        ownerId: userId,
      }),
    });

    const errorData = (await response.json()) as ErrorResponse;
    if (!response.ok) {
      toast.error(errorData.message);
      return;
    }
    toast.success(errorData.message);

    await onGroupsChange();
    setIsCreating(false);
    setNewGroupName("");
  };

  const handleCancelCreate = () => {
    setIsCreating(false);
    setNewGroupName("");
  };

  return (
    <aside className="w-96 border-r border-stone-200 bg-stone-50">
      <div className="h-4 bg-gradient-to-b from-stone-100 to-stone-50"></div>

      <div className="p-6">
        <h2 className="mb-5 text-lg font-semibold text-stone-800">
          Jūsų grupės
        </h2>
        <div className="space-y-3">
          {isLoadingGroups
            ? Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-12 w-full animate-pulse rounded-lg bg-stone-200"
                ></div>
              ))
            : groups.map((group) => (
                <button
                  key={group.id}
                  className={`flex w-full items-center justify-between rounded-lg p-3 text-left transition duration-200 ${
                    selectedGroup?.id === group.id
                      ? "bg-stone-800 text-white"
                      : "border border-stone-200 bg-white text-stone-800 hover:bg-stone-100"
                  }`}
                  onClick={() => onGroupSelect(group)}
                >
                  <span className="font-medium">{group.name}</span>
                  <span
                    className={`text-sm ${selectedGroup?.id === group.id ? "text-stone-300" : "text-stone-500"}`}
                  >
                    {group.role}
                  </span>
                </button>
              ))}

          {isCreating ? (
            <div className="space-y-3 rounded-lg border border-stone-200 bg-white p-3">
              <input
                type="text"
                placeholder="Įveskite naujos grupės pavadinimą"
                className="w-full rounded-lg border border-stone-300 p-2 text-stone-800 focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
              />
              <div className="flex space-x-2">
                <button
                  className="rounded-lg bg-stone-800 px-4 py-2 text-xs text-white transition duration-200 hover:bg-stone-700 focus:outline-none focus:ring-2 focus:ring-stone-500"
                  onClick={handleSaveGroup}
                >
                  Sukurti
                </button>
                <button
                  className="rounded-lg bg-stone-300 px-4 py-2 text-xs text-stone-800 transition duration-200 hover:bg-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-400"
                  onClick={handleCancelCreate}
                >
                  Atšaukti
                </button>
              </div>
            </div>
          ) : (
            <button
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-stone-300 bg-white p-3 text-stone-600 transition duration-200 hover:bg-stone-100 hover:text-stone-800"
              onClick={handleCreateGroup}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="h-5 w-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
              Sukurti naują grupę
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
