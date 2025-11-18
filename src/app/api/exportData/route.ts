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
    const filterKeys = ["country", "state", "county", "district", "city", "school"];

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
      return NextResponse.json({ message: "No locations found" }, { status: 200 });
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

    if (form && form !== "All") whereResponses.formId = form;
    if (role === "teacher" && userId) whereResponses.teacherId = userId;

    console.log("Response Filter:", whereResponses);

    const filePath = path.join("/tmp", `responses_${Date.now()}.xlsx`);
    console.log("Creating workbook:", filePath);

    const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({
      filename: filePath,
      useStyles: false,
      useSharedStrings: false,
    });

    const sheets = new Map<string, ExcelJS.Worksheet>();

    function getSheet(form: any) {
      if (sheets.has(form.id)) return sheets.get(form.id)!;

      console.log(`Creating sheet for form: ${form.title}`);

      const visibleQuestions = form.questions.filter((q: any) => q.showInTeacherExport);
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

      for (const q of visibleQuestions) {
        columns.push({
          header: q.question.length > 80 ? q.question.slice(0, 77) + "..." : q.question,
          key: `q_${q.id}`,
          width: 40,
        });
      }

      const sheet = workbook.addWorksheet(form.title.slice(0, 31));
      sheet.columns = columns;
      sheets.set(form.id, sheet);
      return sheet;
    }

    // ------------------------------
    // 4) Batch Stream Response Data
    // ------------------------------
    const batchSize = 5000;
    let lastId: string | undefined = undefined;
    let totalCount = 0;
    let batchIndex = 0;

    console.log(" Starting batch streaming...");
    while (true) {
      console.time(`DB_BATCH_${batchIndex}`);
      const batch: any[] = await prisma.responseWithTeacher.findMany({
        where: whereResponses,
        include: {
          teacher: { select: { name: true, email: true } },
          form: { select: { id: true, title: true, type: true, questions: true } },
          teacherLocation: {
            select: {
              country: true,
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
      console.log(`Batch #${batchIndex} size: ${batch.length} (Total: ${totalCount})`);

      lastId = batch[batch.length - 1].id;

      for (const r of batch) {
        const sheet = getSheet(r.form);
        const answerMap = new Map(r.answers.map((a: any) => [a.questionId, a.optionCode]));

        const row: any = {
          formTitle: r.form.title,
          formType: r.form.type,
          teacherName: r.teacher.name,
          teacherEmail: r.teacher.email,
          grade: r.grade,
          period: r.period ?? "",
          state: r.teacherLocation.state,
          county: r.teacherLocation.county,
          district: r.teacherLocation.district,
          city: r.teacherLocation.city,
          school: r.teacherLocation.school,
          createdAt: r.createdAt.toISOString(),
        };

        for (const q of r.form.questions) {
          if (q.showInTeacherExport) {
            row[`q_${q.id}`] = answerMap.get(q.id) ?? "";
          }
        }

        sheet.addRow(row).commit();
      }

      batchIndex++;
    }

    console.log("Total rows written:", totalCount);
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
    return NextResponse.json({ error: "Failed to export data" }, { status: 500 });
  }
}