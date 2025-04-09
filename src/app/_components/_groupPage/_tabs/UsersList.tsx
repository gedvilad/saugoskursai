import { type User, type Group } from "../types";

interface UsersListProps {
  users: User[];
  isLoading: boolean;
  selectedGroup: Group;
  selectedUser: User | null;
  setSelectedUser: (user: User | null) => void;
  showDeleteConfirm: boolean;
  setShowDeleteConfirm: (show: boolean) => void;
  onRemoveUser: (userId: string) => void;
}
export default function UsersList({
  users,
  isLoading,
  selectedGroup,
  selectedUser,
  setSelectedUser,
  showDeleteConfirm,
  setShowDeleteConfirm,
  onRemoveUser,
}: UsersListProps) {
  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold text-stone-800">
        Grupės nariai:
      </h2>

      {isLoading ? (
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
          {showDeleteConfirm && selectedUser && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
              <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
                <h2 className="mb-4 text-lg font-semibold text-stone-800">
                  Ar tikrai norite pašalinti vartotoją {selectedUser.first_name}{" "}
                  {selectedUser.last_name} iš grupės?
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
                    onClick={() => onRemoveUser(selectedUser.clerk_id)}
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
                  <div className="text-xs text-stone-500">{user.email}</div>
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
                          setShowDeleteConfirm(true);
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
  );
}
