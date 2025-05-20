// components/tabs/CoursesTab.tsx
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  type Group,
  type User,
  type Course,
  type ApiResponseUsers,
  type ErrorResponse,
} from ".././types";

interface CoursesTabProps {
  selectedGroup: Group;
  userId: string | null;
  courses: Course[];
}

export default function CoursesTab({
  selectedGroup,
  userId,
  courses,
}: CoursesTabProps) {
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoadingUsers(true);
        const res = await fetch(`/api/groups?groupId=${selectedGroup.id}`);
        if (!res.ok) throw new Error("Failed to fetch users");

        const data = (await res.json()) as ApiResponseUsers;
        setTimeout(() => setIsLoadingUsers(false), 700);
        setUsers(data.users);

        const filtered = data.users
          .filter((user: User) => user.role !== "Pakviestas")
          .filter((user: User) =>
            (user.first_name + " " + user.last_name + " " + user.email)
              .toLowerCase()
              .includes(searchTerm.toLowerCase()),
          )
          .map((user: User) => user.clerk_id);

        setFilteredUsers(filtered);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers().catch(console.error);
  }, [selectedGroup.id, searchTerm]);

  const handleCourseSelect = (courseId: number) => {
    setSelectedCourseId(courseId);
  };

  const handleUserSelect = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };

  const handleSelectAllUsers = () => {
    if (selectedUsers.length === filteredUsers.length) {
      // If all are selected, deselect all
      setSelectedUsers([]);
    } else {
      // Otherwise select all filtered users
      setSelectedUsers(filteredUsers.map((userId) => userId));
    }
  };

  const handleAssignSelectedUsers = async () => {
    const response = await fetch("/api/courses/assignCourse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        courseId: selectedCourseId,
        userIds: selectedUsers,
        groupId: selectedGroup.id,
        assignedById: userId,
      }),
    });

    const errorData = (await response.json()) as ErrorResponse;
    if (!response.ok) {
      toast.error(errorData.message);
      return;
    }

    setSelectedUsers([]);
    toast.success("Kursai sėkmingai priskirti.");
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-stone-800">Priskirti kursus</h2>

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
        <div className="rounded-lg border border-stone-200 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-md font-semibold text-stone-800">
              Pasirinkite narius, kuriems priskirti kursą:
            </h3>

            <button
              onClick={handleAssignSelectedUsers}
              disabled={selectedUsers.length === 0}
              className="rounded-lg bg-stone-800 px-4 py-2 text-sm text-white transition duration-200 hover:bg-stone-700 disabled:opacity-50"
            >
              Priskirti pasirinktus ({selectedUsers.length})
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
                      filteredUsers.length > 0 &&
                      selectedUsers.length === filteredUsers.length
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
                    (user.first_name + " " + user.last_name + " " + user.email)
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase()),
                  )
                  .map((user) => (
                    <li key={user.clerk_id} className="flex items-center py-2">
                      <input
                        type="checkbox"
                        id={`user-${user.id}`}
                        checked={selectedUsers.includes(user.clerk_id)}
                        onChange={() => handleUserSelect(user.clerk_id)}
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
  );
}
