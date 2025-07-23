"use server";
import { prisma } from "../db";
import { customAlphabet } from "nanoid";
import { registerSchema, validateWithZodSchema } from "../schemas";
import bcrypt from "bcrypt";
import { Roles } from "@prisma/client";
import { attachCookie, createJWT } from "../attatchCookies";
import { accessPayload, refreshPayload } from "../types";
import { renderError } from "../helpers";

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
