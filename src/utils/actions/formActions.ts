"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "../db";
import { renderError } from "../helpers";
import {
  addFormSchema,
  questionsSchema,
  updateFormSchema,
  validateWithZodSchema,
} from "../schemas";
import { ensureStanfordUser } from "./userActions";
import { redirect } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { question } from "../types";
import { Prisma, SurveyTypes } from "@prisma/client";

// Ids of questions that already have at least one stored answer. An option's
// `code` is the only thing responses record, so changing it on a question that
// has been answered would retroactively reinterpret existing data — these are
// the questions whose codes stay locked.
export const getAnsweredQuestionIds = async (
  formId: string
): Promise<string[]> => {
  const [teacherCount, noCodeCount] = await Promise.all([
    prisma.responseWithTeacher.count({ where: { formId } }),
    prisma.responseWithoutTeacher.count({ where: { formId } }),
  ]);

  if (teacherCount + noCodeCount === 0) return [];

  const pipeline = [
    { $match: { formId: { $oid: formId } } },
    { $project: { ids: "$answers.questionId" } },
    { $unwind: "$ids" },
    { $group: { _id: "$ids" } },
  ] as unknown as Prisma.InputJsonValue[];

  const [fromTeacher, fromNoCode] = (await Promise.all([
    teacherCount > 0
      ? prisma.responseWithTeacher.aggregateRaw({ pipeline })
      : Promise.resolve([]),
    noCodeCount > 0
      ? prisma.responseWithoutTeacher.aggregateRaw({ pipeline })
      : Promise.resolve([]),
  ])) as unknown as Array<Array<{ _id: string }>>;

  return [
    ...new Set([...fromTeacher, ...fromNoCode].map((row) => row._id)),
  ];
};

// Prisma's `mode: "insensitive"` compiles to an unescaped regex on MongoDB, so
// titles containing regex metacharacters ("LGBTQ+ Curriculum", "(elem)") match
// nothing at all. Titles are compared in JS against the full form list, which
// is small, rather than through a case-insensitive query.
const sameTitle = (a: string, b: string) =>
  a.trim().toLowerCase() === b.trim().toLowerCase();

const getFormIndex = () =>
  prisma.form.findMany({ select: { id: true, title: true, type: true } });

