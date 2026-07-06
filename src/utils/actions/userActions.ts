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
import { Roles } from "@prisma/client";
import {
  sendStanfordApprovedEmail,
  sendStanfordDeclinedEmail,
} from "../email/templates/stanfordApprovalEmail";
import { isStanfordApproverEmail } from "../stanfordApprovers";

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

// Stanford-admin approvals are restricted to the people listed in
// STANFORD_APPROVER_EMAILS (e.g. Holly and Scott), not every Stanford admin.
export const isStanfordApprover = async () => {
  const { userId, role } = await getUser();
  if (role !== Roles.stanford) return false;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });

  return isStanfordApproverEmail(user?.email);
};

export const ensureStanfordApprover = async () => {
  if (!(await isStanfordApprover())) {
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
      redirect: `/student/details/${formId}/${teacher.id}/${encodeURIComponent(teacher.name)}`,
    };
  } catch (error) {
    return renderError(error);
  }
};

export const getPendingStanfordUsers = async () => {
  await ensureStanfordApprover();

  const users = await prisma.user.findMany({
    where: {
      role: Roles.stanford,
      approved: false,
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });

  return users;
};

export const getStanfordAdmins = async () => {
  await ensureStanfordApprover();

  const users = await prisma.user.findMany({
    where: {
      role: Roles.stanford,
      approved: true,
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  return users;
};

export const approveStanfordUser = async (prevState: any, formData: FormData) => {
  void formData;
  try {
    await ensureStanfordApprover();
    const { userId } = prevState;

    const pending = await prisma.user.findUnique({ where: { id: userId } });
    if (!pending || pending.role !== Roles.stanford || pending.approved) {
      throw Error("Invalid Stanford admin request");
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { approved: true },
    });

    if (user.email) {
      await sendStanfordApprovedEmail(user.email, user.name);
    }

    revalidatePath("/dashboard/manageStanfordAdmins");
    return { message: "Stanford admin request approved" };
  } catch (error) {
    return renderError(error);
  }
};

export const declineStanfordUser = async (prevState: any, formData: FormData) => {
  void formData;
  try {
    await ensureStanfordApprover();
    const { userId } = prevState;

    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user || user.role !== Roles.stanford || user.approved) {
      throw Error("Invalid Stanford admin request");
    }

    await prisma.user.delete({ where: { id: userId } });

    if (user.email) {
      await sendStanfordDeclinedEmail(user.email, user.name);
    }

    revalidatePath("/dashboard/manageStanfordAdmins");
    return { message: "Stanford admin request declined" };
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
