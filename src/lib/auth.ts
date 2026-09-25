import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { compare } from "bcryptjs";
import { authenticator } from "otplib";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      id: "admin-login",
      name: "Admin",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        totpToken: { label: "Código 2FA", type: "text" },
      },
      async authorize(credentials) {
        const email = (credentials?.email as string | undefined)?.trim().toLowerCase();
        const password = credentials?.password as string | undefined;
        const totpToken = credentials?.totpToken as string | undefined;

        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;

        const passwordValid = await compare(password, user.passwordHash);
        if (!passwordValid) return null;

        if (user.totpEnabled) {
          if (!totpToken || !user.totpSecret) return null;
          const totpValid = authenticator.verify({ token: totpToken, secret: user.totpSecret });
          if (!totpValid) return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.email,
          rol: user.rol,
        };
      },
    }),
    Credentials({
      id: "cliente-login",
      name: "Cliente",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = (credentials?.email as string | undefined)?.trim().toLowerCase();
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        const customer = await prisma.customer.findUnique({ where: { email } });
        if (!customer || !customer.passwordHash) return null;

        const valid = await compare(password, customer.passwordHash);
        if (!valid) return null;

        return { id: customer.id, email: customer.email, name: customer.nombre, rol: "Cliente" };
      },
    }),
    // Solo se activa si AUTH_GOOGLE_ID/SECRET están en el entorno — si no
    // existen, Auth.js omite el provider silenciosamente y el resto del
    // login (admin/cliente por contraseña) sigue funcionando igual.
    ...(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET
      ? [Google({ allowDangerousEmailAccountLinking: true })]
      : []),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 60,
  },
  pages: {
    signIn: "/login-cliente",
  },
  callbacks: {
    // Solo corre para el provider Google — Credentials ya resuelve todo en
    // authorize(). Nunca toca la tabla User (admins): un login con Google
    // siempre crea o vincula un Customer.
    async signIn({ user, account, profile }) {
      if (account?.provider !== "google") return true;
      if (!profile?.email_verified || !user.email) return false;

      const email = user.email.trim().toLowerCase();
      const existing = await prisma.customer.findUnique({ where: { email } });

      if (existing) {
        await prisma.customer.update({
          where: { id: existing.id },
          data: {
            googleId: existing.googleId ?? account.providerAccountId,
            image: existing.image ?? user.image ?? undefined,
            emailVerified: existing.emailVerified ?? new Date(),
          },
        });
        user.id = existing.id;
      } else {
        const created = await prisma.customer.create({
          data: {
            nombre: user.name ?? email.split("@")[0],
            email,
            googleId: account.providerAccountId,
            image: user.image,
            emailVerified: new Date(),
          },
        });
        user.id = created.id;
      }

      user.rol = "Cliente";
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.rol = user.rol;
        token.id = user.id as string;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.rol = token.rol;
      session.user.id = token.id;
      return session;
    },
  },
});
