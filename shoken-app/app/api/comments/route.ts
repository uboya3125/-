import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin, DEFAULT_TEACHER_ID } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const unitId = request.nextUrl.searchParams.get("unitId");
  const classId = request.nextUrl.searchParams.get("classId");
  if (!unitId || !classId) {
    return NextResponse.json({ error: "unitId と classId が必要です" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data: students, error: studentsError } = await supabase
    .from("students")
    .select("id")
    .eq("class_id", classId);

  if (studentsError) {
    return NextResponse.json({ error: studentsError.message }, { status: 500 });
  }

  const studentIds = (students ?? []).map((s) => s.id);
  if (studentIds.length === 0) {
    return NextResponse.json({ comments: [] });
  }

  const { data, error } = await supabase
    .from("comments")
    .select("*")
    .eq("unit_id", unitId)
    .in("student_id", studentIds);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ comments: data ?? [] });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { studentId, unitId, selectedKeywords, lengthType, text, status } = body as {
    studentId: string;
    unitId: string;
    selectedKeywords: string[];
    lengthType: string;
    text: string;
    status: "draft" | "final";
  };

  if (!studentId || !unitId || !text || !status) {
    return NextResponse.json({ error: "必須項目が不足しています" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  const { data: existing } = await supabase
    .from("comments")
    .select("id, edited_text, generated_text")
    .eq("student_id", studentId)
    .eq("unit_id", unitId)
    .maybeSingle();

  const previousText = existing?.edited_text ?? existing?.generated_text ?? null;

  const { data: saved, error } = await supabase
    .from("comments")
    .upsert(
      {
        id: existing?.id,
        student_id: studentId,
        unit_id: unitId,
        teacher_id: DEFAULT_TEACHER_ID,
        selected_keywords: selectedKeywords ?? [],
        length_type: lengthType,
        edited_text: text,
        generated_text: existing?.generated_text ?? text,
        status,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "student_id,unit_id" }
    )
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (previousText !== null && previousText !== text) {
    await supabase.from("comment_edit_history").insert({
      comment_id: saved.id,
      edited_by: DEFAULT_TEACHER_ID,
      previous_text: previousText,
      new_text: text,
    });
  }

  return NextResponse.json({ comment: saved });
}
