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
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

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
  status: number;
  url: string;
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const mobileMenuRef = useRef<HTMLDivElement | null>(null);
  const mobileMenuButtonRef = useRef<HTMLButtonElement | null>(null);

  // Navigation items with their display names and corresponding routes
  const navigationItems = [
    { name: "Mano grupės", route: "/my-groups" },
    { name: "Kursai", route: "/my-courses" },
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Handle notification popup clicks
      if (
        notifRef.current &&
        !notifRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
        markNotificationsAsRead().catch((error) =>
          console.error("Error marking notifications as read:", error),
        );
      }

      // Handle mobile menu clicks
      if (
        mobileMenuOpen &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node) &&
        mobileMenuButtonRef.current &&
        !mobileMenuButtonRef.current.contains(event.target as Node)
      ) {
        setMobileMenuOpen(false);
      }
    };

    if (showNotifications || mobileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showNotifications, mobileMenuOpen]);

  // Close mobile menu when screen size changes to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [mobileMenuOpen]);

  // Add this new effect for proper mobile notification positioning
  useEffect(() => {
    const updateNotificationPosition = () => {
      if (notifRef.current) {
        const screenWidth = window.innerWidth;

        if (screenWidth < 768) {
          // Mobile styles
          notifRef.current.style.position = "fixed";
          notifRef.current.style.top = "50px";
          notifRef.current.style.left = "0";
          notifRef.current.style.width = "100vw";
          notifRef.current.style.transform = "none";
          notifRef.current.style.right = "auto";
          notifRef.current.style.maxWidth = "none";
          notifRef.current.style.boxSizing = "border-box";
        } else {
          // Desktop styles
          notifRef.current.style.position = "absolute"; // or your default desktop position
          notifRef.current.style.top = "auto"; // reset top
          notifRef.current.style.left = "auto";
          notifRef.current.style.right = "0";
          notifRef.current.style.width = "320px";
          notifRef.current.style.transform = "none";
          notifRef.current.style.maxWidth = "none";
          notifRef.current.style.boxSizing = "content-box"; // reset boxSizing if needed
        }
      }
    };

    if (showNotifications) {
      updateNotificationPosition();
      window.addEventListener("resize", updateNotificationPosition);
    }

    return () => {
      window.removeEventListener("resize", updateNotificationPosition);
    };
  }, [showNotifications]);

  const markNotificationsAsRead = async () => {
    try {
      const res = await fetch("/api/header?userId=" + userId, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }
      const data = (await res.json()) as ApiResponseNotification;
      // Optimistically update the notifications state
      setNotifications(data.data);
      setNewNotifications([]);
    } catch (error) {
      console.error("Failed to update notifications:", error);
    }
  };

  const handleOpenNotif = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (showNotifications) {
      setShowNotifications(false);
      markNotificationsAsRead().catch((error) =>
        console.error("Error marking notifications as read:", error),
      );
    } else {
      setShowNotifications(true);
    }
  };

  const handleNavigation = (route: string) => {
    // Only navigate if auth is loaded to prevent redirect loops
    if (isLoaded && isSignedIn) {
      router.push(route);
      setMobileMenuOpen(false); // Close mobile menu after navigation
    }
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div
      className={`fixed top-0 z-50 w-full transition-all duration-300 ${
        isScrolled ? "bg-white py-2 shadow-md" : "bg-transparent py-4"
      }`}
    >
      <div className="container mx-auto flex items-center justify-between px-6">
        <Link href="/" className="flex items-center space-x-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-600">
            <span className="text-lg font-bold text-white">SK</span>
          </div>
          <span
            className={`text-xl font-bold ${
              isScrolled ? "text-stone-800" : "text-gray-800"
            } hidden md:inline`}
          >
            Saugos Kursai
          </span>
        </Link>

        <div className="flex items-center space-x-6">
          <SignedIn>
            {/* Desktop Navigation - hidden on mobile */}
            <nav className="hidden space-x-1 md:flex">
              {navigationItems.map((item) => (
                <button
                  key={item.name}
                  className={`rounded-md px-3 py-2 font-medium transition-colors duration-200 ${
                    isScrolled
                      ? "text-stone-700 hover:bg-stone-100 hover:text-stone-500"
                      : "text-stone-700 hover:bg-stone-100 hover:text-stone-500"
                  }`}
                  onClick={() => handleNavigation(item.route)}
                  disabled={!isLoaded}
                >
                  {item.name}
                </button>
              ))}

              {/* {userData?.role === "admin" && (
                <button
                  className={`rounded-md px-3 py-2 font-medium transition-colors duration-200 ${
                    isScrolled
                      ? "text-stone-700 hover:bg-stone-100 hover:text-stone-500"
                      : "text-stone-700 hover:bg-stone-100 hover:text-stone-500"
                  }`}
                  onClick={() => handleNavigation("/admin-panel")}
                  disabled={!isLoaded}
                >
                  Admin panel
                </button>
              )} */}
            </nav>

            {/* Mobile menu button - only shown on small screens */}
            <button
              className="text-stone-600 md:hidden"
              onClick={toggleMobileMenu}
              ref={mobileMenuButtonRef}
            >
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
                  d={
                    mobileMenuOpen
                      ? "M6 18L18 6M6 6l12 12"
                      : "M4 6h16M4 12h16M4 18h16"
                  }
                />
              </svg>
            </button>

            {/* Mobile Navigation Menu */}
            {mobileMenuOpen && (
              <div
                className="absolute left-0 right-0 top-16 z-40 mt-2 bg-white shadow-lg md:hidden"
                ref={mobileMenuRef}
              >
                <div className="flex flex-col space-y-2 p-4">
                  {navigationItems.map((item) => (
                    <button
                      key={item.name}
                      className="w-full rounded-md px-4 py-3 text-left font-medium text-stone-700 hover:bg-stone-100"
                      onClick={() => handleNavigation(item.route)}
                      disabled={!isLoaded}
                    >
                      {item.name}
                    </button>
                  ))}

                  {/* {userData?.role === "admin" && (
                    <button
                      className="w-full rounded-md px-4 py-3 text-left font-medium text-stone-700 hover:bg-stone-100"
                      onClick={() => handleNavigation("/admin-panel")}
                      disabled={!isLoaded}
                    >
                      Admin panel
                    </button>
                  )} */}
                </div>
              </div>
            )}
          </SignedIn>

          <SignedIn>
            <div className="relative">
              <button
                onClick={handleOpenNotif}
                className={`relative rounded-full p-2 transition-colors duration-200 ${
                  isScrolled
                    ? "bg-stone-100 hover:bg-stone-200"
                    : "bg-stone-100 hover:bg-stone-200"
                }`}
                ref={buttonRef}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-stone-600"
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
                <div
                  className="absolute mt-2 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                  ref={notifRef}
                >
                  <div className="border-b border-stone-100 px-4 py-3">
                    <h3 className="text-sm font-medium text-stone-900">
                      Pranešimai
                    </h3>
                  </div>
                  <ul className="max-h-60 divide-y divide-stone-100 overflow-y-auto">
                    {[...newNotifications, ...notifications].length > 0 ? (
                      [...newNotifications, ...notifications].map(
                        (notif, index) => (
                          <li
                            key={index}
                            className={`px-4 py-3 text-sm hover:bg-stone-50 ${
                              notif.status === 1
                                ? "bg-stone-100 font-medium"
                                : "text-stone-700"
                            }`}
                          >
                            {notif.url ? (
                              <Link href={notif.url} onClick={handleOpenNotif}>
                                {notif.message}
                              </Link>
                            ) : (
                              <p>{notif.message}</p>
                            )}
                            <p className="mt-1 text-xs text-stone-500">
                              {new Date(notif.created_at).toLocaleDateString()}
                            </p>
                          </li>
                        ),
                      )
                    ) : (
                      <li className="px-4 py-3 text-sm text-stone-500">
                        Neturite pranešimų
                      </li>
                    )}
                  </ul>
                  <div className="p-2">
                    <Link
                      href="/notifications"
                      className="block w-full rounded px-4 py-2 text-center text-sm text-stone-600 underline hover:text-stone-700"
                    >
                      Peržiūrėti visus pranešimus
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </SignedIn>

          <SignedOut>
            <SignInButton>
              <button
                className={`rounded-md px-4 py-2 font-medium transition-colors duration-200 ${
                  isScrolled
                    ? "bg-stone-600 text-white hover:bg-stone-700"
                    : "bg-stone-600 text-white hover:bg-stone-700"
                }`}
              >
                Prisijungti
              </button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <UserButton afterSignOutUrl="/" showName={true} />
          </SignedIn>
          <LanguageSwitcher />
        </div>
      </div>
    </div>
  );
}

