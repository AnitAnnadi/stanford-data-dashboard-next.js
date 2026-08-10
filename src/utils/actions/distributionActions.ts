"use server";
import { prisma } from "../db";
import { Prisma, Roles, SurveyTypes } from "@prisma/client";
import { getUser } from "./userActions";

const MIN_RESPONSES = 10;

export type DistributionFilters = {
  form: string;
  type: SurveyTypes;
  version?: string;
  country?: string;
  state?: string;
  county?: string;
  district?: string;
  city?: string;
  school?: string;
  startDate?: string;
  endDate?: string;
};

export type CompareFilters = Omit<DistributionFilters, "type">;

export type OptionCount = {
  code: number;
  text: string;
  count: number;
  pct: number;
};

export type QuestionDistribution = {
  id: string;
  question: string;
  matrixGroup: string | null;
  answered: number;
  options: OptionCount[];
};

export type FormVersion = {
  label: string;
  title: string;
};

export type DistributionResult = {
  mode: "single";
  suppressed: boolean;
  total: number;
  formTitle: string;
  versions: FormVersion[];
  selectedVersion: string;
  type: SurveyTypes;
  questions: QuestionDistribution[];
};

export type CompareOptionCount = {
  code: number;
  text: string;
  preCount: number;
  prePct: number;
  postCount: number;
  postPct: number;
};

export type CompareQuestion = {
  id: string;
  question: string;
  matrixGroup: string | null;
  preAnswered: number | null;
  postAnswered: number | null;
  options: CompareOptionCount[];
};

export type CompareSide = {
  exists: boolean;
  suppressed: boolean;
  total: number;
};

export type ComparisonResult = {
  mode: "compare";
  formTitle: string;
  versions: FormVersion[];
  selectedVersion: string;
  pre: CompareSide;
  post: CompareSide;
  questions: CompareQuestion[];
};

type FormVariant = {
  id: string;
  title: string;
  type: SurveyTypes;
  active: boolean;
  questions: Array<{
    id: string;
    question: string;
    name: string | null;
    matrixGroup: string | null;
    showInTeacherExport: boolean;
    options: Array<{ code: number; text: string }>;
  }>;
};

// Version variants share the selected title plus a trailing year, e.g.
// "Safety First" and "Safety First 2023". Titles are matched in JS: Prisma's
// startsWith builds an unescaped Mongo regex, so titles with parentheses
// never match it.
const resolveVersions = async (selectedForm: string) => {
  const baseName = selectedForm.replace(/\s+\d{4}$/, "");
  const allTitles = await prisma.form.findMany({ select: { title: true } });
  const isVariantTitle = (title: string) =>
    title === baseName ||
    (title.startsWith(`${baseName} `) &&
      /^\d{4}$/.test(title.slice(baseName.length).trim()));
  const versionTitles = [
    ...new Set(allTitles.map((f) => f.title).filter(isVariantTitle)),
  ].sort();
  const variants: FormVariant[] = await prisma.form.findMany({
    where: { title: { in: versionTitles } },
    select: { id: true, title: true, type: true, questions: true, active: true },
  });
  const versions: FormVersion[] = versionTitles.map((title) => ({
    title,
    label: title === baseName ? "Current" : title.slice(baseName.length).trim(),
  }));
  return { baseName, versions, versionTitles, variants };
};

// Builds the response-level $match constraints (geography clamped to the
// viewer's role, plus date range). `empty` means the geo filter matched no
// locations at all.
const buildResponseMatch = async (
  role: Roles,
  userId: string,
  filters: CompareFilters
): Promise<{ empty: boolean; match: Record<string, unknown> }> => {
  const match: Record<string, unknown> = {};

  const whereLocation: Record<string, unknown> = { approved: true };

  if (role === Roles.teacher) {
    whereLocation.userId = userId;
    match.teacherId = { $oid: userId };
  } else if (role !== Roles.stanford) {
    const adminLocation = await prisma.userLocation.findFirst({
      where: { userId },
      select: {
        country: true,
        state: true,
        county: true,
        district: true,
        city: true,
        school: true,
      },
    });

    if (adminLocation) {
      whereLocation.country = {
        equals: adminLocation.country,
        mode: "insensitive",
      };
      if (role !== Roles.country && adminLocation.state) {
        whereLocation.state = {
          equals: adminLocation.state,
          mode: "insensitive",
        };
      }
      if (
        role === Roles.county ||
        role === Roles.district ||
        role === Roles.site
      ) {
        if (adminLocation.county)
          whereLocation.county = {
            equals: adminLocation.county,
            mode: "insensitive",
          };
      }
      if (role === Roles.district || role === Roles.site) {
        if (adminLocation.district)
          whereLocation.district = {
            equals: adminLocation.district,
            mode: "insensitive",
          };
      }
      if (role === Roles.site) {
        if (adminLocation.city)
          whereLocation.city = {
            equals: adminLocation.city,
            mode: "insensitive",
          };
        if (adminLocation.school)
          whereLocation.school = {
            equals: adminLocation.school,
            mode: "insensitive",
          };
      }
    }
  }

  const filterKeys = [
    "country",
    "state",
    "county",
    "district",
    "city",
    "school",
  ] as const;
  for (const key of filterKeys) {
    const val = filters[key];
    if (val && val !== "All" && !whereLocation[key]) {
      whereLocation[key] = { equals: val, mode: "insensitive" };
    }
  }

  // A location $in list is only needed when geography is actually
  // constrained; for an unrestricted Stanford view the list would span
  // every UserLocation and only slow the query down.
  const geoConstrained =
    Object.keys(whereLocation).filter((k) => k !== "approved" && k !== "userId")
      .length > 0 || role === Roles.teacher;
  if (geoConstrained) {
    const userLocations = await prisma.userLocation.findMany({
      where: whereLocation,
      select: { id: true },
    });
    if (userLocations.length === 0) {
      return { empty: true, match };
    }
    match.teacherLocationId = {
      $in: userLocations.map((l) => ({ $oid: l.id })),
    };
  }

  const createdAt: Record<string, unknown> = {};
  if (filters.startDate) {
    createdAt.$gte = { $date: `${filters.startDate}T00:00:00.000Z` };
  }
  if (filters.endDate) {
    createdAt.$lte = { $date: `${filters.endDate}T23:59:59.999Z` };
  }
  if (Object.keys(createdAt).length > 0) {
    match.createdAt = createdAt;
  }

  return { empty: false, match };
};

