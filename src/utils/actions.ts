"use server";
import { prisma } from "./db";
import { customAlphabet } from "nanoid";
import {
  createLocationSchema,
  registerSchema,
  selectUserLocationSchema,
  validateWithZodSchema,
} from "./schemas";
import bcrypt from "bcrypt";
import { Roles } from "@prisma/client";
import { attachCookie, createJWT } from "./attatchCookies";
import { findLocation } from "./locationFilters";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { accessPayload, refreshPayload, UserLocationWithoutId } from "./types";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

const renderError = (
  error: unknown
): { message: string; errorMessage: boolean } => {
  console.log(error);
  return {
    message: error instanceof Error ? error.message : "an error occurred",
    errorMessage: true,
  };
};

export const getUser = async () => {
  const cookieStore = await cookies();
  const secretKey = new TextEncoder().encode(process.env.JWT_SECRET);

  const accessToken = cookieStore.get("access");

  if (!accessToken) {
    throw Error("Unauthenticated");
  }

  const { payload } = await jwtVerify<accessPayload>(
    accessToken.value,
    secretKey
  );

  return payload;
};

export const getUserFromDb = async () => {
  const { userId } = await getUser();

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    omit: {
      password: true,
    },
  });

  if (user) {
    return user;
  }

  return redirect("/login");
};

export const register = async (prevState: any, formData: FormData) => {
  try {
    const rawData = Object.fromEntries(formData);
    const validatedFields = validateWithZodSchema(registerSchema, rawData);

    const user = await prisma.user.findFirst({
      where: {
        email: validatedFields.email,
      },
    });

    if (user) {
      throw Error("Email already exists");
    }

    const teacher = validatedFields.role.includes("teacher");
    const role = validatedFields.role.replace("-teacher", "");
    const classroomCode = customAlphabet("abcdefghjkmnpqrstuvwxyz23456789", 7);

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(validatedFields.password, salt);

    await prisma.user.create({
      data: {
        name: validatedFields.name,
        email: validatedFields.email,
        password: hashedPassword,
        role: Roles[role as keyof typeof Roles],
        isTeacher: teacher,
        code: classroomCode(),
      },
    });
    return { message: "Successfully registered", redirect: "/login" };
  } catch (error) {
    return renderError(error);
  }
};

export const login = async (prevState: any, formData: FormData) => {
  try {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const user = await prisma.user.findFirst({
      where: {
        email: email,
      },
    });

    if (!user) {
      throw Error("Incorrect credentials");
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      throw Error("Incorrect credentials");
    }

    const refreshPayload: refreshPayload = { userId: user.id };
    const oneDay = 60 * 60 * 24 * 1000;
    const refreshToken = await createJWT(refreshPayload, "1d");
    await attachCookie("refresh", refreshToken, oneDay);

    const accessPayload: accessPayload = {
      name: user.name,
      userId: user.id,
      role: user.role,
      isTeacher: user.isTeacher,
    };
    const oneHour = 60 * 60 * 1000;
    const accessToken = await createJWT(accessPayload, "1h");
    await attachCookie("access", accessToken, oneHour);

    const redirect = user.isTeacher ? "/dashboard" : "/dashboard/metrics";

    return { message: "Successfully logged in", redirect };
  } catch (error) {
    return renderError(error);
  }
};