export default Header;

const locales = {
  lt: {
    flag: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASIAAACuCAMAAAClZfCTAAAAFVBMVEX9uRPBJy0AakT/vgwAY0cAbkbKHysqUHmaAAAA+klEQVR4nO3QNwGAAAAEsaf6l4yEWxgTCdkAAAAAAAAAAAAAAAAAAAAA/nMRdhN2EhQlRUlRUpQUJUVJUVKUFCVFSVFSlBQlRUlRUpQUJUVJUVKUFCVFSVFSlBQlRUlRUpQUJUVJUVKUFCVFSVFSlBQlRUlRUpQUJUVJUVKUFCVFSVFSlBQlRUlRUpQUJUVJUdpD2EvYQVCUFCVFSVFSlBQlRUlRUpQUJUVJUVKUFCVFSVFSlBQlRUlRUpQUJUVJUVKUFCVFSVFSlBQlRUlRUpQUJUVJUVKUFCVFSVFSlBQlRUlRUpQUJUVJUVKUFCVFSVFSlBQlRUlR+gCB9tPXlKkzPwAAAABJRU5ErkJggg==", // Add your Lithuanian flag image path here
    alt: "LT",
  },
  en: {
    flag: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Flag_of_the_United_Kingdom_%281-2%29.svg/1200px-Flag_of_the_United_Kingdom_%281-2%29.svg.png", // Add your British flag image path here
    alt: "EN",
  },
};

