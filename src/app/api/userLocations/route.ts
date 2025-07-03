import { prisma } from "@/utils/db";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (request: NextRequest) => {
  const url = new URL(request.url);
  const userId = url.searchParams.get("userId");

  const userLocations = await prisma.userLocation.findMany({
    where: {
      userId: userId as string,
    },
  });

  let numApprovedUserLocations = 0;
  let numPendingUserLocations = 0;

  for (let i = 0; i < userLocations.length; i++) {
    if (userLocations[i].approved) {
      numApprovedUserLocations += 1;
    } else {
      numPendingUserLocations += 1;
    }
  }

  return NextResponse.json(
    { numApprovedUserLocations, numPendingUserLocations },
    { status: 200 }
  );
};
