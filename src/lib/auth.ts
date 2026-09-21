import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { authenticator } from "otplib";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        totpToken: { label: "Código 2FA", type: "text" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
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
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 60,
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.rol = (user as any).rol;
      }
      return token;
    },
    async session({ session, token }) {
      (session.user as any).rol = token.rol;
      return session;
    },
  },
});
