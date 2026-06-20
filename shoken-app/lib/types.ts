export interface Student {
  id: string;
  seat_number: number;
  name: string;
}

export interface ClassRow {
  id: string;
  school_year: number;
  grade: number;
  class_name: string;
  is_specialist: boolean;
  students: Student[];
}

export interface Keyword {
  id: string;
  perspective: string;
  text: string;
  favorite_count: number;
}

export interface Unit {
  id: string;
  name: string;
  term: string | null;
  perspectives: string[];
  grade: number;
  keywords: Keyword[];
}

export type CommentStatus = "not_started" | "draft" | "final";

export interface CommentRow {
  id: string;
  student_id: string;
  unit_id: string;
  selected_keywords: string[];
  length_type: string;
  generated_text: string | null;
  edited_text: string | null;
  status: CommentStatus;
  created_at: string;
  updated_at: string;
}

export interface EditHistoryEntry {
  id: string;
  comment_id: string;
  edited_by: string | null;
  previous_text: string | null;
  new_text: string | null;
  edited_at: string;
}

export const LENGTH_OPTIONS = [
  { value: "50", label: "50字程度" },
  { value: "70", label: "70字程度" },
  { value: "90", label: "90字程度" },
] as const;
