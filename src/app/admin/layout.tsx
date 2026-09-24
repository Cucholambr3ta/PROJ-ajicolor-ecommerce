import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { Sidebar } from "@/components/ui/sidebar";
import { UserNav } from "@/components/user-nav";

export const metadata: Metadata = {
  title: {
    default: "Panel Admin",
    template: "%s | Ajicolor Admin",
  },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div className="flex h-screen bg-ajicolor-light dark:bg-[var(--bg-light)]">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white dark:bg-neutral-900 border-b-2 border-ajicolor-ink flex items-center justify-end px-6">
          <UserNav user={session?.user} />
        </header>
        <main className="flex-1 overflow-y-auto p-8">{children}</main>
      </div>
    </div>
  );
}
