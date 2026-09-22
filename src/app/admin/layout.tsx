import { auth } from "@/lib/auth";
import { Sidebar } from "@/components/ui/sidebar";
import { UserNav } from "@/components/user-nav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div className="flex h-screen bg-ajicolor-paper">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b-4 border-ajicolor-ink flex items-center justify-end px-6">
          <UserNav user={session?.user} />
        </header>
        <main className="flex-1 overflow-y-auto p-8">{children}</main>
      </div>
    </div>
  );
}
