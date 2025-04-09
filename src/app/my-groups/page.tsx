/* eslint-disable @typescript-eslint/no-unsafe-argument */
"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
export const dynamic = "force-dynamic";
interface Group {
  id: number;
  name: string;
  createdAt: string;
  role: string;
  ownerId: string;
}
interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  clerk_id: string;
  role: string;
}
interface ApiResponse {
  groups: {
    id: number;
    name: string;
    createdAt: string;
    role: string;
    ownerId: string;
  }[];
}
interface ApiResponseUsers {
  users: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    clerk_id: string;
    role: string;
  }[];
}
interface ErrorResponse {
  message: string;
}
interface Course {
  id: number;
  name: string;
}
interface ApiResponseCourses {
  boughtCourses: Course[];
  assignedCourses: Course[];
  message: string;
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
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [isLoadingGroups, setIsLoadingGroups] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showUserDeleteConfirm, setShowUserDeleteConfirm] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [assignedCourses, setAssignedCourses] = useState<Course[]>([]);
  const [selectedUsers2, setSelectedUsers2] = useState<string[]>([]);
  const [filteredUsers2, setFilteredUsers2] = useState<string[]>([]);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await fetch(`/api/groups?userId=${userId}`);
        const data = (await res.json()) as ApiResponse;
        if (data.groups && data.groups.length > 0) {
          setGroups(data.groups);
          setSelectedGroup(data.groups[0]!);
          await fetchUsers(data.groups[0]!.id);
        } else {
          setSelectedGroup(null);
        }
      } catch (error) {
        console.error("Request failed:", error);
      }
    };
    const fetchAllUsers = async () => {
      try {
        setIsLoadingGroups(true);
        const res = await fetch("/api/users");
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = (await res.json()) as ApiResponseUsers;
        setTimeout(() => setIsLoadingGroups(false), 700);
        setAllUsers(data.users);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    const fetchCourses = async () => {
      try {
        const res = await fetch(`/api/courses/userCourses?userId=${userId}`);

        const data = (await res.json()) as ApiResponseCourses;
        if (!res.ok) {
          toast.error(data.message);
          return;
        }
        setCourses(data.boughtCourses);
        setAssignedCourses(data.assignedCourses);
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };
    if (!userId) return;
    fetchGroups().catch((error) =>
      console.error("Error fetching groups:", error),
    );
    fetchAllUsers().catch((error) =>
      console.error("Error fetching all users:", error),
    );
    fetchCourses().catch((error) =>
      console.error("Error fetching courses:", error),
    );
  }, [userId]);

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
    const res = await fetch(`/api/groups?userId=${userId}`);
    const data = (await res.json()) as ApiResponse;

    setGroups(data.groups);
    setSelectedGroup(data.groups[data.groups.length - 1]!);
    setActiveTab("users");
    setIsCreating(false);
    setNewGroupName("");
    await fetchUsers(data.groups[data.groups.length - 1]!.id);
  };

  const handleCancelCreate = () => {
    setIsCreating(false);
    setNewGroupName("");
  };
  const fetchUsers = async (groupId: number) => {
    try {
      setIsLoadingUsers(true);

      const res = await fetch(`/api/groups?groupId=${groupId}`);
      if (!res.ok) throw new Error("Failed to fetch users");

      const data = (await res.json()) as ApiResponseUsers;
      setTimeout(() => setIsLoadingUsers(false), 700);
      setUsers(data.users);
      const filtered = data.users
        .filter((user) => user.role !== "Pakviestas")
        .filter((user) =>
          (user.first_name + " " + user.last_name + " " + user.email)
            .toLowerCase()
            .includes(searchTerm.toLowerCase()),
        )
        .map((user) => user.clerk_id);

      setFilteredUsers2(filtered);
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
    const response = await fetch(`/api/groups/groupUser`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "addUser",
        clerkId: selectedUser!.clerk_id,
        groupId: selectedGroup!.id,
      }),
    });

    const errorData = (await response.json()) as ErrorResponse;
    if (!response.ok) {
      toast.error(errorData.message);
      return;
    }

    toast.success(errorData.message);
    await fetchUsers(selectedGroup!.id);
    setSelectedUser(null);
    setSearchTerm("");
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
  const handleRemoveUser = async (userIdToRemove: string) => {
    setShowUserDeleteConfirm(false);
    setSelectedUser(null);
    if (!selectedGroup) return;

    if (userIdToRemove === userId) {
      toast.error("Negalite pašalinti savęs iš grupės.");
      return;
    }

    const response = await fetch(`/api/groups/groupUser`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "removeUser",
        clerkId: userIdToRemove,
        groupId: selectedGroup.id,
      }),
    });

    const errorData = (await response.json()) as ErrorResponse;
    if (!response.ok) {
      toast.error(errorData.message);
      return;
    }

    toast.success(errorData.message);
    await fetchUsers(selectedGroup.id);
  };

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
    try {
      const res = await fetch(`/api/groups?userId=${userId}`);
      const data = (await res.json()) as ApiResponse;
      if (data.groups && data.groups.length > 0) {
        setGroups(data.groups);
        setSelectedGroup(data.groups[0]!);
        await fetchUsers(data.groups[0]!.id);
      } else {
        setSelectedGroup(null);
        setGroups([]);
      }
    } catch (error) {
      console.error("Request failed:", error);
    }
    setActiveTab("users");
    return;
  };
  const handleAcceptInvite = async () => {
    const response = await fetch(`/api/groups/groupUser`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "acceptInvite",
        clerkId: userId,
        groupId: selectedGroup!.id,
      }),
    });

    const errorData = (await response.json()) as ErrorResponse;
    if (!response.ok) {
      toast.error(errorData.message);
      return;
    }

    toast.success(errorData.message);
    await RefetchGroups();
    //await fetchUsers(selectedGroup!.id);
  };
  const handelRefuseInvite = async () => {
    const response = await fetch(`/api/groups/groupUser`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "refuseInvite",
        clerkId: userId,
        groupId: selectedGroup!.id,
      }),
    });

    const errorData = (await response.json()) as ErrorResponse;
    if (!response.ok) {
      toast.error(errorData.message);
      return;
    }

    toast.success(errorData.message);
    await RefetchGroups();
    //await fetchUsers(selectedGroup!.id);
  };
  const RefetchGroups = async () => {
    try {
      const res = await fetch(`/api/groups?userId=${userId}`);
      const data = (await res.json()) as ApiResponse;
      if (data.groups && data.groups.length > 0) {
        setGroups(data.groups);
        setSelectedGroup(data.groups[0]!);
        await fetchUsers(data.groups[0]!.id);
      } else {
        setSelectedGroup(null);
        setGroups([]);
      }
    } catch (error) {
      console.error("Request failed:", error);
    }
  };
  const handleCourseSelect = (courseId: number) => {
    setSelectedCourseId(courseId);
  };
  const handleUserSelect = (userId: string) => {
    setSelectedUsers2((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };

  // Handle select all checkbox
  const handleSelectAllUsers = () => {
    if (selectedUsers2.length === filteredUsers2.length) {
      // If all are selected, deselect all
      setSelectedUsers2([]);
    } else {
      // Otherwise select all filtered users
      setSelectedUsers2(filteredUsers2.map((userId) => userId));
    }
  };

  // Handle assigning selected users to the course
  const handleAssignSelectedUsers = async () => {
    const response = await fetch("/api/courses/assignCourse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        courseId: selectedCourseId,
        userIds: selectedUsers2,
        groupId: selectedGroup!.id,
      }),
    });
    const errorData = (await response.json()) as ErrorResponse;
    if (!response.ok) {
      toast.error(errorData.message);
      return;
    }

    setSelectedUsers2([]);
    toast.success("Kursai sėkmingai priskirti.");
  };

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar with subtle top gradient to blend with header */}
      <aside className="w-96 border-r border-stone-200 bg-stone-50">
        {/* Subtle gradient/shadow at top to blend with header */}
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
                    onClick={() => handleGroupSelect(group)}
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

      {/* Main Content */}
      {selectedGroup?.role === "Pakviestas" ? (
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
                onClick={handelRefuseInvite}
              >
                Atmesti
              </button>
            </div>
          </div>
        </div>
      ) : (
        selectedGroup && (
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
              {/* Users List */}
              {activeTab === "users" && (
                <div>
                  <div className="mb-5 flex items-center gap-3">
                    {/* Search Input */}
                    <div className="relative flex-1">
                      <input
                        type="text"
                        placeholder="Ieškoti vartotojų..."
                        className="w-full rounded-lg border border-stone-300 p-2 pl-10 text-sm shadow-sm transition duration-200 focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500"
                        value={searchTerm}
                        onChange={handleSearchChange}
                      />
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        className="absolute left-3 top-2.5 h-4 w-4 text-stone-400"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                        />
                      </svg>
                    </div>

                    {/* Add User Button */}
                    <button
                      onClick={handleAddUser}
                      disabled={!selectedUser}
                      className={`rounded-lg px-4 py-2 text-sm font-medium transition duration-200 focus:outline-none focus:ring-2 focus:ring-stone-500 ${
                        selectedUser
                          ? "bg-stone-800 text-white hover:bg-stone-700"
                          : "cursor-not-allowed bg-stone-300 text-stone-500"
                      }`}
                    >
                      Pakviesti
                    </button>
                  </div>

                  {/* Dropdown List */}
                  {showUserList && (
                    <div className="absolute z-10 w-1/3 max-w-md rounded-lg border border-stone-200 bg-white shadow-lg">
                      {filteredUsers.length > 0 ? (
                        <ul className="max-h-64 overflow-y-auto py-1 text-sm">
                          {filteredUsers.map((user) => (
                            <li
                              key={user.id}
                              className="cursor-pointer px-4 py-3 hover:bg-stone-50"
                              onClick={() => handleSelectUser(user)}
                            >
                              <div className="font-medium text-stone-800">
                                {user.first_name} {user.last_name}
                              </div>
                              <div className="text-xs text-stone-500">
                                {user.email}
                              </div>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="px-4 py-3 text-sm text-stone-500">
                          Nerasta jokių vartotojų.
                        </div>
                      )}
                    </div>
                  )}

                  <div>
                    <h2 className="mb-4 text-lg font-semibold text-stone-800">
                      Grupės nariai:
                    </h2>

                    {isLoadingUsers ? (
                      // Skeleton Loader
                      <ul className="space-y-3">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <li
                            key={i}
                            className="h-16 w-full animate-pulse rounded-lg bg-stone-100"
                          ></li>
                        ))}
                      </ul>
                    ) : users.length > 0 ? (
                      // Render Users
                      <ul className="divide-y divide-stone-100">
                        {showUserDeleteConfirm && (
                          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                            <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
                              <h2 className="mb-4 text-lg font-semibold text-stone-800">
                                Ar tikrai norite pašalinti vartotoją{" "}
                                {selectedUser!.first_name}{" "}
                                {selectedUser!.last_name} iš grupės?
                              </h2>
                              <h3 className="text-sm text-stone-600">
                                Šio veiksmo atkurti negalima.
                              </h3>
                              <div className="mt-5 flex justify-end space-x-3">
                                <button
                                  className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm text-stone-700 transition duration-200 hover:bg-stone-100"
                                  onClick={() =>
                                    setShowUserDeleteConfirm(false)
                                  }
                                >
                                  Atšaukti
                                </button>
                                <button
                                  className="rounded-lg bg-red-500 px-4 py-2 text-sm text-white transition duration-200 hover:bg-red-600"
                                  onClick={() =>
                                    handleRemoveUser(selectedUser!.clerk_id)
                                  }
                                >
                                  Pašalinti
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                        {users
                          .filter((user) => user.role !== "Pakviestas")
                          .map((user) => (
                            <li
                              key={user.id}
                              className="flex items-center justify-between py-3"
                            >
                              <div className="flex flex-col">
                                <div className="font-medium text-stone-800">
                                  {user.first_name} {user.last_name}
                                </div>
                                <div className="text-xs text-stone-500">
                                  {user.email}
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <span className="rounded-full bg-stone-100 px-3 py-1 text-xs text-stone-600">
                                  {user.role}
                                </span>
                                {selectedGroup?.role === "Administratorius" &&
                                  selectedGroup?.ownerId !== user.clerk_id && (
                                    <button
                                      onClick={() => {
                                        setSelectedUser(user);
                                        setShowUserDeleteConfirm(true);
                                      }}
                                      className="rounded-full p-1 text-stone-400 transition-colors hover:bg-stone-100 hover:text-red-500"
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
                                          d="M6 18L18 6M6 6l12 12"
                                        />
                                      </svg>
                                    </button>
                                  )}
                              </div>
                            </li>
                          ))}
                      </ul>
                    ) : (
                      <div className="rounded-lg bg-stone-50 p-6 text-center text-stone-500">
                        Nėra narių
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Settings Tab */}
              {activeTab === "settings" && (
                <div>
                  {showDeleteConfirm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
                        <h2 className="mb-4 text-lg font-semibold text-stone-800">
                          Ar tikrai norite ištrinti grupę?
                        </h2>
                        <h3 className="text-sm text-stone-600">
                          Šio veiksmo atkurti negalima.
                        </h3>
                        <div className="mt-5 flex justify-end space-x-3">
                          <button
                            className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm text-stone-700 transition duration-200 hover:bg-stone-100"
                            onClick={() => setShowDeleteConfirm(false)}
                          >
                            Atšaukti
                          </button>
                          <button
                            className="rounded-lg bg-red-500 px-4 py-2 text-sm text-white transition duration-200 hover:bg-red-600"
                            onClick={handleGroupDelete}
                          >
                            Ištrinti
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-6">
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
                        Pavojinga zona
                      </h3>
                      <p className="mb-4 text-sm text-red-600">
                        Šio veiksmo negalėsite atšaukti. Prašome būti atidiems.
                      </p>
                      <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="rounded-lg bg-white px-4 py-2 text-sm text-red-600 transition duration-200 hover:bg-red-600 hover:text-white"
                      >
                        Ištrinti grupę
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Courses Tab */}
              {activeTab === "courses" && (
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold text-stone-800">
                    Priskirti kursus
                  </h2>

                  {/* Step 1: Select Course */}
                  <div className="rounded-lg bg-stone-50 p-5">
                    <label
                      htmlFor="course-select"
                      className="block text-sm font-medium text-stone-700"
                    >
                      Pasirinkite kursą:
                    </label>
                    <select
                      id="course-select"
                      className="mt-2 w-full rounded-lg border border-stone-300 p-2 text-stone-800 shadow-sm focus:border-stone-500 focus:ring-1 focus:ring-stone-500"
                      value={selectedCourseId ?? ""}
                      onChange={(e) =>
                        handleCourseSelect(Number(e.target.value))
                      }
                    >
                      <option value="">Pasirinkite kursą</option>
                      {courses.map((course) => (
                        <option key={course.id} value={course.id}>
                          {course.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedCourseId && (
                    <div className="rounded-lg border border-stone-200 bg-white p-5">
                      <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-md font-semibold text-stone-800">
                          Pasirinkite narius, kuriems priskirti kursą:
                        </h3>

                        <button
                          onClick={handleAssignSelectedUsers}
                          disabled={selectedUsers2.length === 0}
                          className="rounded-lg bg-stone-800 px-4 py-2 text-sm text-white transition duration-200 hover:bg-stone-700 disabled:opacity-50"
                        >
                          Priskirti pasirinktus ({selectedUsers2.length})
                        </button>
                      </div>

                      {/* Display the user list with checkboxes */}
                      {isLoadingUsers ? (
                        <div className="flex h-32 items-center justify-center">
                          <div className="h-8 w-8 animate-spin rounded-full border-4 border-stone-300 border-t-stone-600"></div>
                        </div>
                      ) : (
                        <>
                          <div className="mb-3 flex items-center border-b border-stone-100 pb-3">
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                id="select-all"
                                checked={
                                  filteredUsers2.length > 0 &&
                                  selectedUsers2.length ===
                                    filteredUsers2.length
                                }
                                onChange={handleSelectAllUsers}
                                className="h-4 w-4 rounded border-stone-300 text-stone-800 focus:ring-stone-500"
                              />
                              <label
                                htmlFor="select-all"
                                className="ml-2 text-sm font-medium text-stone-700"
                              >
                                Pasirinkti visus
                              </label>
                            </div>

                            <div className="relative ml-auto">
                              <input
                                type="text"
                                placeholder="Filtruoti..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-64 rounded-lg border border-stone-300 py-1 pl-8 pr-2 text-sm"
                              />
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="1.5"
                                stroke="currentColor"
                                className="absolute left-2 top-1.5 h-4 w-4 text-stone-400"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                                />
                              </svg>
                            </div>
                          </div>

                          <ul className="max-h-96 divide-y divide-stone-100 overflow-y-auto">
                            {users
                              .filter((user) => user.role !== "Pakviestas")
                              .filter((user) =>
                                (
                                  user.first_name +
                                  " " +
                                  user.last_name +
                                  " " +
                                  user.email
                                )
                                  .toLowerCase()
                                  .includes(searchTerm.toLowerCase()),
                              )
                              .map((user) => (
                                <li
                                  key={user.clerk_id}
                                  className="flex items-center py-2"
                                >
                                  <input
                                    type="checkbox"
                                    id={`user-${user.id}`}
                                    checked={selectedUsers2.includes(
                                      user.clerk_id,
                                    )}
                                    onChange={() =>
                                      handleUserSelect(user.clerk_id)
                                    }
                                    className="h-4 w-4 rounded border-stone-300 text-stone-800 focus:ring-stone-500"
                                  />
                                  <label
                                    htmlFor={`user-${user.id}`}
                                    className="ml-3 flex cursor-pointer flex-col"
                                  >
                                    <span className="font-medium text-stone-800">
                                      {user.first_name} {user.last_name}
                                    </span>
                                    <span className="text-xs text-stone-500">
                                      {user.email}
                                    </span>
                                  </label>
                                </li>
                              ))}
                          </ul>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </main>
        )
      )}
    </div>
  );
}
