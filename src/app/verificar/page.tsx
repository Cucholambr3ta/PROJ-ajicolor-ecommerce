import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/Footer";
import { SiteHeader } from "@/components/SiteHeader";
import { verifyEmail } from "@/lib/actions/auth-recovery";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Verificar email", robots: { index: false, follow: false } };

export default async function VerificarPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const result = token ? await verifyEmail(token) : { ok: false as const, error: "Falta el enlace de verificación" };

  return (
    <div className="min-h-screen bg-ajicolor-light dark:bg-[var(--bg-light)] flex flex-col">
      <SiteHeader />

      <main className="max-w-md mx-auto py-20 p-8 flex-1 text-center">
        {result.ok ? (
          <>
            <div className="w-20 h-20 rounded-full bg-ajicolor-green mx-auto mb-6 flex items-center justify-center text-white text-4xl font-black">
              ✓
            </div>
            <h1 className="text-2xl font-black mb-3">Email verificado</h1>
            <p className="text-gray-500 dark:text-neutral-400 mb-8">Tu cuenta ya está confirmada.</p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-black mb-3">Enlace inválido</h1>
            <p className="text-gray-500 dark:text-neutral-400 mb-8">{result.error}</p>
          </>
        )}
        <Link href="/cuenta" className="btn-block bg-ajicolor-yellow inline-flex">
          Ir a mi cuenta
        </Link>
      </main>

      <Footer />
    </div>
  );
}
