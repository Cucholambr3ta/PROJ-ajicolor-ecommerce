"use client";

import { signOut } from "next-auth/react";
import { LogOut, User } from "lucide-react";
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
      <Link
        href="/admin/seguridad"
        className="flex items-center gap-2 pl-2 pr-4 py-1.5 thick-border pop-shadow-sm bg-white dark:bg-neutral-900 transition-transform hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none"
        title="Ir a Seguridad"
      >
        {user?.image ? (
          <img
            src={user.image}
            alt={user.name ?? "User"}
            className="h-8 w-8 rounded-full border-2 border-ajicolor-ink"
          />
        ) : (
          <div className="h-8 w-8 rounded-full bg-ajicolor-purple flex items-center justify-center">
            <User className="h-4 w-4 text-white" />
          </div>
        )}
        <span className="text-sm font-semibold">
          {user?.name ?? user?.email ?? "Admin"}
        </span>
      </Link>
      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="p-2 rounded-md text-gray-400 dark:text-neutral-500 hover:text-ajicolor-magenta hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
        title="Cerrar sesión"
      >
        <LogOut className="h-4 w-4" />
      </button>
    </div>
  );
}
