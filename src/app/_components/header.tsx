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
interface Notification {
  message: string;
  created_at: string;
  status: string;
}
interface ApiResponseNotification {
  data: Notification[]; // Define the expected structure
}
export function Header() {
  const router = useRouter();
  const { userId } = useAuth();
  const [userData, setUserData] = useState<User>();
  const [newNotifications, setNewNotifications] = useState<Notification[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (userId) {
        try {
          const res = await fetch(`/api/header?userId=${userId}`);
          const { dataNew, data } = (await res.json()) as {
            dataNew: Notification[];
            data: Notification[] | null;
          };

          setNewNotifications(dataNew || []);
          setNotifications(data ?? []);
        } catch (error) {
          console.error("Request failed:", error);
        }
      }
    };
    const fetchUserInfo = async () => {
      if (userId) {
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
      }
    };
    fetchUserInfo().catch((error) =>
      console.error("Error fetching user info:", error),
    );
    fetchNotifications().catch((error) =>
      console.error("Error fetching groups:", error),
    );
  }, [userId]);

  const handleOpenNotif = async () => {
    setShowNotifications(!showNotifications);
    if (showNotifications === true) {
      const res = await fetch("/api/header?userId=" + userId, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });
      const data = (await res.json()) as ApiResponseNotification;
      setNotifications(data.data);
      setNewNotifications([]);
    }
  };

  return (
    <div className="fixed top-0 z-50 flex w-full items-center justify-between bg-white px-6 py-4 shadow-md">
      <Link href="/" className="text-2xl font-semibold text-gray-800">
        LOGO
      </Link>
      <div className="flex items-center space-x-6">
        <nav className="flex space-x-4">
          <button
            className="rounded-md px-3 py-2 text-gray-600 hover:bg-gray-100 hover:text-gray-800"
            onClick={() => router.push("/teorija")}
          >
            Teorija
          </button>
          <button
            className="rounded-md px-3 py-2 text-gray-600 hover:bg-gray-100 hover:text-gray-800"
            onClick={() => router.push("/testai")}
          >
            Testai
          </button>
          <button
            className="rounded-md px-3 py-2 text-gray-600 hover:bg-gray-100 hover:text-gray-800"
            onClick={() => router.push("/my-groups")}
          >
            Mano grupės
          </button>
          {userData?.role === "admin" && (
            <button
              className="rounded-md px-3 py-2 text-gray-600 hover:bg-gray-100 hover:text-gray-800"
              onClick={() => router.push("/admin-panel")}
            >
              Admin panel
            </button>
          )}
        </nav>
        <SignedIn>
          <div className="relative">
            <button
              onClick={handleOpenNotif}
              className="relative rounded-full bg-gray-100 p-2 hover:bg-gray-200"
            >
              <img
                src="https://static-00.iconduck.com/assets.00/notification-icon-1842x2048-xr57og4y.png"
                alt="Notifications"
                className="h-5 w-5" // Adjust size as needed
              />
              {newNotifications.length > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                  {newNotifications.length}
                </span>
              )}
            </button>
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <ul className="divide-y divide-gray-200">
                  {[...newNotifications, ...notifications].length > 0 ? (
                    [...newNotifications, ...notifications].map(
                      (notif, index) => (
                        <li
                          key={index}
                          className={`px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${newNotifications.includes(notif) ? "font-semibold" : ""}`}
                        >
                          {notif.message}
                        </li>
                      ),
                    )
                  ) : (
                    <li className="px-4 py-2 text-sm text-gray-500">
                      Neturite pranešimų
                    </li>
                  )}
                </ul>
                <div className="m-2">
                  <Link
                    href="/"
                    className="block px-4 py-2 text-center text-sm text-blue-600 underline hover:text-blue-800"
                  >
                    peržiūrėti visus pranešimus
                  </Link>
                </div>
              </div>
            )}
          </div>
        </SignedIn>
        <ClerkProvider>
          <SignedOut>
            <SignInButton>
              <button className="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
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
