import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const rol = (req.auth?.user as { rol?: string } | undefined)?.rol;
  const isOnAdmin = req.nextUrl.pathname.startsWith("/admin");
  const isOnClienteArea =
    req.nextUrl.pathname.startsWith("/perfil") || req.nextUrl.pathname.startsWith("/carrito");

  if (isOnAdmin && (!isLoggedIn || rol === "Cliente")) {
    return NextResponse.redirect(new URL("/login", req.nextUrl.origin));
  }

  if (isOnClienteArea && (!isLoggedIn || rol !== "Cliente")) {
    return NextResponse.redirect(new URL("/login-cliente", req.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/perfil/:path*", "/carrito/:path*"],
};
