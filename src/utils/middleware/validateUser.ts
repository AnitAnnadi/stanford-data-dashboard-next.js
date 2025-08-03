import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { createJWT } from "../attatchCookies";
import { accessPayload, refreshPayload } from "../types";

const getUser = async (userId: string, requestUrl: string) => {
  const url = new URL(`/api/users?userId=${userId}`, requestUrl);
  const res = await fetch(url.toString());

  if (!res.ok) {
    throw new Error("User not found");
  }

  const { user } = await res.json();

  return user;
};

const validateUser = async (request: NextRequest, response: NextResponse) => {
  const refreshToken = request.cookies.get("refresh");
  const accessToken = request.cookies.get("access");

  console.log(accessToken, refreshToken);

  const secretKey = new TextEncoder().encode(process.env.JWT_SECRET);

  if (accessToken) {
    const { payload } = await jwtVerify<accessPayload>(
      accessToken.value,
      secretKey
    );
    const user = await getUser(payload.userId, request.url);
    return {
      userId: user.id,
      role: user.role,
      isTeacher: user.isTeacher,
    };
  }

  if (!refreshToken) {
    throw new Error("No refresh token");
  }

  const { payload } = await jwtVerify<refreshPayload>(
    refreshToken.value,
    secretKey
  );

  const user = await getUser(payload.userId, request.url);
  const accessTokenPayload: accessPayload = {
    name: user.name,
    userId: user.id,
    role: user.role,
    isTeacher: user.isTeacher,
  };
  const token = await createJWT(accessTokenPayload, "1h");
  const oneHour = 60 * 60 * 1000;

  response.cookies.set({
    name: "access",
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: new Date(Date.now() + oneHour),
    path: "/",
  });

  return { userId: user.id, role: user.role, isTeacher: user.isTeacher };
};

export default validateUser;
