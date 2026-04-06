"use client";

import { signOut } from "next-auth/react";

interface NavbarProps {
  userName?: string | null;
  userImage?: string | null;
}

export default function Navbar({ userName, userImage }: NavbarProps) {
  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-2xl">🚭</span>
        <span className="font-bold text-gray-900 text-lg">CravingLog</span>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          {userImage && (
            <img
              src={userImage}
              alt={userName ?? "User"}
              className="w-8 h-8 rounded-full"
            />
          )}
          <span className="text-sm text-gray-600 hidden sm:block">
            {userName}
          </span>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          Sign out
        </button>
      </div>
    </nav>
  );
}