export const addUserLocation = async (prevState: any, formData: FormData) => {
  try {
    const rawData = Object.fromEntries(formData);
    const validatedFields = validateWithZodSchema(
      selectUserLocationSchema,
      rawData
    );
    const { role, userId, isTeacher } = await getUser();

    const userLocation: UserLocationWithoutId = {
      userId,
      country: validatedFields.country,
      state: validatedFields.state || null,
      county: validatedFields.county || null,
      city: validatedFields.city || null,
      district: validatedFields.district || null,
      school: validatedFields.school || null,
      multiplePeriods: validatedFields.multiplePeriods === "true",
      approved: true,
    };

    if (
      validatedFields.state &&
      validatedFields.city &&
      validatedFields.school
    ) {
      const districtAndCounty = findLocation({
        state: validatedFields.state,
        city: validatedFields.city,
        school: validatedFields.school,
      });

      userLocation.state = validatedFields.state;
      userLocation.district = districtAndCounty.district;
      userLocation.county = districtAndCounty.county;
    }

    const dbUserLocation = await prisma.userLocation.findFirst({
      where: { userId },
    });
    if (dbUserLocation && role !== Roles.teacher && role !== Roles.stanford) {
      if (isTeacher && role !== Roles.site) {
        if (userLocation[role] !== dbUserLocation[role]) {
          throw Error(
            `You can only add locations within the same ${role} of your first school: ${dbUserLocation[role]}`
          );
        }
      } else {
        if (role === Roles.site) {
          throw Error(
            `You are not allowed to submit a location either because you already have a location or have a location pending.`
          );
        }

        throw Error(`${role} admin are only allowed to submit one location`);
      }
    }

    await prisma.userLocation.create({
      data: {
        ...userLocation,
      },
    });

    const redirect = isTeacher ? "/dashboard" : "/dashboard/metrics";

    return { message: "Successfully added location", redirect };
  } catch (error) {
    return renderError(error);
  }
};

export const createLocation = async (prevState: any, formData: FormData) => {
  try {
    const rawData = Object.fromEntries(formData);
    const validatedFields = validateWithZodSchema(
      createLocationSchema,
      rawData
    );

    const { role, userId, isTeacher } = await getUser();

    const userLocation: UserLocationWithoutId = {
      userId,
      country: validatedFields.country,
      state: validatedFields.state || null,
      county: validatedFields.county || null,
      city: validatedFields.city,
      district: validatedFields.district || null,
      school: validatedFields.school,
      multiplePeriods: validatedFields.multiplePeriods === "true",
      approved: false,
    };

    const dbUserLocation = await prisma.userLocation.findFirst({
      where: { userId },
    });
    if (dbUserLocation && role !== Roles.teacher && role !== Roles.stanford) {
      if (isTeacher && role !== Roles.site) {
        if (userLocation[role] !== dbUserLocation[role]) {
          throw Error(
            `You can only create locations within the same ${role} of your first school: ${dbUserLocation[role]}`
          );
        }
      } else {
        if (role === Roles.site) {
          throw Error(
            `You are not allowed to create a location either because you already have a location or have a location pending.`
          );
        }

        throw Error(`${role} admin are not allowed to create a location`);
      }
    }

    await prisma.userLocation.create({
      data: {
        ...userLocation,
      },
    });

    return {
      message: "Successfully requested location",
      redirect: "/pendingLocation",
    };
  } catch (error) {
    return renderError(error);
  }
};

export const getUserLocationCount = async () => {
  const { userId } = await getUser();

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

  return { numApprovedUserLocations, numPendingUserLocations };
};

export const getUserLocations = async () => {
  const { userId } = await getUser();

  const userLocations = await prisma.userLocation.findMany({
    where: {
      userId,
      approved: true,
    },
  });

  return userLocations;
};

export const getPendingUserLocations = async () => {
  const userLocations = await prisma.userLocation.findMany({
    where: {
      approved: false,
    },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  return userLocations;
};

export const approveLocationRequest = async (
  prevState: any,
  formData: FormData
) => {
  const { userLocationId } = prevState;

  await prisma.userLocation.update({
    where: { id: userLocationId },
    data: {
      approved: true,
    },
  });

  revalidatePath("/dashboard/manageLocations");
  return { message: "Location request approved" };
};

export const declineLocationRequest = async (
  prevState: any,
  formData: FormData
) => {
  const { userLocationId } = prevState;

  await prisma.userLocation.delete({
    where: { id: userLocationId },
  });

  revalidatePath("/dashboard/manageLocations");
  return { message: "Location request declined" };
};
