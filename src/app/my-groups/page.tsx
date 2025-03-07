/* eslint-disable @typescript-eslint/no-unsafe-argument */
"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Message from "../_components/message";
interface Group {
  id: number;
  name: string;
  createdAt: string;
  role: string;
}
interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  clerk_id: string;
}
interface ApiResponse {
  groups: { id: number; name: string; createdAt: string; role: string }[];
}
interface ApiResponseUsers {
  users: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    clerk_id: string;
  }[];
}

export default function Home() {
  const router = useRouter();
  const { userId } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [activeTab, setActiveTab] = useState("users");
  const [newGroupName, setNewGroupName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showUserList, setShowUserList] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await fetch(`/api/groups?userId=${userId}`);
        const data = (await res.json()) as ApiResponse;
        if (data.groups && data.groups.length > 0) {
          setGroups(data.groups);
          setSelectedGroup(data.groups[0]!);
          await fetchUsers(data.groups[0]!.id);
        }
      } catch (error) {
        console.error("Request failed:", error);
      }
    };
    const fetchAllUsers = async () => {
      try {
        const res = await fetch("/api/users");
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = (await res.json()) as ApiResponseUsers;
        setAllUsers(data.users);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchGroups().catch((error) =>
      console.error("Error fetching groups:", error),
    );
    fetchAllUsers().catch((error) =>
      console.error("Error fetching all users:", error),
    );
  }, [userId]);

  const handleCreateGroup = () => {
    setIsCreating(true);
  };

  const handleSaveGroup = async () => {
    if (newGroupName.trim() === "") {
      alert("Group name cannot be empty.");
      return;
    }

    await fetch("/api/groups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newGroupName, ownerId: userId }),
    });
    const res = await fetch(`/api/groups?userId=${userId}`);
    const data = (await res.json()) as ApiResponse;

    setGroups(data.groups);
    setSelectedGroup(data.groups[0]!);
    setIsCreating(false);
    setNewGroupName("");
  };

  const handleCancelCreate = () => {
    setIsCreating(false);
    setNewGroupName("");
  };
  const fetchUsers = async (groupId: number) => {
    try {
      const res = await fetch(`/api/groups?groupId=${groupId}`);
      if (!res.ok) throw new Error("Failed to fetch users");

      const data = (await res.json()) as ApiResponseUsers;
      setUsers(data.users);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };
  const handleGroupSelect = async (group: Group) => {
    setSelectedGroup(group);
    try {
      await fetchUsers(group.id);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };
  const handleAddUser = async () => {
    // Adding the user to the group
    await fetch(`/api/groups/addUser`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clerkId: selectedUser?.clerk_id,
        groupId: selectedGroup?.id,
      }),
    });

    await fetchUsers(selectedGroup!.id);
    setSelectedUser(null);
    setSearchTerm("");
    setMessage({
      type: "error",
      text: "Vartotojas jau yra grupėje.",
    });
  };

  const filteredUsers = allUsers.filter((user) =>
    `${user.first_name} ${user.last_name}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase()),
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setShowUserList(e.target.value.length > 0);
    setSelectedUser(null); // Clear selected user when search changes
  };

  const handleSelectUser = (user: User) => {
    setSearchTerm(`${user.first_name} ${user.last_name}`); // Set the search term to the user's name
    setSelectedUser(user); // Store the selected user
    setShowUserList(false); // Hide the dropdown
  };

  return (
    <div className="flex h-screen">
      {message && <Message type={message.type} message={message.text} />}
      {/* Sidebar */}

      <aside className="w-1/4 border-r bg-gray-100 p-4">
        <h2 className="mb-4 text-lg font-semibold">Jūsų grupės</h2>
        <div className="space-y-2">
          {groups.map((group) => (
            <button
              key={group.id}
              className={`flex w-full items-center justify-between rounded-md p-2 text-left ${
                selectedGroup?.id === group.id
                  ? "bg-blue-500 text-white"
                  : "border bg-white"
              }`}
              onClick={() => handleGroupSelect(group)}
            >
              <span className="font-semibold">{group.name}</span>
              <span className="text-sm text-gray-300">{group.role}</span>
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
                  Sukurti
                </button>
                <button
                  className="rounded-md bg-gray-300 p-2"
                  onClick={handleCancelCreate}
                >
                  Atšaukti
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
              Sukurti naują grupę
            </button>
          )}
        </div>
      </aside>

      {/* Main Panel */}
      <main className="flex-1 p-6">
        <h1 className="mb-4 text-xl font-bold">Grupė: {selectedGroup?.name}</h1>

        {/* Tabs */}
        <div className="mb-4 flex space-x-4 border-b">
          {[
            { key: "users", label: "Grupės nariai" },
            { key: "settings", label: "Nustatymai" },
            { key: "analytics", label: "Statistika" },
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
        {/* Users List */}
        {activeTab === "users" && (
          <div>
            <div className="mb-4 flex gap-2">
              {/* Input */}
              <input
                type="text"
                placeholder="Ieškoti vartotojų..."
                className="w-1/4 rounded-md border border-gray-300 p-1 text-xs shadow-sm transition duration-200 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={searchTerm}
                onChange={handleSearchChange}
              />

              {/* Add User Button */}
              <button
                onClick={handleAddUser}
                disabled={!selectedUser}
                className={`rounded-md px-3 py-1 text-xs text-white transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  selectedUser
                    ? "bg-blue-500 hover:bg-blue-600"
                    : "cursor-not-allowed bg-gray-400"
                }`}
              >
                Pridėti
              </button>
            </div>
            {/* Dropdown List */}
            {showUserList && (
              <div className="absolute w-1/4 rounded-md border bg-white shadow-lg">
                {filteredUsers.length > 0 ? (
                  <ul className="max-h-48 overflow-y-auto py-1 text-sm">
                    {filteredUsers.map((user) => (
                      <li
                        key={user.id}
                        className="cursor-pointer px-4 py-2 hover:bg-gray-100"
                        onClick={() => handleSelectUser(user)}
                      >
                        {user.first_name} {user.last_name} ({user.email})
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="px-4 py-2 text-sm text-gray-500">
                    Nerasta jokių vartotojų.
                  </div>
                )}
              </div>
            )}

            <div className="rounded-md border bg-white p-4">
              <h2 className="mb-4 text-lg font-semibold">Grupės nariai:</h2>
              {users.length > 0 ? (
                <ul className="space-y-2">
                  {users.map((user) => (
                    <li key={user.id} className="border-b p-2">
                      {user.first_name} {user.last_name} ({user.email})
                    </li>
                  ))}
                </ul>
              ) : (
                <p>Loading ...</p>
              )}
            </div>
          </div>
        )}
        {activeTab === "settings" && <div>Settings panel...</div>}
        {activeTab === "analytics" && <div>Analytics dashboard...</div>}
      </main>
    </div>
  );
}
