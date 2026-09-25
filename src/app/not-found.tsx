import Link from "next/link";
import { Logo } from "@/components/Logo";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-ajicolor-light dark:bg-[var(--bg-light)] flex flex-col items-center justify-center text-center p-8">
      <Logo className="h-10 w-auto mb-8" />
      <h1 className="text-6xl font-black text-ajicolor-magenta mb-2">404</h1>
      <p className="text-lg font-bold mb-8">Esta página no existe.</p>
      <Link href="/" className="btn-block bg-ajicolor-yellow">
        Volver al catálogo
      </Link>
    </div>
  );
}
