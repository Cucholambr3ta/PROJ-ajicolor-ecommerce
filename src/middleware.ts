import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { ADMIN_ROLES } from "@/lib/auth-guard";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const rol = req.auth?.user?.rol;
  const isAdmin = !!rol && ADMIN_ROLES.includes(rol as (typeof ADMIN_ROLES)[number]);
  const isOnAdmin = req.nextUrl.pathname.startsWith("/admin");
  const isOnClienteArea =
    req.nextUrl.pathname.startsWith("/perfil") ||
    req.nextUrl.pathname.startsWith("/carrito") ||
    req.nextUrl.pathname.startsWith("/checkout") ||
    req.nextUrl.pathname.startsWith("/pedido");

  if (isOnAdmin && (!isLoggedIn || !isAdmin)) {
    const url = new URL("/login", req.nextUrl.origin);
    url.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  if (isOnClienteArea && (!isLoggedIn || rol !== "Cliente")) {
    const url = new URL("/login-cliente", req.nextUrl.origin);
    url.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/perfil/:path*", "/carrito/:path*", "/checkout/:path*", "/pedido/:path*"],
};
