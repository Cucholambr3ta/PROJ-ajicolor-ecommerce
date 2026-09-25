import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import { Logo } from "@/components/Logo";
import CartIcon from "@/components/CartIcon";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SiteHeaderMobileMenu } from "@/components/SiteHeaderMobileMenu";

const NAV_LINKS = [
  { href: "/conoce-al-aji", label: "Conoce al Ají" },
  { href: "/", label: "Catálogo" },
  { href: "/contacto", label: "Contacto" },
];

export async function SiteHeader({ active }: { active?: string }) {
  const session = await auth();
  const isCliente = session?.user?.rol === "Cliente";

  return (
    <nav className="site-nav relative">
      <Link href="/">
        <Logo />
      </Link>

      <div className="hidden lg:flex gap-10 font-bold text-sm text-ajicolor-purple">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={active === link.href ? "underline decoration-2 underline-offset-4" : ""}
          >
            {link.label}
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-5">
        <Link
          href="/login"
          className="hidden lg:inline text-[10px] font-bold text-gray-300 dark:text-neutral-600 hover:text-gray-500 dark:hover:text-neutral-400 uppercase"
        >
          Admin
        </Link>
        <CartIcon />
        {isCliente ? (
          <>
            <Link href="/cuenta" className="hidden sm:inline btn-block bg-ajicolor-yellow">
              Mi cuenta
            </Link>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}
              className="hidden sm:block"
            >
              <button className="text-xs font-bold uppercase text-gray-400 dark:text-neutral-500 hover:text-ajicolor-magenta">
                Salir
              </button>
            </form>
          </>
        ) : (
          <Link href="/login-cliente" className="hidden sm:inline btn-block bg-ajicolor-yellow">
            Login
          </Link>
        )}
        <ThemeToggle />
        <SiteHeaderMobileMenu
          isCliente={isCliente}
          authLinkHref={isCliente ? "/cuenta" : "/login-cliente"}
          authLinkLabel={isCliente ? "Mi cuenta" : "Login"}
        />
      </div>
    </nav>
  );
}
