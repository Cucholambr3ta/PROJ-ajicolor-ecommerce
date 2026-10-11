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
    <div className="flex h-screen bg-ajicolor-light bg-[url('/fondo/fondo-claro.png')] bg-repeat [background-size:520px] [background-attachment:fixed] dark:bg-[var(--bg-light)] dark:bg-[url('/fondo/fondo-oscuro.png')] dark:bg-repeat dark:[background-size:520px] dark:[background-attachment:fixed] print:bg-none">
      <div className="no-print contents">
        <Sidebar />
      </div>
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="no-print h-16 bg-[url('/fondo/fondo-claro.png')] bg-repeat [background-size:520px] [background-attachment:fixed] dark:bg-[url('/fondo/fondo-oscuro.png')] dark:bg-repeat dark:[background-size:520px] dark:[background-attachment:fixed] border-b-2 border-ajicolor-ink flex items-center justify-end px-6">
          <UserNav user={session?.user} />
        </header>
        <main className="flex-1 overflow-y-auto p-8">{children}</main>
      </div>
    </div>
  );
}
