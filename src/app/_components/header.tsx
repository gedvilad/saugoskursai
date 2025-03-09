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
  user: User; // The API returns an object with a 'user' property
}

export function Header() {
  const router = useRouter();
  const { userId } = useAuth();
  const [userData, setUserData] = useState<User>();

  useEffect(() => {
    if (!userId) return;

    (async () => {
      try {
        const response = await fetch(`/api/users?clerkId=${userId}`);
        const apiResponse = (await response.json()) as ApiResponse; // Correct type
        console.log("Fetched user data:", apiResponse);

        if (response.ok) {
          setUserData(apiResponse.user); // Extract the 'user' property
        } else {
          console.error("Error fetching user data:", response.status);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
      }
    })().catch((error) => console.error("Unhandled error:", error));
  }, [userId]);

  return (
    <div className="max-w-screen fixed left-4 right-4 top-0 z-50 mb-4 flex border-b border-black bg-white text-lg">
      <div className="m-2 border-2 border-black">LOGO</div>
      <div className="flex w-full flex-wrap justify-end space-x-10 p-2">
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
