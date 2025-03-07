"use client";
import { useState } from "react";
import { useAuth } from "@clerk/nextjs";

const groups = [
  { id: "1", name: "Developers" },
  { id: "2", name: "Designers" },
  { id: "3", name: "Managers" },
];

export default function Home() {
  const { userId } = useAuth();
  console.log(userId);
  const [selectedGroup, setSelectedGroup] = useState(groups[0]);
  const [activeTab, setActiveTab] = useState("users");
  const [newGroupName, setNewGroupName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateGroup = () => {
    setIsCreating(true);
  };

  const handleSaveGroup = () => {
    // Here you would typically make an API call to create the new group
    // and then update the `groups` state.  For this example, we'll just
    // simulate adding a new group locally.

    // Basic validation (you'd want more robust validation in a real app)
    if (newGroupName.trim() === "") {
      alert("Group name cannot be empty.");
      return;
    }

    const newGroup = {
      id: String(Date.now()), // Generate a unique ID
      name: newGroupName,
    };

    // Update the groups array (in a real app, you'd fetch updated groups)
    // setGroups([...groups, newGroup]); // Assuming you had a groups state

    setIsCreating(false);
    setNewGroupName("");
  };

  const handleCancelCreate = () => {
    setIsCreating(false);
    setNewGroupName("");
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-1/4 border-r bg-gray-100 p-4">
        <h2 className="mb-4 text-lg font-semibold">Jūsų grupės</h2>
        <div className="space-y-2">
          {groups.map((group) => (
            <button
              key={group.id}
              className={`w-full rounded-md p-2 text-left ${
                selectedGroup.id === group.id
                  ? "bg-blue-500 text-white"
                  : "border bg-white"
              }`}
              onClick={() => setSelectedGroup(group)}
            >
              {group.name}
            </button>
          ))}
          {isCreating ? (
            <div className="space-y-2">
              <input
                type="text"
                placeholder="New Group Name"
                className="w-full rounded-md border p-2"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
              />
              <div className="flex space-x-2">
                <button
                  className="rounded-md bg-green-500 p-2 text-white"
                  onClick={handleSaveGroup}
                >
                  Save
                </button>
                <button
                  className="rounded-md bg-gray-300 p-2"
                  onClick={handleCancelCreate}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              className="flex w-full items-center justify-center gap-2 rounded-md border bg-white p-2 text-left"
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
              Add Group
            </button>
          )}
        </div>
      </aside>

      {/* Main Panel */}
      <main className="flex-1 p-6">
        <h1 className="mb-4 text-xl font-bold">
          Managing: {selectedGroup.name}
        </h1>

        {/* Tabs */}
        <div className="mb-4 flex space-x-4 border-b">
          {[
            { key: "users", label: "Users" },
            { key: "settings", label: "Settings" },
            { key: "analytics", label: "Analytics" },
          ].map((tab) => (
            <button
              key={tab.key}
              className={`px-4 py-2 ${
                activeTab === tab.key
                  ? "border-b-2 border-blue-500 text-blue-500"
                  : "text-gray-500"
              }`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="rounded-md border bg-white p-4">
          {activeTab === "users" && <div>List of users goes here...</div>}
          {activeTab === "settings" && <div>Settings panel...</div>}
          {activeTab === "analytics" && <div>Analytics dashboard...</div>}
        </div>
      </main>
    </div>
  );
}
