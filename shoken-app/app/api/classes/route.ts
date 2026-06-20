import { NextResponse } from "next/server";
import { getSupabaseAdmin, DEFAULT_TEACHER_ID } from "@/lib/supabase";

export async function GET() {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("classes")
    .select("id, school_year, grade, class_name, is_specialist, students(id, seat_number, name)")
    .eq("teacher_id", DEFAULT_TEACHER_ID)
    .order("grade");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const classes = (data ?? []).map((c) => ({
    ...c,
    students: (c.students ?? []).sort((a, b) => a.seat_number - b.seat_number),
  }));

  return NextResponse.json({ classes });
}
