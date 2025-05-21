// components/GroupContent.tsx
import { useEffect, useState } from "react";
import { type Group, type Course } from "./types";
import UsersTab from "../_groupPage/_tabs/UsersTab";
import SettingsTab from "../_groupPage/_tabs/SettingsTab";
import CoursesTab from "../_groupPage/_tabs/CoursesTab";
import ResultTab from "./_tabs/ResultTab";

interface GroupContentProps {
  selectedGroup: Group;
  userId: string | null;
  courses: Course[];
  onGroupsChange: () => Promise<void>;
}

export default function GroupContent({
  selectedGroup,
  userId,
  courses,
  onGroupsChange,
}: GroupContentProps) {
  const [activeTab, setActiveTab] = useState("users");
  const [isOwner, setIsOwner] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    if (!selectedGroup) return;
    setIsOwner(selectedGroup.role === "Administratorius");
    setActiveTab("users");
    setIsDropdownOpen(false);
  }, [selectedGroup]);

  const tabs = [
    {
      key: "users",
      label: "Grupės nariai",
      component: <UsersTab selectedGroup={selectedGroup} userId={userId} />,
    },
  ];

  if (isOwner) {
    tabs.push(
      {
        key: "settings",
        label: "Nustatymai",
        component: (
          <SettingsTab
            selectedGroup={selectedGroup}
            onDelete={onGroupsChange}
          />
        ),
      },
      {
        key: "courses",
        label: "Priskirti kursus",
        component: (
          <CoursesTab
            selectedGroup={selectedGroup}
            userId={userId}
            courses={courses}
          />
        ),
      },
      {
        key: "results",
        label: "Kursų rezultatai",
        component: (
          <ResultTab selectedGroup={selectedGroup} courses={courses} />
        ),
      },
    );
  }

  return (
    <main className="ml-8 flex-1 bg-stone-50/30 p-8 md:p-8">
      <div className="mb-4 border-b border-stone-100 pb-3">
        <h1 className="truncate text-xl font-bold text-stone-800 md:text-2xl">
          Grupė: {selectedGroup?.name}
        </h1>
      </div>

      {/* Desktop Tabs */}
      <div className="mb-4 hidden md:block">
        <div className="flex space-x-1 rounded-lg bg-stone-100 p-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-all duration-200 ${
                activeTab === tab.key
                  ? "bg-white text-stone-800 shadow-sm"
                  : "text-stone-600 hover:bg-stone-200 hover:text-stone-800"
              }`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Dropdown */}
      <div className="relative mb-4 md:hidden">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex w-full items-center justify-between rounded-lg bg-stone-100 p-3 text-left text-sm font-medium text-stone-800"
        >
          <span>{tabs.find((tab) => tab.key === activeTab)?.label}</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className={`h-5 w-5 transition-transform ${
              isDropdownOpen ? "rotate-180" : ""
            }`}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 8.25l-7.5 7.5-7.5-7.5"
            />
          </svg>
        </button>

        {isDropdownOpen && (
          <div className="absolute left-0 right-0 z-20 mt-1 rounded-lg border border-stone-200 bg-white py-1 shadow-lg">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                className={`block w-full px-4 py-2 text-left text-sm ${
                  activeTab === tab.key
                    ? "bg-stone-100 font-medium text-stone-800"
                    : "text-stone-600 hover:bg-stone-50"
                }`}
                onClick={() => {
                  setActiveTab(tab.key);
                  setIsDropdownOpen(false);
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Tab Content */}
      <div className="rounded-lg border border-stone-200 bg-white p-3 shadow-sm md:p-6">
        {tabs.find((tab) => tab.key === activeTab)?.component}
      </div>
    </main>
  );
}