const aggregateResponses = async (
  formId: string,
  baseMatch: Record<string, unknown>
): Promise<{ total: number; countMap: Map<string, number> }> => {
  const match = { ...baseMatch, formId: { $oid: formId } };

  const rawResults = (await prisma.responseWithTeacher.aggregateRaw({
    pipeline: [
      { $match: match as Prisma.InputJsonObject },
      {
        $facet: {
          total: [{ $count: "n" }],
          counts: [
            { $unwind: "$answers" },
            {
              $group: {
                _id: {
                  questionId: "$answers.questionId",
                  optionCode: "$answers.optionCode",
                },
                count: { $sum: 1 },
              },
            },
          ],
        },
      },
    ],
  })) as unknown as Array<{
    total: Array<{ n: number }>;
    counts: Array<{
      _id: { questionId: string; optionCode: number };
      count: number;
    }>;
  }>;

  const facet = rawResults[0];
  const total = facet?.total?.[0]?.n ?? 0;
  const countMap = new Map<string, number>();
  for (const row of facet?.counts ?? []) {
    countMap.set(`${row._id.questionId}:${row._id.optionCode}`, row.count);
  }
  return { total, countMap };
};

const visibleQuestions = (form: FormVariant, showAll: boolean) =>
  form.questions.filter((q) => showAll || q.showInTeacherExport);

const buildQuestions = (
  form: FormVariant,
  countMap: Map<string, number>,
  showAll: boolean
): QuestionDistribution[] =>
  visibleQuestions(form, showAll).map((q) => {
    const options = q.options.map((o) => ({
      code: o.code,
      text: o.text,
      count: countMap.get(`${q.id}:${o.code}`) ?? 0,
    }));
    const answered = options.reduce((sum, o) => sum + o.count, 0);
    return {
      id: q.id,
      question: q.question,
      matrixGroup: q.matrixGroup ?? null,
      answered,
      options: options.map((o) => ({
        ...o,
        pct: answered > 0 ? Math.round((o.count / answered) * 1000) / 10 : 0,
      })),
    };
  });

export const getDistribution = async (
  filters: DistributionFilters
): Promise<DistributionResult | { error: string }> => {
  try {
    const { role, userId, isTeacher } = await getUser();

    if (!filters.form || filters.form === "All") {
      return { error: "Select a form to view charts" };
    }

    const { baseName, versions, versionTitles, variants } =
      await resolveVersions(filters.form);

    const selectedTitle =
      filters.version && versionTitles.includes(filters.version)
        ? filters.version
        : baseName;

    const candidates = variants.filter((v) => v.title === selectedTitle);
    const form =
      candidates.find((v) => v.type === filters.type) ?? candidates[0];

    if (!form) {
      return { error: "No survey found for this form version" };
    }

    const emptyResult = (total: number): DistributionResult => ({
      mode: "single",
      suppressed: true,
      total,
      formTitle: form.title,
      versions,
      selectedVersion: selectedTitle,
      type: form.type,
      questions: [],
    });

    const scope = await buildResponseMatch(role, userId, filters);
    if (scope.empty) {
      return emptyResult(0);
    }

    const { total, countMap } = await aggregateResponses(form.id, scope.match);

    if (total < MIN_RESPONSES) {
      return emptyResult(total);
    }

    const showAll = role === Roles.stanford || !isTeacher;

    return {
      mode: "single",
      suppressed: false,
      total,
      formTitle: form.title,
      versions,
      selectedVersion: selectedTitle,
      type: form.type,
      questions: buildQuestions(form, countMap, showAll),
    };
  } catch (error) {
    console.error("getDistribution failed:", error);
    return { error: "Failed to load distribution" };
  }
};

