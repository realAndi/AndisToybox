import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { nanoid } from "nanoid";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const inviteCode = nanoid(10);

  const code = await prisma.inviteCode.create({
    data: {
      code: inviteCode,
      createdBy: session.user.id,
    },
  });

  return NextResponse.json({ code: code.code });
}