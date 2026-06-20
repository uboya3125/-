import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { generateComment } from "@/lib/anthropic";

const RECENT_EXPRESSIONS_LIMIT = 5;

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { studentId, unitId, classId, keywords, length } = body as {
    studentId: string;
    unitId: string;
    classId: string;
    keywords: string[];
    length: number;
  };

  if (!studentId || !unitId || !classId || !keywords?.length || !length) {
    return NextResponse.json({ error: "必須項目が不足しています" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  const { data: unit, error: unitError } = await supabase
    .from("units")
    .select("name, grade, perspectives, subjects(name)")
    .eq("id", unitId)
    .single();

  if (unitError || !unit) {
    return NextResponse.json({ error: "単元が見つかりません" }, { status: 404 });
  }

  const { data: students } = await supabase
    .from("students")
    .select("id")
    .eq("class_id", classId);
  const studentIds = (students ?? []).map((s) => s.id);

  const { data: recentComments } = await supabase
    .from("comments")
    .select("edited_text, generated_text, updated_at")
    .eq("unit_id", unitId)
    .in("student_id", studentIds.length > 0 ? studentIds : [studentId])
    .order("updated_at", { ascending: false })
    .limit(RECENT_EXPRESSIONS_LIMIT);

  const recentExpressions = (recentComments ?? [])
    .map((c) => c.edited_text ?? c.generated_text)
    .filter((t): t is string => Boolean(t));

  const subjectName = (unit.subjects as unknown as { name: string } | null)?.name ?? "算数";

  const text = await generateComment({
    grade: unit.grade,
    subject: subjectName,
    unitName: unit.name,
    perspectives: unit.perspectives ?? [],
    keywords,
    length,
    recentExpressions,
  });

  return NextResponse.json({ text });
}
