// components/tabs/UsersTab.tsx
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  type Group,
  type User,
  type ApiResponseUsers,
  ErrorResponse,
} from ".././types";
import UserSearchInput from "./UserSearchInput";
import UsersList from "./UsersList";

interface UsersTabProps {
  selectedGroup: Group;
  userId: string | null;
}

export default function UsersTab({ selectedGroup, userId }: UsersTabProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showUserList, setShowUserList] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [showUserDeleteConfirm, setShowUserDeleteConfirm] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoadingUsers(true);
        const res = await fetch(`/api/groups?groupId=${selectedGroup.id}`);
        if (!res.ok) throw new Error("Failed to fetch users");

        const data = (await res.json()) as ApiResponseUsers;
        setTimeout(() => setIsLoadingUsers(false), 700);
        setUsers(data.users);
      } catch (error) {
        console.error("Error fetching users:", error);
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

    fetchUsers().catch(console.error);
    fetchAllUsers().catch(console.error);
  }, [selectedGroup.id]);

  const handleAddUser = async () => {
    const response = await fetch(`/api/groups/groupUser`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "addUser",
        clerkId: selectedUser!.clerk_id,
        groupId: selectedGroup.id,
      }),
    });

    const errorData = (await response.json()) as ErrorResponse;
    if (!response.ok) {
      toast.error(errorData.message);
      return;
    }

    toast.success(errorData.message);

    // Refresh users
    const res = await fetch(`/api/groups?groupId=${selectedGroup.id}`);
    const data = (await res.json()) as ApiResponseUsers;
    setUsers(data.users);

    setSelectedUser(null);
    setSearchTerm("");
  };

  const handleRemoveUser = async (userIdToRemove: string) => {
    setShowUserDeleteConfirm(false);
    setSelectedUser(null);

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

    // Refresh users
    const res = await fetch(`/api/groups?groupId=${selectedGroup.id}`);
    const data = (await res.json()) as ApiResponseUsers;
    setUsers(data.users);
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
    setSearchTerm(`${user.first_name} ${user.last_name}`);
    setSelectedUser(user);
    setShowUserList(false);
  };

  return (
    <div>
      <div className="mb-5 flex items-center gap-3">
        {/* Search Input */}
        <UserSearchInput
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          showUserList={showUserList}
          filteredUsers={filteredUsers}
          onSelectUser={handleSelectUser}
        />

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

      <UsersList
        users={users}
        isLoading={isLoadingUsers}
        selectedGroup={selectedGroup}
        selectedUser={selectedUser}
        setSelectedUser={setSelectedUser}
        showDeleteConfirm={showUserDeleteConfirm}
        setShowDeleteConfirm={setShowUserDeleteConfirm}
        onRemoveUser={handleRemoveUser}
      />
    </div>
  );
}
