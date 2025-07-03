import { prisma } from "@/utils/db";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (request: NextRequest) => {
  const url = new URL(request.url);
  const userId = url.searchParams.get("userId");

  const user = await prisma.user.findUnique({
    where: {
      id: userId as string,
    },
    select: {
      id: true,
      name: true,
      role: true,
      isTeacher: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ user }, { status: 200 });
};