export const addForm = async (prevState: any, formData: FormData) => {
  try {
    await ensureStanfordUser();

    const rawData = Object.fromEntries(formData);
    rawData.questions = JSON.parse(rawData.questions as string).map(
      (question: question) => {
        const id = uuidv4();

        return { ...question, id, name: question.name };
      }
    );
    const validatedFields = validateWithZodSchema(addFormSchema, rawData);

    const existingForms = await getFormIndex();

    const dbForm = existingForms.find(
      (f) =>
        sameTitle(f.title, validatedFields.title) &&
        f.type === validatedFields.type
    );

    if (dbForm) {
      throw Error("A form with this title and type already exists.");
    }

    if (validatedFields.type === "post") {
      const preForm = existingForms.find(
        (f) => sameTitle(f.title, validatedFields.title) && f.type === "pre"
      );

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

export const duplicateForm = async (prevState: any, formData: FormData) => {
  void formData;
  try {
    await ensureStanfordUser();

    const { formId, title: customTitle, type: rawType } = prevState;
    const source = await prisma.form.findUnique({ where: { id: formId } });

    if (!source) throw Error("Form not found");

    // The copy's type is chosen in the duplicate dialog (defaulting to the
    // counterpart's) so a finished pre-survey can be turned into its post
    // without re-entering every question. It falls back to the source's type
    // when no choice is passed.
    const type: SurveyTypes = rawType === "pre" || rawType === "post"
      ? rawType
      : source.type;
    const title = (customTitle || `Copy of ${source.title}`).trim();

    // Same guards addForm applies: pre and post are paired by identical title
    // throughout the app, so a title is unique per type and a post cannot
    // exist without its pre.
    const existingForms = await getFormIndex();

    if (existingForms.find((f) => sameTitle(f.title, title) && f.type === type)) {
      throw Error("A form with this title and type already exists.");
    }

    if (
      type === "post" &&
      !existingForms.find((f) => sameTitle(f.title, title) && f.type === "pre")
    ) {
      throw Error(
        "A matching 'pre' form with the same title must exist before creating a 'post' form"
      );
    }

    await prisma.form.create({
      data: {
        title,
        type,
        active: false,
        // Certificates are a post-survey-only feature, so a pre copy of a
        // certificate-bearing post has to drop the flag.
        provideCertificate: type === "pre" ? false : source.provideCertificate,
        questions: {
          set: source.questions.map((q: any) => ({
            ...q,
            id: uuidv4(),
          })),
        },
      },
    });

    revalidatePath("/dashboard/manageForms");
    return { message: "Successfully duplicated form" };
  } catch (error) {
    return renderError(error);
  }
};

export const deleteForm = async (prevState: any, formData: FormData) => {
  void formData;
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

// Returns the type of the paired survey ("pre"/"post") when one exists, so the
// edit page can offer to mirror new questions onto it.
export const getCounterpartType = async (formId: string) => {
  const form = await prisma.form.findUnique({
    where: { id: formId },
    select: { title: true, type: true },
  });
  if (!form) return null;

  const counterpartType = form.type === "pre" ? "post" : "pre";
  const forms = await getFormIndex();
  const counterpart = forms.find(
    (f) => sameTitle(f.title, form.title) && f.type === counterpartType
  );

  return counterpart ? counterpartType : null;
};

export const updateForm = async (prevState: any, formData: FormData) => {
  try {
    await ensureStanfordUser();

    const rawData = Object.fromEntries(formData.entries());
    const validatedFields = validateWithZodSchema(updateFormSchema, rawData);

    const form = await prisma.form.findUnique({
      where: {
        id: validatedFields.formId,
      },
    });

    if (!form) {
      throw Error("Invalid form id");
    }

    if (form.type === "pre" && validatedFields.provideCertificate) {
      throw Error("You cannot enable certificates for pre-surveys");
    }

    const newTitle = validatedFields.title;
    const titleChanged = newTitle !== form.title;

    // Pre and post surveys are paired by identical title throughout the app
    // (student routing, the export's sheet grouping, certificates), so a
    // rename has to move the counterpart with it or the pair silently breaks.
    // Ids are minted here, not taken from the browser: a stale or duplicated
    // client id could collide with an existing question and silently merge new
    // answers into old data.
    const newQuestions = validatedFields.newQuestions
      ? validateWithZodSchema(
          questionsSchema,
          (JSON.parse(validatedFields.newQuestions) as object[]).map((q) => ({
            ...q,
            id: uuidv4(),
          }))
        )
      : [];

    const needsCounterpart = titleChanged || newQuestions.length > 0;
    const allForms = needsCounterpart ? await getFormIndex() : [];

    const counterpartType = form.type === "pre" ? "post" : "pre";
    const counterpart = needsCounterpart
      ? (allForms.find(
          (f) => sameTitle(f.title, form.title) && f.type === counterpartType
        ) ?? null)
      : null;

    if (titleChanged) {
      const renamedIds = new Set(
        [form.id, counterpart?.id].filter(Boolean) as string[]
      );
      const typesBeingRenamed = counterpart
        ? ["pre", "post"]
        : [form.type as string];

      const conflict = allForms.find(
        (f) =>
          sameTitle(f.title, newTitle) &&
          typesBeingRenamed.includes(f.type) &&
          !renamedIds.has(f.id)
      );

      if (conflict) {
        throw Error(
          `A ${conflict.type}-survey named "${newTitle}" already exists.`
        );
      }
    }

    const updateData: Parameters<typeof prisma.form.update>[0]["data"] = {
      title: newTitle,
      active: validatedFields.active,
      provideCertificate: validatedFields.provideCertificate,
    };

    // The builder UI uses "" for an unset matrix group while Prisma stores
    // null; normalize so both paths write the same shape.
    const normalize = <T extends { matrixGroup?: string | null }>(q: T) => ({
      ...q,
      matrixGroup: q.matrixGroup || null,
    });

    const mintQuestions = () =>
      newQuestions.map((q) => ({ ...normalize(q), id: uuidv4() }));

    // The client hides code inputs on answered questions, but that is a UI
    // affordance, not a guarantee — re-apply the stored codes here so a forged
    // payload cannot recode data that has already been collected.
    const answeredIds = new Set(await getAnsweredQuestionIds(form.id));
    const storedById = new Map(form.questions.map((q) => [q.id, q]));

    const keepCodesIfAnswered = <
      T extends {
        id: string;
        question: string;
        options: Array<{ text: string; code: number }>;
      },
    >(
      q: T
    ): T => {
      const stored = storedById.get(q.id);
      if (!stored || !answeredIds.has(q.id)) return q;

      if (stored.options.length !== q.options.length) {
        throw Error(
          `"${stored.question}" already has responses, so its options cannot be added or removed.`
        );
      }

      return {
        ...q,
        options: q.options.map((o, i) => ({
          ...o,
          code: stored.options[i].code,
        })),
      } as T;
    };

    const existingQuestions = validatedFields.questions
      ? validateWithZodSchema(
          questionsSchema,
          JSON.parse(validatedFields.questions)
        )
          .map(normalize)
          .map(keepCodesIfAnswered)
      : form.questions;

    if (validatedFields.questions) {
      // Dropping a question from the payload is how deletion is expressed, so
      // confirm nothing that holds answers was dropped — those responses would
      // survive in the database but become unreachable.
      const submittedIds = new Set(existingQuestions.map((q) => q.id));
      const removedAnswered = form.questions.find(
        (q) => answeredIds.has(q.id) && !submittedIds.has(q.id)
      );

      if (removedAnswered) {
        throw Error(
          `"${removedAnswered.question}" already has responses and cannot be deleted.`
        );
      }
    }

    if (existingQuestions.length + newQuestions.length === 0) {
      throw Error("A form must have at least 1 question");
    }

    if (validatedFields.questions || newQuestions.length > 0) {
      updateData.questions = {
        set: [...existingQuestions, ...mintQuestions()],
      };
    }

    await prisma.form.update({
      where: { id: validatedFields.formId },
      data: updateData,
    });

    // Mirror additions onto the paired survey so a question added to the pre
    // does not go missing from the post (which would silently drop it from the
    // pre/post comparison). Questions are paired across surveys by `name`, so
    // the copy keeps the name but gets its own id.
    let mirroredCount = 0;
    if (counterpart) {
      const counterpartData: Parameters<typeof prisma.form.update>[0]["data"] =
        {};

      if (titleChanged) counterpartData.title = newTitle;

      if (newQuestions.length > 0 && validatedFields.mirrorNewQuestions) {
        const counterpartForm = await prisma.form.findUnique({
          where: { id: counterpart.id },
          select: { questions: true },
        });

        if (counterpartForm) {
          const existingNames = new Set(
            counterpartForm.questions.map((q) =>
              (q.name ?? q.question).trim().toLowerCase()
            )
          );
          const toMirror = mintQuestions().filter(
            (q) => !existingNames.has(q.name.trim().toLowerCase())
          );

          if (toMirror.length > 0) {
            mirroredCount = toMirror.length;
            counterpartData.questions = {
              set: [...counterpartForm.questions, ...toMirror],
            };
          }
        }
      }

      if (Object.keys(counterpartData).length > 0) {
        await prisma.form.update({
          where: { id: counterpart.id },
          data: counterpartData,
        });
      }
    }

    revalidatePath("/dashboard/manageForms");

    const notes: string[] = [];
    if (titleChanged && counterpart) {
      notes.push(`the matching ${counterpartType}-survey was renamed too`);
    }
    if (newQuestions.length > 0) {
      notes.push(
        `added ${newQuestions.length} question${newQuestions.length === 1 ? "" : "s"}`
      );
    }
    if (mirroredCount > 0) {
      notes.push(`mirrored ${mirroredCount} onto the ${counterpartType}-survey`);
    }

    return {
      message: notes.length
        ? `Successfully updated form (${notes.join("; ")}).`
        : "Successfully updated form",
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

export const emailCertificate = async (prevState: any, formData: FormData) => {
  try {
    const studentName = formData.get("name") as string;
    const studentEmail = formData.get("email") as string;
    const formTitle = formData.get("formTitle") as string;
    const teacherEmail = formData.get("teacherEmail") as string;
    const teacherName = formData.get("teacherName") as string;

    if (!studentName || !teacherEmail || !teacherName || !formTitle) {
      throw Error("Missing required fields");
    }

    // Generate certificate PDF
    const { generateCertificate } = await import("../certificate/generate");

    const certificatePdf = await generateCertificate({
      studentName,
      formTitle,
      completionDate: new Date(),
    });

    // Import the email function
    const { sendFormCompletionEmail } = await import(
      "../email/certificate-email"
    );

    // Send notification to teacher with certificate attached
    await sendFormCompletionEmail(
      teacherEmail,
      teacherName,
      formTitle,
      new Date(),
      studentName,
      certificatePdf
    );

    // Send certificate to student email if provided
    if (studentEmail) {
      await sendFormCompletionEmail(
        studentEmail,
        studentName,
        formTitle,
        new Date(),
        studentName,
        certificatePdf
      );
    }

    // Return success with PDF data for display
    return {
      message: "Successfully sent notifications",
      certificateUrl: `data:application/pdf;base64,${certificatePdf.toString("base64")}`,
    };
  } catch (error) {
    return renderError(error);
  }
};
