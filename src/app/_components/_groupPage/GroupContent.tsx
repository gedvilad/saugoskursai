// components/GroupContent.tsx
import { useState } from "react";
import { type Group, type Course } from "./types";
import UsersTab from "../_groupPage/_tabs/UsersTab";
import SettingsTab from "../_groupPage/_tabs/SettingsTab";
import CoursesTab from "../_groupPage/_tabs/CoursesTab";
import CourseResultsTab from "./_tabs/ResultTab";
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

  return (
    <main className="flex-1 overflow-y-auto bg-stone-50/30 p-8">
      <div className="mb-6 border-b border-stone-100 pb-4">
        <h1 className="text-2xl font-bold text-stone-800">
          Grupė: {selectedGroup?.name}
        </h1>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="flex space-x-1 rounded-lg bg-stone-100 p-1">
          {[
            { key: "users", label: "Grupės nariai" },
            { key: "settings", label: "Nustatymai" },
            { key: "courses", label: "Priskirti kursus" },
            { key: "results", label: "Kursų rezultatai" },
          ].map((tab) => (
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

      {/* Tab Content */}
      <div className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
        {activeTab === "users" && (
          <UsersTab selectedGroup={selectedGroup} userId={userId} />
        )}

        {activeTab === "settings" && (
          <SettingsTab
            selectedGroup={selectedGroup}
            onDelete={onGroupsChange}
          />
        )}

        {activeTab === "courses" && (
          <CoursesTab
            selectedGroup={selectedGroup}
            userId={userId}
            courses={courses}
          />
        )}
        {activeTab === "results" && (
          <ResultTab selectedGroup={selectedGroup} courses={courses} />
        )}
      </div>
    </main>
  );
}
