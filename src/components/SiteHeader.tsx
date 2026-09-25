import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import { Logo } from "@/components/Logo";
import CartIcon from "@/components/CartIcon";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SiteHeaderMobileMenu } from "@/components/SiteHeaderMobileMenu";
import { LoginButtonWithDrawer } from "@/components/LoginButtonWithDrawer";
import { HeaderSearch } from "@/components/HeaderSearch";
import { HeaderSocialIcons } from "@/components/HeaderSocialIcons";

const NAV_LINKS = [
  { href: "/", label: "Catálogo" },
  { href: "/categorias", label: "Categorías" },
  { href: "/drops", label: "Drops" },
  { href: "/cotizador", label: "Cotizador" },
  { href: "/conoce-al-aji", label: "Conoce al Ají" },
  { href: "/contacto", label: "Contacto" },
];

export async function SiteHeader({ active }: { active?: string }) {
  const session = await auth();
  const isCliente = session?.user?.rol === "Cliente";

  return (
    <nav className="site-nav relative">
      <div className="site-nav-top">
        <HeaderSocialIcons />

        <Link href="/" className="mx-auto lg:mx-0">
          <Logo />
        </Link>

        <div className="flex items-center gap-2 sm:gap-4">
          <HeaderSearch />
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
            <LoginButtonWithDrawer className="hidden sm:inline btn-block bg-ajicolor-yellow" />
          )}
          <ThemeToggle />
          <SiteHeaderMobileMenu isCliente={isCliente} />
        </div>
      </div>

      <div className="site-nav-bottom hidden lg:flex font-bold text-sm text-ajicolor-purple">
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
    </nav>
  );
}
