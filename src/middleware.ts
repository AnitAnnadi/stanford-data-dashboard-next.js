import { NextRequest, NextResponse } from "next/server";
import validateUser from "./utils/middleware/validateUser";
import authorizeRoute from "./utils/middleware/authorizeRoute";

export const middleware = async (request: NextRequest) => {
  try {
    const response = NextResponse.next();
    const { userId, role, isTeacher } = await validateUser(request, response);
    const authorizeResponse = await authorizeRoute(
      request,
      userId,
      role,
      isTeacher
    );

    if (authorizeResponse) {
      const cookies = response.headers.getSetCookie?.() ?? [];
      for (const cookie of cookies) {
        authorizeResponse.headers.append("set-cookie", cookie);
      }
      return authorizeResponse;
    }

    return response;
  } catch (error) {
    console.log(error);
    return NextResponse.redirect(new URL("/login", request.url));
  }
};

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/selectUserLocation",
    "/createUserLocation",
    "/pendingUserLocation",
  ],
};
