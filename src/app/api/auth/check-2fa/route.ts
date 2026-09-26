import { NextRequest, NextResponse } from "next/server";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { email: rawEmail, password } = await req.json();
  const email = typeof rawEmail === "string" ? rawEmail.trim().toLowerCase() : "";
  if (!email || typeof password !== "string" || !password) {
    return NextResponse.json({ totpEnabled: false });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return NextResponse.json({ totpEnabled: false });

  const passwordValid = await compare(password, user.passwordHash);
  if (!passwordValid) return NextResponse.json({ totpEnabled: false });

  return NextResponse.json({ totpEnabled: user.totpEnabled });
}
