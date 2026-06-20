import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin, DEFAULT_TEACHER_ID } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const grade = request.nextUrl.searchParams.get("grade");
  const subjectName = request.nextUrl.searchParams.get("subject") ?? "算数";

  const supabase = getSupabaseAdmin();
  const { data: subject, error: subjectError } = await supabase
    .from("subjects")
    .select("id")
    .eq("name", subjectName)
    .single();

  if (subjectError || !subject) {
    return NextResponse.json({ error: "教科が見つかりません" }, { status: 404 });
  }

  let query = supabase
    .from("units")
    .select("id, name, term, perspectives, grade, keywords(id, perspective, text, favorite_count)")
    .eq("teacher_id", DEFAULT_TEACHER_ID)
    .eq("subject_id", subject.id);

  if (grade) {
    query = query.eq("grade", Number(grade));
  }

  const { data, error } = await query.order("created_at");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ units: data ?? [] });
}
