"use server";
import { prisma } from "../db";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { accessPayload } from "../types";
import { renderError } from "../helpers";
import { toast } from "sonner";

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

export const findUserByCode = async (prevState: any, formData: FormData) => {
  try {
    const code = formData.get("code") as string;

    const teacher = await prisma.user.findUnique({
      where: { code },
      select: { id: true, name: true },
    });

    if (!teacher) {
      throw Error("Invalid teacher code");
    }

    return {
      message: "Successfully joined form",
      redirect: `/student/details/${teacher.id}/${teacher.name}`,
    };
  } catch (error) {
    return renderError(error);
  }
};
