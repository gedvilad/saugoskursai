"use client";
import {
  ClerkProvider,
  SignedIn,
  SignedOut,
  SignInButton,
  useAuth,
  UserButton,
} from "@clerk/nextjs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  clerk_id: string;
  role: string;
}

interface ApiResponse {
  user: User;
}

export function Header() {
  const router = useRouter();
  const { userId } = useAuth();
  const [userData, setUserData] = useState<User>();
  const [notifications, setNotifications] = useState<string[]>([
    "New policy update",
    "Safety training scheduled",
    "Reminder: Wear PPE",
  ]);
  const [showNotifications, setShowNotifications] = useState(false);

  /*useEffect(() => {
    if (!userId) return;

    (async () => {
      try {
        const response = await fetch(`/api/users?clerkId=${userId}`);
        const apiResponse = (await response.json()) as ApiResponse;

        if (response.ok) {
          setUserData(apiResponse.user);
        } else {
          console.error("Error fetching user data:", response.status);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    })();
  }, [userId]);*/

  return (
    <div className="fixed top-0 z-50 mb-4 flex w-full border-b border-black bg-white text-lg">
      <div className="m-2 border-2 border-black">LOGO</div>
      <div className="relative flex w-full flex-wrap justify-end space-x-6 p-2">
        <button
          className="w-32 hover:text-xl"
          onClick={() => router.push("/teorija")}
        >
          Teorija
        </button>
        <button
          className="w-32 rounded-md border-2 border-gray-200 hover:bg-gray-100"
          onClick={() => router.push("/testai")}
        >
          Testai
        </button>
        <button
          className="w-32 rounded-md border-2 border-gray-200 hover:bg-gray-100"
          onClick={() => router.push("/my-groups")}
        >
          Mano grupės
        </button>
        {userData?.role === "admin" && (
          <button
            className="w-32 rounded-md border-2 border-gray-200 hover:bg-gray-100"
            onClick={() => router.push("/admin-panel")}
          >
            Admin panel
          </button>
        )}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative rounded-full bg-gray-100 p-2 hover:bg-gray-200"
          >
            <img
              src="https://static-00.iconduck.com/assets.00/notification-icon-1842x2048-xr57og4y.png"
              alt="Notifications"
              className="h-5 w-5" // Adjust size as needed
            />
            {notifications.length > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                {notifications.length}
              </span>
            )}
          </button>
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-64 rounded-lg border border-gray-300 bg-white shadow-lg">
              <ul className="p-2">
                {notifications.length > 0 ? (
                  notifications.map((notif, index) => (
                    <li
                      key={index}
                      className="border-b p-2 last:border-0 hover:bg-gray-100"
                    >
                      {notif}
                    </li>
                  ))
                ) : (
                  <li className="p-2 text-gray-500">No new notifications</li>
                )}
              </ul>
            </div>
          )}
        </div>
        <ClerkProvider>
          <SignedOut>
            <SignInButton>
              <button className="w-32 rounded-md border-2 border-gray-200 hover:bg-gray-100">
                Prisijungti
              </button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </ClerkProvider>
      </div>
    </div>
  );
}

export default Header;
