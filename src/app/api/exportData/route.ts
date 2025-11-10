import fs from "fs";
import path from "path";
import { prisma } from "@/utils/db";
import { NextRequest, NextResponse } from "next/server";
import ExcelJS from "exceljs";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);

    //first extract paramter from query
    const country = url.searchParams.get("country");
    const state = url.searchParams.get("state");
    const county = url.searchParams.get("county");
    const district = url.searchParams.get("district");
    const city = url.searchParams.get("city");
    const school = url.searchParams.get("school");
    const form = url.searchParams.get("form");
    const userId = url.searchParams.get("userId");
    const role = url.searchParams.get("role");

    // build filters with parameters
    const filters: any = { approved: true };
    if (country && country !== "All") filters.country = country;
    if (state && state !== "All") filters.state = state;
    if (county && county !== "All") filters.county = county;
    if (district && district !== "All") filters.district = district;
    if (city && city !== "All") filters.city = city;
    if (school && school !== "All") filters.school = school;

    //TODO: if teacher also add that in userLocation filter(userId)

    // Fetch user locations
    const userLocations = await prisma.userLocation.findMany({
      where: filters,
      select: {
        id: true,
        userId: true,
        country: true,
        state: true,
        county: true,
        district: true,
        city: true,
        school: true,
      },
    });

    const userLocationIds = userLocations.map((l) => l.id);
    if (userLocationIds.length === 0)
      return NextResponse.json(
        { message: "No locations found" },
        { status: 200 }
      );

    // Build base query for responses (formType and teacherLocationIds)
    const responseWhere: any = { teacherLocationId: { in: userLocationIds } };
    if (form && form !== "All") responseWhere.formId = form;
    if (role === "teacher") {
      // Teacher: only responses belonging to them
      responseWhere.teacherId = userId;
    }

    // Fetch responses and associated data
    const responses = await prisma.responseWithTeacher.findMany({
      where: responseWhere,
      include: {
        teacher: { select: { name: true, email: true } },
        form: {
          select: { id: true, title: true, type: true, questions: true },
        },
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
      orderBy: { formId: "asc" },
    });

    if (responses.length === 0)
      return NextResponse.json(
        { message: "No responses found" },
        { status: 200 }
      );

    // Create a new Excel workbook
    const filePath = path.join("/tmp", `responses_${Date.now()}.xlsx`);
    const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({
      filename: filePath,
    });

    // Helper function for writing one sheet
    const writeSheet = (formResponses: any[], formData: any) => {
      const visibleQuestions = formData.questions.filter(
        (q: any) => q.showInTeacherExport
      );
      const sheet = workbook.addWorksheet(formData.title.slice(0, 31));

      const baseColumns = [
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

      // Add question columns (use question text)
      for (const q of visibleQuestions) {
        baseColumns.push({
          header:
            q.question.length > 80
              ? q.question.slice(0, 77) + "..."
              : q.question,
          key: `q_${q.id}`,
          width: 40,
        });
      }
      sheet.columns = baseColumns;

      // Write each response
      for (const r of formResponses) {
        const answerMap = new Map(
          r.answers.map((a: any) => [a.questionId, a.optionCode])
        );
        const rowData: any = {
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

        for (const q of visibleQuestions) {
          rowData[`q_${q.id}`] = answerMap.get(q.id) ?? "";
        }

        sheet.addRow(rowData).commit();
      }

      sheet.commit();
    };

    // If form = specific then one sheet
    if (form && form !== "All") {
      const currentForm = responses[0].form;
      writeSheet(responses, currentForm);
    } else {
      // 8️⃣ If form = All then one sheet per form
      const grouped = responses.reduce(
        (acc, r) => {
          const key = r.form.id;
          if (!acc[key]) acc[key] = [];
          acc[key].push(r);
          return acc;
        },
        {} as Record<string, typeof responses>
      );

      for (const [formId, group] of Object.entries(grouped)) {
        const formData = group[0].form;
        writeSheet(group, formData);
      }
    }

    // Finalize workbook
    await workbook.commit();
    const fileBuffer = fs.readFileSync(filePath);

    return new NextResponse(fileBuffer, {
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
