import { type User } from "../types";

interface UserSearchInputProps {
  searchTerm: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  showUserList: boolean;
  filteredUsers: User[];
  onSelectUser: (user: User) => void;
}
export default function UserSearchInput({
  searchTerm,
  onSearchChange,
  showUserList,
  filteredUsers,
  onSelectUser,
}: UserSearchInputProps) {
  return (
    <div className="relative flex-1">
      <input
        type="text"
        placeholder="Ieškoti vartotojų..."
        className="w-full rounded-lg border border-stone-300 p-2 pl-10 text-sm shadow-sm transition duration-200 focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500"
        value={searchTerm}
        onChange={onSearchChange}
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

      {/* Dropdown List */}
      {showUserList && (
        <div className="absolute z-10 w-full rounded-lg border border-stone-200 bg-white shadow-lg">
          {filteredUsers.length > 0 ? (
            <ul className="max-h-64 overflow-y-auto py-1 text-sm">
              {filteredUsers.map((user) => (
                <li
                  key={user.id}
                  className="cursor-pointer px-4 py-3 hover:bg-stone-50"
                  onClick={() => onSelectUser(user)}
                >
                  <div className="font-medium text-stone-800">
                    {user.first_name} {user.last_name}
                  </div>
                  <div className="text-xs text-stone-500">{user.email}</div>
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
    </div>
  );
}
