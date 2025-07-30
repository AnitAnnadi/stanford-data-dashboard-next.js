"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "../db";
import { renderError } from "../helpers";
import {
  addFormSchema,
  updateFormSchema,
  validateWithZodSchema,
} from "../schemas";
import { ensureStanfordUser } from "./userActions";
import { redirect } from "next/navigation";

export const addForm = async (prevState: any, formData: FormData) => {
  try {
    await ensureStanfordUser();

    const rawData = Object.fromEntries(formData);
    rawData.questions = JSON.parse(rawData.questions as string);
    const validatedFields = validateWithZodSchema(addFormSchema, rawData);

    const dbForm = await prisma.form.findFirst({
      where: {
        title: { equals: validatedFields.title, mode: "insensitive" },
        type: validatedFields.type,
      },
    });

    if (dbForm) {
      throw Error("A form with this title and type already exists.");
    }

    if (validatedFields.type === "post") {
      const preForm = await prisma.form.findFirst({
        where: {
          title: { equals: validatedFields.title, mode: "insensitive" },
          type: "pre",
        },
      });

      if (!preForm) {
        throw Error(
          "A matching 'pre' form with the same title must exist before creating a 'post' form"
        );
      }
    }

    await prisma.form.create({
      data: {
        ...validatedFields,
      },
    });

    return {
      message: "Successfully added form",
      redirect: "/dashboard/manageForms",
    };
  } catch (error) {
    return renderError(error);
  }
};

export const getAllForms = async () => {
  const forms = await prisma.form.findMany({
    // omit: {
    //   questions: true,
    // },
    orderBy: {
      createdAt: "desc",
    },
  });

  return forms;
};

export const deleteForm = async (prevState: any, formData: FormData) => {
  try {
    await ensureStanfordUser();

    const { formId } = prevState;
    await prisma.form.delete({
      where: {
        id: formId,
      },
    });

    revalidatePath("/dashboard/manageForms");
    return { message: "Succesfully deleted form" };
  } catch (error) {
    return renderError(error);
  }
};

export const getSingleForm = async (formId: string) => {
  const form = await prisma.form.findUnique({ where: { id: formId } });

  if (form) {
    return form;
  }

  return redirect("/dashboard/manageForms");
};

export const updateForm = async (prevState: any, formData: FormData) => {
  try {
    await ensureStanfordUser();

    const rawData = Object.fromEntries(formData.entries());
    const validatedFields = validateWithZodSchema(updateFormSchema, rawData);

    await prisma.form.update({
      where: {
        id: validatedFields.formId,
      },
      data: {
        title: validatedFields.title,
        active: validatedFields.active,
        askForStudentName: validatedFields.askForStudentName,
      },
    });

    return {
      message: "Succesfully updated form",
      redirect: "/dashboard/manageForms",
    };
  } catch (error) {
    return renderError(error);
  }
};

export const getActiveForms = async () => {
  const activeForms = await prisma.form.findMany({
    where: {
      active: true,
    },
    select: {
      title: true,
    },
  });

  const titles = activeForms.map((form) => form.title);
  return new Set(titles);
};

export const getSingleActiveForm = async (formId: string) => {
  const form = await prisma.form.findUnique({
    where: {
      id: formId,
      active: true,
    },
  });

  if (form) {
    return form;
  }

  return redirect("/");
};

export const submitForm = async (prevState: any, formData: FormData) => {
  try {
    const rawData = Object.fromEntries(formData);
    console.log(rawData);

    return { message: "Successfully submited form" };
  } catch (error) {
    return renderError(error);
  }
};
