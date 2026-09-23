"use client";

import { signOut } from "next-auth/react";
import { LogOut, User, ShieldCheck } from "lucide-react";
import Link from "next/link";

interface UserNavProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  } | null;
}

export function UserNav({ user }: UserNavProps) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        {user?.image ? (
          <img
            src={user.image}
            alt={user.name ?? "User"}
            className="h-9 w-9 rounded-full border-2 border-ajicolor-ink"
          />
        ) : (
          <div className="h-9 w-9 rounded-full bg-ajicolor-purple flex items-center justify-center">
            <User className="h-4 w-4 text-white" />
          </div>
        )}
        <span className="text-sm font-semibold">
          {user?.name ?? user?.email ?? "Admin"}
        </span>
      </div>
      <Link
        href="/admin/seguridad"
        className="p-1.5 text-gray-400 hover:text-ajicolor-magenta transition-colors rounded-md hover:bg-gray-100"
        title="Seguridad"
      >
        <ShieldCheck className="h-4 w-4" />
      </Link>
      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="p-2 rounded-md text-gray-400 hover:text-ajicolor-magenta hover:bg-gray-100 transition-colors"
        title="Cerrar sesión"
      >
        <LogOut className="h-4 w-4" />
      </button>
    </div>
  );
}
