import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
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
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 60,
  },
  pages: {
    signIn: "/login-cliente",
  },
  callbacks: {
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