const questionKey = (q: { name: string | null; question: string }) =>
  (q.name ?? q.question).trim().toLowerCase();

export const getPrePostDistribution = async (
  filters: CompareFilters
): Promise<ComparisonResult | { error: string }> => {
  try {
    const { role, userId, isTeacher } = await getUser();

    if (!filters.form || filters.form === "All") {
      return { error: "Select a form to view charts" };
    }

    const { baseName, versions, versionTitles, variants } =
      await resolveVersions(filters.form);

    const selectedTitle =
      filters.version && versionTitles.includes(filters.version)
        ? filters.version
        : baseName;

    const candidates = variants.filter((v) => v.title === selectedTitle);
    const preForm = candidates.find((v) => v.type === SurveyTypes.pre) ?? null;
    const postForm =
      candidates.find((v) => v.type === SurveyTypes.post) ?? null;

    if (!preForm && !postForm) {
      return { error: "No survey found for this form version" };
    }

    const scope = await buildResponseMatch(role, userId, filters);

    const emptySide: CompareSide = { exists: false, suppressed: false, total: 0 };

    const aggregateSide = async (
      form: FormVariant | null
    ): Promise<{ side: CompareSide; countMap: Map<string, number> }> => {
      if (!form) return { side: emptySide, countMap: new Map() };
      if (scope.empty) {
        return {
          side: { exists: true, suppressed: true, total: 0 },
          countMap: new Map(),
        };
      }
      const { total, countMap } = await aggregateResponses(
        form.id,
        scope.match
      );
      if (total < MIN_RESPONSES) {
        return {
          side: { exists: true, suppressed: true, total },
          countMap: new Map(),
        };
      }
      return { side: { exists: true, suppressed: false, total }, countMap };
    };

    const [preAgg, postAgg] = await Promise.all([
      aggregateSide(preForm),
      aggregateSide(postForm),
    ]);

    const showAll = role === Roles.stanford || !isTeacher;
    const preUsable = preAgg.side.exists && !preAgg.side.suppressed;
    const postUsable = postAgg.side.exists && !postAgg.side.suppressed;

    const preQs = preForm && preUsable ? visibleQuestions(preForm, showAll) : [];
    const postQs =
      postForm && postUsable ? visibleQuestions(postForm, showAll) : [];

    const postByKey = new Map(postQs.map((q) => [questionKey(q), q]));
    const usedPostKeys = new Set<string>();

    type SideQuestion = (typeof preQs)[number];

    const buildCompareQuestion = (
      preQ: SideQuestion | null,
      postQ: SideQuestion | null
    ): CompareQuestion => {
      const lead = (preQ ?? postQ)!;

      const optionOrder: Array<{ code: number; text: string }> = [];
      const seenCodes = new Set<number>();
      for (const src of [preQ, postQ]) {
        if (!src) continue;
        for (const o of src.options) {
          if (!seenCodes.has(o.code)) {
            seenCodes.add(o.code);
            optionOrder.push({ code: o.code, text: o.text });
          }
        }
      }

      const counts = optionOrder.map((o) => ({
        code: o.code,
        text: o.text,
        preCount: preQ ? (preAgg.countMap.get(`${preQ.id}:${o.code}`) ?? 0) : 0,
        postCount: postQ
          ? (postAgg.countMap.get(`${postQ.id}:${o.code}`) ?? 0)
          : 0,
      }));

      const preAnswered = preQ
        ? counts.reduce((sum, o) => sum + o.preCount, 0)
        : null;
      const postAnswered = postQ
        ? counts.reduce((sum, o) => sum + o.postCount, 0)
        : null;

      return {
        id: lead.id,
        question: lead.question,
        matrixGroup: lead.matrixGroup ?? null,
        preAnswered,
        postAnswered,
        options: counts.map((o) => ({
          ...o,
          prePct:
            preAnswered && preAnswered > 0
              ? Math.round((o.preCount / preAnswered) * 1000) / 10
              : 0,
          postPct:
            postAnswered && postAnswered > 0
              ? Math.round((o.postCount / postAnswered) * 1000) / 10
              : 0,
        })),
      };
    };

    const questions: CompareQuestion[] = [];
    for (const preQ of preQs) {
      const key = questionKey(preQ);
      const postQ = postByKey.get(key) ?? null;
      if (postQ) usedPostKeys.add(key);
      questions.push(buildCompareQuestion(preQ, postQ));
    }
    for (const postQ of postQs) {
      if (!usedPostKeys.has(questionKey(postQ))) {
        questions.push(buildCompareQuestion(null, postQ));
      }
    }

    return {
      mode: "compare",
      formTitle: selectedTitle,
      versions,
      selectedVersion: selectedTitle,
      pre: preAgg.side,
      post: postAgg.side,
      questions,
    };
  } catch (error) {
    console.error("getPrePostDistribution failed:", error);
    return { error: "Failed to load pre/post comparison" };
  }
};
