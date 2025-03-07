"use client";
import {
  ClerkProvider,
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "@clerk/nextjs";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function Header() {
  const router = useRouter();
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
