import { prisma } from "@/utils/db";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (request: NextRequest) => {
  const url = new URL(request.url);
  const { country, state, county, district, city, returnType } =
    Object.fromEntries(url.searchParams.entries());

  const locations = await prisma.userLocation.findMany({
    where: {
      country,
      state,
      county,
      district,
      city,
    },
    select: {
      [returnType]: true,
    },
  });

  return NextResponse.json({ locations }, { status: 200 });
};
