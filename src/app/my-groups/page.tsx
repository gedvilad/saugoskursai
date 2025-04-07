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
    <div className="flex h-screen">
      <aside className="w-1/4 border-r bg-gray-100 p-4">
        <h2 className="mb-4 text-lg font-semibold">Jūsų grupės</h2>
        <div className="space-y-2">
          {isLoadingGroups
            ? // Skeleton loader (3 placeholders)
              Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-10 w-full animate-pulse rounded-md bg-gray-200"
                ></div>
              ))
            : groups.map((group) => (
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
                placeholder="Įveskite naujos grupės pavadinimą"
                className="w-full rounded-md border p-2"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
              />
              <div className="flex space-x-2">
                <button
                  className="rounded-md bg-blue-500 px-4 py-2 text-xs text-white transition duration-200 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onClick={handleSaveGroup}
                >
                  Sukurti
                </button>
                <button
                  className="rounded-md bg-gray-400 px-4 py-2 text-xs text-white transition duration-200 hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400"
                  onClick={handleCancelCreate}
                >
                  Atšaukti
                </button>
              </div>
            </div>
          ) : (
            <button
              className="flex w-full items-center justify-center gap-2 rounded-md border bg-white p-2 text-left transition duration-200 hover:bg-blue-300"
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
      {selectedGroup?.role === "Pakviestas" ? (
        <div className="flex-1 p-6">
          <h1 className="mb-4 text-xl font-bold">
            Grupė: {selectedGroup?.name}
          </h1>
          <div className="space-y-2">
            <p>Esate pakviestas į šią grupę! Ar norite priimti kvietimą?</p>
            <div className="space-x-3">
              <button
                className="rounded-md bg-blue-500 px-4 py-2 text-xs text-white transition duration-200 hover:bg-blue-600"
                onClick={handleAcceptInvite}
              >
                Priimti
              </button>
              <button
                className="rounded-md bg-red-500 px-4 py-2 text-xs text-white transition duration-200 hover:bg-red-600"
                onClick={handelRefuseInvite}
              >
                Atmesti
              </button>
            </div>
          </div>
        </div>
      ) : (
        selectedGroup && (
          <main className="flex-1 p-6">
            <h1 className="mb-4 text-xl font-bold">
              Grupė: {selectedGroup?.name}
            </h1>

            {/* Tabs */}
            <div className="mb-4 flex space-x-4 border-b">
              {[
                { key: "users", label: "Grupės nariai" },
                { key: "settings", label: "Nustatymai" },
                { key: "courses", label: "Priskirti kursus" },
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
                    Pakviesti
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

                  {isLoadingUsers ? (
                    // Skeleton Loader
                    <ul className="space-y-2">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <li
                          key={i}
                          className="h-7 w-full animate-pulse rounded-md bg-gray-200"
                        ></li>
                      ))}
                    </ul>
                  ) : users.length > 0 ? (
                    // Render Users
                    <ul className="w-full">
                      {showUserDeleteConfirm && (
                        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                          <div className="items-center rounded-lg bg-white p-6 shadow-lg">
                            <h2 className="mb-4 text-lg font-semibold">
                              Ar tikrai norite pašalinti vartotoją{" "}
                              {selectedUser!.first_name}{" "}
                              {selectedUser!.last_name} iš grupės?
                            </h2>
                            <h3 className="text-sm text-red-500">
                              Šio veiksmo atkurti negalima.
                            </h3>
                            <div className="mt-4 flex justify-center space-x-2">
                              <button
                                className="rounded-md bg-red-500 px-4 py-2 text-xs text-white transition duration-200 hover:bg-red-600"
                                onClick={() =>
                                  handleRemoveUser(selectedUser!.clerk_id)
                                }
                              >
                                Pašalinti
                              </button>
                              <button
                                className="rounded-md bg-gray-400 px-4 py-2 text-xs text-white transition duration-200 hover:bg-gray-500"
                                onClick={() => setShowUserDeleteConfirm(false)}
                              >
                                Atšaukti
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                      {users
                        .filter((user) => user.role !== "Pakviestas") // Filter out users with the "Pakviestas" role
                        .map((user) => (
                          <li
                            key={user.id}
                            className="grid grid-cols-3 items-center border-b-2 p-2 shadow-sm"
                          >
                            <div className="col-span-1">
                              {user.first_name} {user.last_name} ({user.email})
                            </div>
                            <div className="col-span-1 text-sm text-gray-400">
                              {user.role}
                            </div>
                            <div className="col-span-1 flex justify-end">
                              {selectedGroup?.role === "Administratorius" &&
                                selectedGroup?.ownerId !== user.clerk_id && (
                                  <button
                                    onClick={() => {
                                      setSelectedUser(user);
                                      setShowUserDeleteConfirm(true);
                                    }}
                                    className="text-red-500 hover:text-red-700"
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
                    <p>Nėra narių</p>
                  )}
                </div>
              </div>
            )}
            {activeTab === "settings" && (
              <div>
                {showDeleteConfirm && (
                  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="items-center rounded-lg bg-white p-6 shadow-lg">
                      <h2 className="mb-4 text-lg font-semibold">
                        Ar tikrai norite ištrinti grupę?
                      </h2>
                      <h3 className="text-sm text-red-500">
                        Šio veiksmo atkurti negalima.
                      </h3>
                      <div className="mt-4 flex justify-center space-x-2">
                        <button
                          className="rounded-md bg-red-500 px-4 py-2 text-xs text-white transition duration-200 hover:bg-red-600"
                          onClick={handleGroupDelete}
                        >
                          Ištrinti
                        </button>
                        <button
                          className="rounded-md bg-gray-400 px-4 py-2 text-xs text-white transition duration-200 hover:bg-gray-500"
                          onClick={() => setShowDeleteConfirm(false)}
                        >
                          Atšaukti
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="rounded-md bg-red-500 px-4 py-2 text-xs text-white transition duration-200 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  Ištrinti grupę.
                </button>
              </div>
            )}
            {activeTab === "courses" && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">Priskirti kursus</h2>

                {/* Step 1: Select Course */}
                <div>
                  <label
                    htmlFor="course-select"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Pasirinkite kursą:
                  </label>
                  <select
                    id="course-select"
                    className="w-full rounded-md border-gray-300 p-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    value={selectedCourseId ?? ""}
                    onChange={(e) => handleCourseSelect(Number(e.target.value))}
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
                  <div>
                    <h3 className="text-md mt-4 font-semibold">
                      Pasirinkite narius, kuriems priskirti kursą:
                    </h3>

                    {/* Display the user list with checkboxes */}
                    {isLoadingUsers ? (
                      <div>Loading...</div>
                    ) : (
                      <>
                        <div className="mb-2 flex items-center">
                          <input
                            type="checkbox"
                            id="select-all"
                            checked={
                              filteredUsers2.length > 0 &&
                              selectedUsers2.length === filteredUsers2.length
                            }
                            onChange={handleSelectAllUsers}
                            className="mr-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <label
                            htmlFor="select-all"
                            className="text-sm font-medium"
                          >
                            Pasirinkti visus
                          </label>

                          <button
                            onClick={handleAssignSelectedUsers}
                            disabled={selectedUsers2.length === 0}
                            className="ml-auto rounded-md bg-blue-500 px-3 py-1 text-sm text-white hover:bg-blue-600 disabled:opacity-50"
                          >
                            Priskirti pasirinktus ({selectedUsers2.length})
                          </button>
                        </div>

                        <ul className="max-h-96 space-y-2 overflow-y-auto">
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
                                className="flex items-center justify-between rounded-md border p-2"
                              >
                                <div className="flex items-center">
                                  <input
                                    type="checkbox"
                                    id={`user-${user.id}`}
                                    checked={selectedUsers2.includes(
                                      user.clerk_id,
                                    )}
                                    onChange={() =>
                                      handleUserSelect(user.clerk_id)
                                    }
                                    className="mr-3 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                  />
                                  <label htmlFor={`user-${user.id}`}>
                                    {user.first_name} {user.last_name} (
                                    {user.email})
                                  </label>
                                </div>
                              </li>
                            ))}
                        </ul>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </main>
        )
      )}
    </div>
  );
}
