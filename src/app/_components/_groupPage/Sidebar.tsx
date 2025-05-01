"use client";
import { useEffect, useState } from "react";
import {
  type Group,
  type ErrorResponse,
  type ApiResponseCourses,
  type Course,
} from "./types";
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
  const [isOpen, setIsOpen] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);

  useEffect(() => {
    if (!userId) {
      setTimeout(() => setIsLoadingCourses(true), 500);
      return;
    }
    const fetchUserBoughtCourses = async () => {
      try {
        const res = await fetch(`/api/courses/userCourses?userId=${userId}`);
        const data = (await res.json()) as ApiResponseCourses;
        if (!res.ok) {
          toast.error(data.message);
          return;
        }
        setCourses(data.boughtCourses);
        setTimeout(() => setIsLoadingCourses(true), 500);
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };
    fetchUserBoughtCourses().catch((error) =>
      console.error("Error fetching courses:", error),
    );
  }, [userId]);

  const handleCreateGroup = () => {
    if (courses.length === 0) {
      toast.error(
        "Norint sukurti grupę turite būti nusipirkę bent vieną kursą",
      );
      return;
    }
    if (!isOpen) {
      setIsOpen(true);
    }
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

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };
  const doesHaveGroup = () => {
    return groups.some((element) => element.role === "Administratorius");
  };
  const isUserGroupAdmin = (groupId: number) => {
    return groups.some(
      (element) =>
        element.id === groupId && element.role === "Administratorius",
    );
  };

  return (
    <div className="relative flex min-h-full">
      {/* Main sidebar */}
      <div
        className={`transition-all duration-300 ${isOpen ? "w-96" : "w-12"}`}
      >
        <aside className="h-full border-r border-stone-200 bg-stone-50">
          <div className="h-4 bg-gradient-to-b from-stone-100 to-stone-50"></div>

          {isOpen ? (
            // Expanded sidebar content
            <div className="p-6">
              <h2 className="mb-5 text-lg font-semibold text-stone-800">
                Jūsų grupės
              </h2>
              {isLoadingCourses
                ? null
                : courses.length === 0 &&
                  doesHaveGroup() === true && (
                    <div className="text-sm text-red-600">
                      Neturite aktyvių kursų, todėl negalite naudotis savo
                      grupėmis.
                    </div>
                  )}
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
                        disabled={
                          courses.length === 0 &&
                          isUserGroupAdmin(group.id) === true
                        }
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
          ) : (
            // Collapsed sidebar content
            <div className="flex flex-col items-center p-2 pt-6">
              {!isLoadingGroups &&
                groups.map((group) => (
                  <button
                    key={group.id}
                    className={`mb-2 flex h-8 w-8 items-center justify-center rounded-lg transition duration-200 ${
                      selectedGroup?.id === group.id
                        ? "bg-stone-800 text-white"
                        : "border border-stone-200 bg-white text-stone-800 hover:bg-stone-100"
                    }`}
                    onClick={() => onGroupSelect(group)}
                    title={group.name}
                  >
                    <span className="text-xs font-medium">
                      {group.name.charAt(0).toUpperCase()}
                    </span>
                  </button>
                ))}

              <button
                className="mt-2 flex h-8 w-8 items-center justify-center rounded-lg border border-dashed border-stone-300 bg-white text-stone-600 hover:bg-stone-100 hover:text-stone-800"
                onClick={handleCreateGroup}
                title="Sukurti naują grupę"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="h-4 w-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4.5v15m7.5-7.5h-15"
                  />
                </svg>
              </button>
            </div>
          )}
        </aside>
      </div>

      {/* Toggle button - always visible, outside sidebar */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-8 z-20 flex h-8 w-8 items-center justify-center rounded-r-lg bg-stone-800 text-white transition-all duration-300 hover:bg-stone-700"
        aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="2"
          stroke="currentColor"
          className="h-4 w-4"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d={isOpen ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"}
          />
        </svg>
      </button>
    </div>
  );
}