export const LanguageSwitcher = () => {
  const router = useRouter();
  const pathname = usePathname();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [locale, setLocale] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const pathLocale = pathname.split("/")[1];
    if (Object.keys(locales).includes(pathLocale!)) {
      setLocale(pathLocale!);
    } else {
      setLocale("lt"); // default to Lithuanian if not specified
    }
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!locale) return null;

  const basePath = pathname.replace(`/${locale}`, "");

  const handleLocaleChange = (newLocale: string) => {
    const newPath = newLocale === "lt" ? `/` : `/${newLocale}${basePath}`;
    router.push(newPath);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-6 w-8 cursor-pointer items-center justify-center rounded bg-transparent transition-opacity hover:opacity-80"
        aria-label="Select language"
      >
        <img
          src={locales[locale as keyof typeof locales].flag}
          alt={locales[locale as keyof typeof locales].alt}
          width={32}
          height={24}
          className="rounded border border-gray-200 object-cover"
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-1 rounded-md border border-gray-200 bg-white shadow-lg">
          {Object.entries(locales).map(([code, { flag, alt }]) => (
            <button
              key={code}
              onClick={() => handleLocaleChange(code)}
              className={`flex w-full items-center justify-center p-0.5 transition-colors first:rounded-t-md last:rounded-b-md hover:bg-gray-100 ${
                code === locale ? "bg-gray-50" : ""
              }`}
            >
              <img
                src={flag}
                alt={alt}
                width={32}
                height={24}
                className="border-gray-200 object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
