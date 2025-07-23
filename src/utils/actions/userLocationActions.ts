"use server";
import { prisma } from "../db";
import {
  selectUserLocationSchema,
  createLocationSchema,
  validateWithZodSchema,
} from "../schemas";
import { Roles } from "@prisma/client";
import { UserLocationWithoutId } from "../types";
import { renderError } from "../helpers";
import { getUser } from "./userActions";
import { revalidatePath } from "next/cache";

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
      multiplePeriods: validatedFields.multiplePeriods,
      approved: true,
    };

    if (
      validatedFields.state &&
      validatedFields.city &&
      validatedFields.school
    ) {
      const completeLocation = await prisma.location.findFirst({
        where: {
          state: validatedFields.city,
          city: validatedFields.city,
          school: validatedFields.school,
        },
      });

      userLocation.state = validatedFields.state;
      if (completeLocation?.district && completeLocation?.county) {
        userLocation.district = completeLocation.district;
        userLocation.county = completeLocation.county;
      }
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
      multiplePeriods: validatedFields.multiplePeriods,
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

export const getUserLocations = async (userId: string) => {
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

export const declineLocationRequest = async (
  prevState: any,
  formData: FormData
) => {
  try {
    const { userLocationId } = prevState;

    await prisma.userLocation.delete({
      where: { id: userLocationId },
    });

    revalidatePath("/dashboard/manageLocations");
    return { message: "Location request declined" };
  } catch (error) {
    return renderError(error);
  }
};

export const approveLocationRequest = async (
  prevState: any,
  formData: FormData
) => {
  try {
    const { userLocationId } = prevState;

    const userLocation = await prisma.userLocation.update({
      where: { id: userLocationId },
      data: {
        approved: true,
      },
    });

    await prisma.location.create({
      data: {
        country: userLocation.country,
        state: userLocation.state,
        county: userLocation.county,
        district: userLocation.district,
        city: userLocation.city as string,
        school: userLocation.school as string,
      },
    });

    revalidatePath("/dashboard/manageLocations");
    return {
      message: "Location request approved",
      redirect: "/dashboard/manageLocations",
    };
  } catch (error) {
    return renderError(error);
  }
};
