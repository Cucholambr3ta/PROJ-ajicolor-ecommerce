import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import { Logo } from "@/components/Logo";
import CartIcon from "@/components/CartIcon";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SiteHeaderMobileMenu } from "@/components/SiteHeaderMobileMenu";
import { LoginButtonWithDrawer } from "@/components/LoginButtonWithDrawer";
import { HeaderSearch } from "@/components/HeaderSearch";
import { HeaderSocialIcons } from "@/components/HeaderSocialIcons";
import { SiteHeaderNav } from "@/components/SiteHeaderNav";

export async function SiteHeader() {
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

      <SiteHeaderNav />
    </nav>
  );
}
