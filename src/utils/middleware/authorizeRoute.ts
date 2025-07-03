import { Roles } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const authorizeRoute = async (
  request: NextRequest,
  userId: string,
  role: Roles,
  isTeacher: boolean
) => {
  const pathname = request.nextUrl.pathname;

  const url = new URL(`/api/userLocations?userId=${userId}`, request.url);
  const res = await fetch(url.toString());
  const { numApprovedUserLocations, numPendingUserLocations } =
    await res.json();

  const redirect = isTeacher ? "/dashboard" : "/dashboard/metrics";

  let roleClassification = "admin";
  if (role === "stanford") {
    roleClassification = "stanford";
  } else if (isTeacher) {
    if (role === "site") {
      roleClassification = "siteAndTeacher";
    } else {
      roleClassification = "teacher";
    }
  }

  if (
    numPendingUserLocations === 1 &&
    role === "site" &&
    pathname !== "/pendingUserLocation"
  ) {
    return NextResponse.redirect(new URL("/pendingUserLocation", request.url));
  }

  const routesAccessibleWithoutUserLocation =
    isTeacher || role === "site"
      ? ["/selectUserLocation", "/createLocation", "/pendingUserLocation"]
      : ["/selectUserLocation"];

  if (
    numApprovedUserLocations === 0 &&
    !routesAccessibleWithoutUserLocation.includes(pathname) &&
    role !== "stanford"
  ) {
    return NextResponse.redirect(new URL("/selectUserLocation", request.url));
  }

  if (
    numApprovedUserLocations === 0 &&
    (roleClassification === "admin" || roleClassification === "siteAndTeacher")
  ) {
    return;
  }

  const restrictedRoutes: Record<string, string[]> = {
    stanford: ["/dashboard", "/createLocation", "/pendingUserLocation"],
    admin: [
      "/dashboard",
      "/selectUserLocation",
      "/createLocation",
      "/pendingUserLocation",
      "/dashboard/manageForms",
      "/dashboard/manageLocations",
    ],
    siteAndTeacher: [
      "/selectUserLocation",
      "/createLocation",
      "/pendingUserLocation",
      "/dashboard/manageForms",
      "/dashboard/manageLocations",
    ],
    teacher: ["/dashboard/manageForms", "/dashboard/manageLocations"],
  };

  if (restrictedRoutes[roleClassification].includes(pathname)) {
    return NextResponse.redirect(new URL(redirect, request.url));
  }
};

export default authorizeRoute;
