import fs from "fs";
import path from "path";
import { prisma } from "@/utils/db";
import { NextRequest, NextResponse } from "next/server";
import ExcelJS from "exceljs";

export async function GET(request: NextRequest) {
  try {
    console.time("EXPORT_TOTAL");
    console.log("Export started...");

    const url = new URL(request.url);
    const get = (k: string) => url.searchParams.get(k);

    // ------------------------------
    // 1) Build location filters
    // ------------------------------
    console.log(" Computing location filters...");
    const whereLocation: any = { approved: true };
    const filterKeys = [
      "country",
      "state",
      "county",
      "district",
      "city",
      "school",
    ];

    for (const key of filterKeys) {
      const val = get(key);
      if (val && val !== "All") whereLocation[key] = val;
    }
    console.log("Location filter:", whereLocation);

    console.time("DB_LOCATIONS");
    const userLocations = await prisma.userLocation.findMany({
      where: whereLocation,
      select: { id: true },
    });
    console.timeEnd("DB_LOCATIONS");

    const userLocationIds = userLocations.map((l) => l.id);
    console.log(`Matched Locations: ${userLocationIds.length}`);

    if (userLocationIds.length === 0) {
      return NextResponse.json(
        { message: "No locations found" },
        { status: 200 }
      );
    }

    // ------------------------------
    // 2) Build response filters
    // ------------------------------
    const whereResponses: any = {
      teacherLocationId: { in: userLocationIds },
    };

    const form = get("form");
    const role = get("role");
    const userId = get("userId");
    const startDate = get("startDate");
    const endDate = get("endDate");

    if (form && form !== "All") {
      console.time("DB_FORM_LOOKUP");
      const matchingForms = await prisma.form.findMany({
        where: { title: form },
        select: { id: true },
      });
      console.timeEnd("DB_FORM_LOOKUP");

      if (matchingForms.length === 0) {
        return NextResponse.json(
          { error: `No forms found with title: ${form}` },
          { status: 400 }
        );
      }

      const formIds = matchingForms.map((f: any) => f.id);
      whereResponses.formId = { in: formIds };

      console.log(`Resolved "${form}" to formIds:`, formIds);
    }

    if (role === "teacher" && userId) whereResponses.teacherId = userId;

    // Add date range filtering
    if (startDate || endDate) {
      whereResponses.createdAt = {};

      if (startDate) {
        const startDateTime = new Date(startDate);
        startDateTime.setHours(0, 0, 0, 0);
        whereResponses.createdAt.gte = startDateTime;
        console.log("Start date filter:", startDateTime);
      }

      if (endDate) {
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        whereResponses.createdAt.lte = endDateTime;
        console.log("End date filter:", endDateTime);
      }
    }

    console.log("Response Filter:", whereResponses);

    // ------------------------------
    // 3) Pre-cache all form data
    // ------------------------------
    console.time("DB_FORMS_PRECACHE");
    const allForms = await prisma.form.findMany({
      select: { id: true, title: true, type: true, questions: true },
    });
    console.timeEnd("DB_FORMS_PRECACHE");

    const formCache = new Map(allForms.map((f: any) => [f.id, f]));
    console.log(`Cached ${formCache.size} forms`);

    const filePath = path.join("/tmp", `responses_${Date.now()}.xlsx`);
    console.log("Creating workbook:", filePath);

    const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({
      filename: filePath,
      useStyles: false,
      useSharedStrings: false,
    });

    const sheets = new Map<string, ExcelJS.Worksheet>();

    // Helper to get base form name (remove year suffix like " 2023", " 2024")
    function getBaseFormName(formTitle: string): string {
      return formTitle.replace(/\s+\d{4}$/, "");
    }

    // Fast date formatter (much faster than toLocaleString)
    function formatDate(date: Date): string {
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const year = date.getFullYear();
      let hours = date.getHours();
      const minutes = String(date.getMinutes()).padStart(2, "0");
      const seconds = String(date.getSeconds()).padStart(2, "0");
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12 || 12;
      const hoursStr = String(hours).padStart(2, "0");
      return `${month}/${day}/${year}, ${hoursStr}:${minutes}:${seconds} ${ampm}`;
    }

    // ------------------------------
    // Pre-build all sheets with complete columns
    // ------------------------------
    console.log("Pre-building sheets with all question columns...");
    const formGroupQuestions = new Map<string, Map<string, any>>();

    // Group forms by base name and collect all unique questions
    // Use question header name as key to avoid duplicating pre/post questions
    for (const form of allForms) {
      const baseFormName = getBaseFormName(form.title);

      if (!formGroupQuestions.has(baseFormName)) {
        formGroupQuestions.set(baseFormName, new Map());
      }

      const questionMap = formGroupQuestions.get(baseFormName)!;

      form.questions.forEach((q: any) => {
        if (q.showInTeacherExport) {
          const headerName = q.name ?? q.question;

          // Use header name as key to deduplicate pre/post questions with same text
          if (!questionMap.has(headerName)) {
            questionMap.set(headerName, q);
          }
        }
      });
    }

    // Create sheets with complete column sets
    for (const [baseFormName, questionMap] of formGroupQuestions.entries()) {
      const columns: any[] = [
        { header: "Form Title", key: "formTitle", width: 25 },
        { header: "Form Type", key: "formType", width: 10 },
        { header: "Teacher Name", key: "teacherName", width: 25 },
        { header: "Teacher Email", key: "teacherEmail", width: 30 },
        { header: "Grade", key: "grade", width: 10 },
        { header: "Period", key: "period", width: 10 },
        { header: "State", key: "state", width: 15 },
        { header: "County", key: "county", width: 20 },
        { header: "District", key: "district", width: 25 },
        { header: "City", key: "city", width: 15 },
        { header: "School", key: "school", width: 30 },
        { header: "Created At", key: "createdAt", width: 22 },
      ];

      // Add all question columns for this form group
      for (const q of questionMap.values()) {
        const label = q.name ?? q.question;
        columns.push({
          header: label.length > 80 ? label.slice(0, 77) + "..." : label,
          key: `q_${q.id}`,
          width: 40,
        });
      }

      const sheet = workbook.addWorksheet(baseFormName.slice(0, 31));
      sheet.columns = columns;
      sheets.set(baseFormName, sheet);
      console.log(`Created sheet "${baseFormName}" with ${questionMap.size} question columns`);
    }

    // ------------------------------
    // 4) Batch Stream Response Data
    // ------------------------------
    const batchSize = 10000; // Increased from 5000
    let lastId: string | undefined = undefined;
    let totalCount = 0;
    let batchIndex = 0;

    // Collect all rows per sheet for sorting
    const sheetRows = new Map<string, any[]>();
    for (const baseFormName of sheets.keys()) {
      sheetRows.set(baseFormName, []);
    }

    console.log(" Starting batch streaming...");
    while (true) {
      console.time(`DB_BATCH_${batchIndex}`);
      const batch: any[] = await prisma.responseWithTeacher.findMany({
        where: whereResponses,
        select: {
          id: true,
          formId: true,
          grade: true,
          period: true,
          answers: true,
          createdAt: true,
          teacher: { select: { name: true, email: true } },
          teacherLocation: {
            select: {
              state: true,
              county: true,
              district: true,
              city: true,
              school: true,
            },
          },
        },
        take: batchSize,
        ...(lastId && { cursor: { id: lastId }, skip: 1 }),
        orderBy: { id: "asc" },
      });
      console.timeEnd(`DB_BATCH_${batchIndex}`);

      if (batch.length === 0) break;

      totalCount += batch.length;
      console.log(
        `Batch #${batchIndex} size: ${batch.length} (Total: ${totalCount})`
      );

      lastId = batch[batch.length - 1].id;

      for (const r of batch) {
        const form: any = formCache.get(r.formId);
        if (!form) continue; // Skip if form not found in cache

        const baseFormName = getBaseFormName(form.title);
        const answerMap = new Map(
          r.answers.map((a: any) => [a.questionId, a.optionCode])
        );

        const row: any = {
          formTitle: form.title,
          formType: form.type,
          teacherName: r.teacher.name,
          teacherEmail: r.teacher.email,
          grade: r.grade,
          period: r.period ?? "",
          state: r.teacherLocation.state,
          county: r.teacherLocation.county,
          district: r.teacherLocation.district,
          city: r.teacherLocation.city,
          school: r.teacherLocation.school,
          createdAt: formatDate(r.createdAt),
        };

        for (const q of form.questions) {
          if (q.showInTeacherExport) {
            row[`q_${q.id}`] = answerMap.get(q.id) ?? "";
          }
        }

        // Collect row instead of writing immediately
        sheetRows.get(baseFormName)?.push(row);
      }

      batchIndex++;
    }

    console.log("Total rows collected:", totalCount);
    console.log("Sorting and writing rows...");

    // Sort and write rows for each sheet
    for (const [baseFormName, rows] of sheetRows.entries()) {
      // Sort by form title (puts 2023 before 2024)
      rows.sort((a, b) => a.formTitle.localeCompare(b.formTitle));

      const sheet = sheets.get(baseFormName)!;
      for (const row of rows) {
        sheet.addRow(row).commit();
      }
      console.log(`Written ${rows.length} rows to sheet "${baseFormName}"`);
    }

    console.log("Finalizing workbook...");
    for (const sheet of sheets.values()) sheet.commit();

    console.time("WORKBOOK_COMMIT");
    await workbook.commit();
    console.timeEnd("WORKBOOK_COMMIT");

    console.timeEnd("EXPORT_TOTAL");
    console.log("Export complete. Preparing download...");

    // Stream the file to the client
    const stream = fs.createReadStream(filePath);
    return new NextResponse(stream as any, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="REACH_Lab_Export_${Date.now()}.xlsx"`,
      },
    });
  } catch (err) {
    console.error("Export error:", err);
    return NextResponse.json(
      { error: "Failed to export data" },
      { status: 500 }
    );
  }
}
