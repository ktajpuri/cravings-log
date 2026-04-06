"use client";

import { signOut } from "next-auth/react";

interface NavbarProps {
  userName?: string | null;
  userImage?: string | null;
}

export default function Navbar({ userName, userImage }: NavbarProps) {
  return (
    <nav
      className="bg-white px-4 sm:px-6 py-0 flex items-center justify-between h-16"
      style={{ boxShadow: "var(--md-shadow-2)" }}
    >
      {/* Brand */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-sm">
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <span className="font-bold text-gray-900 text-base tracking-tight">CravingLog</span>
      </div>

      {/* User actions */}
      <div className="flex items-center gap-3">
        {userImage && (
          <img
            src={userImage}
            alt={userName ?? "User"}
            className="w-8 h-8 rounded-full ring-2 ring-indigo-100"
          />
        )}
        <span className="text-sm font-medium text-gray-700 hidden sm:block">
          {userName?.split(" ")[0]}
        </span>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="text-sm text-gray-500 hover:text-indigo-600 font-medium transition-colors px-3 py-1.5 rounded-lg hover:bg-indigo-50"
        >
          Sign out
        </button>
      </div>
    </nav>
  );
}
