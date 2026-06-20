import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { getSupabaseAdmin, DEFAULT_TEACHER_ID } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const classId = request.nextUrl.searchParams.get("classId");
  if (!classId) {
    return NextResponse.json({ error: "classId が必要です" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  const { data: students, error: studentsError } = await supabase
    .from("students")
    .select("id, seat_number, name")
    .eq("class_id", classId)
    .order("seat_number");

  if (studentsError) {
    return NextResponse.json({ error: studentsError.message }, { status: 500 });
  }

  const studentIds = (students ?? []).map((s) => s.id);

  const { data: comments, error: commentsError } = await supabase
    .from("comments")
    .select("student_id, unit_id, edited_text, generated_text, status, units(name, subjects(name))")
    .eq("teacher_id", DEFAULT_TEACHER_ID)
    .in("student_id", studentIds.length > 0 ? studentIds : [""]);

  if (commentsError) {
    return NextResponse.json({ error: commentsError.message }, { status: 500 });
  }

  const studentsById = new Map((students ?? []).map((s) => [s.id, s]));

  const rows = (comments ?? []).map((c) => {
    const student = studentsById.get(c.student_id);
    const unit = c.units as unknown as { name: string; subjects: { name: string } | null } | null;
    return {
      座席番号: student?.seat_number ?? "",
      氏名: student?.name ?? "",
      教科: unit?.subjects?.name ?? "",
      単元: unit?.name ?? "",
      状態: c.status === "final" ? "確定" : c.status === "draft" ? "下書き" : "未着手",
      所見文: c.edited_text ?? c.generated_text ?? "",
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "所見一覧");
  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": "attachment; filename=shoken_export.xlsx",
    },
  });
}
