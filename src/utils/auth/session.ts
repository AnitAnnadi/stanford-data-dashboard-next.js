import { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { Roles } from "@prisma/client";
import { prisma } from "../db";
import { accessPayload, refreshPayload } from "../types";

export type RouteSession = {
  userId: string;
  role: Roles;
  isTeacher: boolean;
};

// Route handlers under /api are outside the middleware matcher, so nothing has
// authenticated the caller by the time they run. Anything that gates on a role
// must resolve it here, from the signed session cookies, rather than from query
// params the caller controls.
export const getSessionFromRequest = async (
  request: NextRequest
): Promise<RouteSession | null> => {
  const secretKey = new TextEncoder().encode(process.env.JWT_SECRET);

  const accessToken = request.cookies.get("access");
  if (accessToken) {
    try {
      const { payload } = await jwtVerify<accessPayload>(
        accessToken.value,
        secretKey
      );
      return {
        userId: payload.userId,
        role: payload.role,
        isTeacher: payload.isTeacher,
      };
    } catch {
      // Access tokens last an hour and are only refreshed by the middleware on
      // page navigations, so an expired one is expected on a long-open tab.
      // Fall through to the refresh token instead of rejecting the request.
    }
  }

  const refreshToken = request.cookies.get("refresh");
  if (!refreshToken) return null;

  try {
    const { payload } = await jwtVerify<refreshPayload>(
      refreshToken.value,
      secretKey
    );

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, role: true, isTeacher: true },
    });
    if (!user) return null;

    return {
      userId: user.id,
      role: user.role,
      isTeacher: user.isTeacher,
    };
  } catch {
    return null;
  }
};
