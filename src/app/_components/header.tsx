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
  data: Notification[];
}

export function Header() {
  const router = useRouter();
  const { userId, isLoaded, isSignedIn } = useAuth();
  const [userData, setUserData] = useState<User>();
  const [newNotifications, setNewNotifications] = useState<Notification[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Navigation items with their display names and corresponding routes
  const navigationItems = [
    { name: "Teorija", route: "/teorija" },
    { name: "Testai", route: "/testai" },
    { name: "Mano grupės", route: "/my-groups" },
  ];

  useEffect(() => {
    // Add scroll event listener
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);

    // Fetch user data
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

    // Fetch notifications
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

    if (isLoaded && isSignedIn) {
      fetchUserInfo().catch((error) =>
        console.error("Error fetching user info:", error),
      );

      fetchNotifications().catch((error) =>
        console.error("Error fetching notifications:", error),
      );
    }

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [userId, isLoaded, isSignedIn]);

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

  const handleNavigation = (route: string) => {
    // Only navigate if auth is loaded to prevent redirect loops
    if (isLoaded && isSignedIn) {
      router.push(route);
    }
  };

  return (
    <div
      className={`fixed top-0 z-50 w-full transition-all duration-300 ${
        isScrolled ? "bg-white py-2 shadow-md" : "bg-transparent py-4"
      }`}
    >
      <div className="container mx-auto flex items-center justify-between px-6">
        <Link href="/" className="flex items-center space-x-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600">
            <span className="text-lg font-bold text-white">SM</span>
          </div>
          <span
            className={`text-xl font-bold ${isScrolled ? "text-white" : "text-gray-800"}`}
          >
            Saugos Mokymai
          </span>
        </Link>

        <div className="flex items-center space-x-6">
          <nav className="hidden space-x-1 md:flex">
            {navigationItems.map((item) => (
              <button
                key={item.name}
                className={`rounded-md px-3 py-2 font-medium transition-colors duration-200 ${
                  isScrolled
                    ? "text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                    : "text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                }`}
                onClick={() => handleNavigation(item.route)}
                disabled={!isLoaded}
              >
                {item.name}
              </button>
            ))}

            {userData?.role === "admin" && (
              <button
                className={`rounded-md px-3 py-2 font-medium transition-colors duration-200 ${
                  isScrolled
                    ? "text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                    : "text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                }`}
                onClick={() => handleNavigation("/admin-panel")}
                disabled={!isLoaded}
              >
                Admin panel
              </button>
            )}
          </nav>

          {/* Mobile menu button - only shown on small screens */}
          <button className="text-gray-600 md:hidden">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          <SignedIn>
            <div className="relative">
              <button
                onClick={handleOpenNotif}
                className={`relative rounded-full p-2 transition-colors duration-200 ${
                  isScrolled
                    ? "bg-gray-100 hover:bg-gray-200"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-5 w-5 ${isScrolled ? "text-gray-600" : "text-gray-600"}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>

                {newNotifications.length > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                    {newNotifications.length}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="border-b border-gray-100 px-4 py-3">
                    <h3 className="text-sm font-medium text-gray-900">
                      Pranešimai
                    </h3>
                  </div>
                  <ul className="max-h-60 divide-y divide-gray-100 overflow-y-auto">
                    {[...newNotifications, ...notifications].length > 0 ? (
                      [...newNotifications, ...notifications].map(
                        (notif, index) => (
                          <li
                            key={index}
                            className={`px-4 py-3 text-sm hover:bg-gray-50 ${
                              newNotifications.includes(notif)
                                ? "bg-blue-50 font-medium"
                                : "text-gray-700"
                            }`}
                          >
                            <p>{notif.message}</p>
                            <p className="mt-1 text-xs text-gray-500">
                              {new Date(notif.created_at).toLocaleDateString()}
                            </p>
                          </li>
                        ),
                      )
                    ) : (
                      <li className="px-4 py-3 text-sm text-gray-500">
                        Neturite pranešimų
                      </li>
                    )}
                  </ul>
                  <div className="border-t border-gray-100 p-2">
                    <Link
                      href="/notifications"
                      className="block w-full rounded bg-gray-50 px-4 py-2 text-center text-sm text-blue-600 hover:bg-gray-100"
                    >
                      Peržiūrėti visus pranešimus
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </SignedIn>

          <ClerkProvider>
            <SignedOut>
              <SignInButton>
                <button
                  className={`rounded-md px-4 py-2 font-medium transition-colors duration-200 ${
                    isScrolled
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  Prisijungti
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </ClerkProvider>
        </div>
      </div>
    </div>
  );
}

export default Header;
