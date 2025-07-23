import { z, ZodSchema, ZodTypeDef } from "zod";
import { getRequiredLocationFields } from "./helpers";

export function validateWithZodSchema<T>(
  schema: ZodSchema<T, ZodTypeDef, unknown>,
  data: unknown
): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const errors = result.error.errors.map((error) => error.message);
    throw new Error(errors.join(", "));
  }
  return result.data;
}

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, {
        message: "Name must be at least 2 characters",
      })
      .max(100, {
        message: "Name must be less than 100 characters",
      }),
    email: z.string().email("Invalid email format"),
    password: z
      .string()
      .min(8, {
        message: "Password must be at least 8 characters",
      })
      .max(20, {
        message: "Password must be less than 20 characters",
      }),
    confirmPassword: z.string(),
    country: z.string(),
    role: z.enum([
      "teacher",
      "site",
      "district",
      "county",
      "state",
      "country",
      "stanford",
      "site-teacher",
      "district-teacher",
      "county-teacher",
      "state-teacher",
    ]),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })
  .refine(
    (data) => {
      if (
        data.country !== "United States" &&
        !["teacher", "site", "site-teacher", "country"].includes(data.role)
      ) {
        return false;
      }

      return true;
    },
    {
      message: "Only certain roles allowed outside the United States",
      path: ["role"],
    }
  );

export const selectUserLocationSchema = z
  .object({
    role: z.enum(["teacher", "site", "district", "county", "state", "country"]),
    isTeacher: z.enum(["true", "false"]).transform((val) => val === "true"),
    country: z.string().min(1, "Country cannnot be empty"),
    state: z.string().optional(),
    county: z.string().optional(),
    city: z.string().optional(),
    district: z.string().optional(),
    school: z.string().optional(),
    multiplePeriods: z
      .enum(["true", "false"])
      .transform((val) => val === "true"),
  })
  .superRefine((data, ctx) => {
    const {
      canAccessNonUS,
      requireState,
      requireCounty,
      requireDistrict,
      requireCityAndSchool,
    } = getRequiredLocationFields({
      country: data.country,
      role: data.role,
      isTeacher: data.isTeacher,
    });

    if (!canAccessNonUS && data.country !== "United States") {
      ctx.addIssue({
        path: ["country"],
        code: z.ZodIssueCode.custom,
        message: "Only United States is allowed for your role",
      });
    }

    if (requireState && !data.state) {
      ctx.addIssue({
        path: ["state"],
        code: z.ZodIssueCode.custom,
        message: "State is a required field",
      });
    }

    if (requireCounty && !data.county) {
      ctx.addIssue({
        path: ["county"],
        code: z.ZodIssueCode.custom,
        message: "County is a required field",
      });
    }

    if (requireDistrict && !data.district) {
      ctx.addIssue({
        path: ["district"],
        code: z.ZodIssueCode.custom,
        message: "District is a required field",
      });
    }

    if (requireCityAndSchool && !data.city) {
      ctx.addIssue({
        path: ["city"],
        code: z.ZodIssueCode.custom,
        message: "City is a required field",
      });
    }

    if (requireCityAndSchool && !data.school) {
      ctx.addIssue({
        path: ["school"],
        code: z.ZodIssueCode.custom,
        message: "School is a required field",
      });
    }
  });

export const createLocationSchema = z
  .object({
    role: z.enum(["teacher", "site", "district", "county", "state"]),
    isTeacher: z.enum(["true", "false"]).transform((val) => val === "true"),
    country: z.string().min(1, "Country cannot be empty"),
    state: z.string().optional(),
    county: z.string().optional(),
    city: z
      .string()
      .min(2, {
        message: "City must be at least 2 characters",
      })
      .max(100, {
        message: "City must be less than 100 characters",
      }),
    district: z.string().optional(),
    school: z
      .string()
      .min(2, {
        message: "School must be at least 2 characters",
      })
      .max(100, {
        message: "School must be less than 100 characters",
      }),
    multiplePeriods: z
      .enum(["true", "false"])
      .transform((val) => val === "true"),
  })
  .superRefine((data, ctx) => {
    if (data.country === "United States") {
      if (!data.state) {
        ctx.addIssue({
          path: ["state"],
          code: z.ZodIssueCode.custom,
          message: "State is required for United States locations",
        });
      }

      if (!data.county) {
        ctx.addIssue({
          path: ["county"],
          code: z.ZodIssueCode.custom,
          message: "County is required for United States locations",
        });
      }

      if (!data.district) {
        ctx.addIssue({
          path: ["district"],
          code: z.ZodIssueCode.custom,
          message: "District is required for United States locations",
        });
      }
    }
  });

const OptionSchema = z.object({
  text: z.string().min(1, "Option text cannot be empty"),
  code: z.number(),
});

const QuestionSchema = z.object({
  question: z.string().min(1, "Question cannot be empty"),
  options: z.array(OptionSchema),
});

export const addFormSchema = z
  .object({
    title: z.string().min(1, "Title cannot be empty"),
    type: z.enum(["pre", "post"]),
    active: z.enum(["true", "false"]).transform((val) => val === "true"),
    askForStudentName: z
      .enum(["true", "false"])
      .transform((val) => val === "true"),
    questions: z.array(QuestionSchema),
  })
  .superRefine((data, ctx) => {
    if (data.questions.length === 0) {
      ctx.addIssue({
        path: ["questions"],
        code: z.ZodIssueCode.custom,
        message: "Each form must have at least 1 question",
      });
    }

    data.questions.forEach((question, questionIndex) => {
      if (question.options.length === 0) {
        ctx.addIssue({
          path: ["questions"],
          code: z.ZodIssueCode.custom,
          message: `Question ${questionIndex + 1} must have at least 1 option`,
        });
      }

      const optionCodes: number[] = [];
      question.options.forEach((option) => {
        if (optionCodes.includes(option.code)) {
          ctx.addIssue({
            path: ["questions"],
            code: z.ZodIssueCode.custom,
            message: `Question ${questionIndex + 1} contains a duplicate code`,
          });
        }

        optionCodes.push(option.code);
      });
    });
  });

export const updateFormSchema = z.object({
  formId: z.string(),
  title: z.string().min(1, "Title cannot be empty"),
  active: z.enum(["true", "false"]).transform((val) => val === "true"),
  askForStudentName: z
    .enum(["true", "false"])
    .transform((val) => val === "true"),
});
