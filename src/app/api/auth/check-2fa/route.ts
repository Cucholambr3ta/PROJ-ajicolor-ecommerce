import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (typeof email !== "string" || !email) {
    return NextResponse.json({ totpEnabled: false });
  }

  const user = await prisma.user.findUnique({ where: { email }, select: { totpEnabled: true } });
  return NextResponse.json({ totpEnabled: user?.totpEnabled ?? false });
}
