"use client";

import { signOut } from "next-auth/react";
import { LogOut, User } from "lucide-react";

interface UserNavProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  } | null;
}

export function UserNav({ user }: UserNavProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        {user?.image ? (
          <img
            src={user.image}
            alt={user.name ?? "User"}
            className="h-8 w-8 rounded-full"
          />
        ) : (
          <div className="h-8 w-8 rounded-full bg-ajicolor-magenta/10 flex items-center justify-center">
            <User className="h-4 w-4 text-ajicolor-magenta" />
          </div>
        )}
        <span className="text-sm font-medium text-gray-700">
          {user?.name ?? user?.email ?? "Admin"}
        </span>
      </div>
      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="p-1.5 text-gray-400 hover:text-red-500 transition-colors rounded-md hover:bg-gray-100"
        title="Cerrar sesión"
      >
        <LogOut className="h-4 w-4" />
      </button>
    </div>
  );
}
