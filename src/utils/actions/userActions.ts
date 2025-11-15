"use server";
import { prisma } from "../db";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { accessPayload } from "../types";
import { renderError } from "../helpers";
import { validateWithZodSchema } from "../schemas";
import { updateUserSchema } from "../schemas";
import { revalidatePath } from "next/cache";

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

export const ensureStanfordUser = async () => {
  const { role } = await getUser();
  if (role !== "stanford") {
    throw Error("Unauthorized to perform this action");
  }
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

export const findUserByCode = async (prevState: any, formData: FormData) => {
  try {
    const formId = formData.get("formId") as string;
    const code = formData.get("code") as string;

    const teacher = await prisma.user.findUnique({
      where: { code },
      select: { id: true, name: true },
    });

    if (!teacher) {
      throw Error("Invalid teacher code");
    }

    return {
      message: "",
      redirect: `/student/details/${formId}/${teacher.id}/${teacher.name}`,
    };
  } catch (error) {
    return renderError(error);
  }
};

export const updateUser = async (prevState: any, formData: FormData) => {
  try {
    const rawData = Object.fromEntries(formData);
    const validatedFields = validateWithZodSchema(updateUserSchema, rawData);
    const { userId } = await getUser();

    await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        name: validatedFields.name,
      },
    });

    revalidatePath("/dashboard/settings");
    return {
      message: "Successfully updated name",
    };
  } catch (error) {
    return renderError(error);
  }
};
