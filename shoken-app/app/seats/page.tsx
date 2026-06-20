"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import CommentPanel from "@/components/CommentPanel";
import type { ClassRow, CommentRow, CommentStatus, Student, Unit } from "@/lib/types";

const STATUS_LABEL: Record<CommentStatus, string> = {
  not_started: "未着手",
  draft: "下書き",
  final: "確定",
};

const STATUS_COLOR: Record<CommentStatus, string> = {
  not_started: "bg-gray-100 border-gray-300 text-gray-500",
  draft: "bg-yellow-50 border-yellow-400 text-yellow-700",
  final: "bg-green-50 border-green-500 text-green-700",
};

export default function SeatsPage() {
  const router = useRouter();
  const [classes, setClasses] = useState<ClassRow[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [classId, setClassId] = useState<string>("");
  const [unitId, setUnitId] = useState<string>("");
  const [comments, setComments] = useState<CommentRow[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/classes")
      .then((res) => res.json())
      .then((body) => {
        setClasses(body.classes ?? []);
        if (body.classes?.length > 0) setClassId(body.classes[0].id);
      })
      .finally(() => setLoading(false));
  }, []);

  const currentClass = useMemo(() => classes.find((c) => c.id === classId), [classes, classId]);

  useEffect(() => {
    if (!currentClass) return;
    fetch(`/api/units?grade=${currentClass.grade}&subject=算数`)
      .then((res) => res.json())
      .then((body) => {
        setUnits(body.units ?? []);
        if (body.units?.length > 0) setUnitId(body.units[0].id);
      });
  }, [currentClass]);

  useEffect(() => {
    if (!classId || !unitId) return;
    fetch(`/api/comments?unitId=${unitId}&classId=${classId}`)
      .then((res) => res.json())
      .then((body) => setComments(body.comments ?? []));
  }, [classId, unitId]);

  const currentUnit = useMemo(() => units.find((u) => u.id === unitId), [units, unitId]);

  function commentFor(studentId: string) {
    return comments.find((c) => c.student_id === studentId) ?? null;
  }

  function statusFor(studentId: string): CommentStatus {
    return commentFor(studentId)?.status ?? "not_started";
  }

  function handleSaved(updated: CommentRow) {
    setComments((prev) => {
      const exists = prev.some((c) => c.id === updated.id);
      return exists ? prev.map((c) => (c.id === updated.id ? updated : c)) : [...prev, updated];
    });
    setSelectedStudent(null);
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  if (loading) {
    return <div className="flex flex-1 items-center justify-center text-gray-400">読み込み中...</div>;
  }

  return (
    <div className="flex flex-1 flex-col bg-orange-50 p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-gray-800">通知表所見メーカー</h1>
        <div className="flex items-center gap-3">
          <select
            value={classId}
            onChange={(e) => setClassId(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
          >
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.grade}年 {c.class_name}
              </option>
            ))}
          </select>
          <select
            value={unitId}
            onChange={(e) => setUnitId(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
          >
            {units.map((u) => (
              <option key={u.id} value={u.id}>
                算数: {u.name}
              </option>
            ))}
          </select>
          <a
            href={classId ? `/api/export?classId=${classId}` : "#"}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-white"
          >
            Excel出力
          </a>
          <button
            onClick={handleLogout}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-white"
          >
            ログアウト
          </button>
        </div>
      </div>

      <div className="mb-4 flex gap-4 text-xs text-gray-500">
        {(Object.keys(STATUS_LABEL) as CommentStatus[]).map((s) => (
          <span key={s} className={`rounded-md border px-2 py-0.5 ${STATUS_COLOR[s]}`}>
            {STATUS_LABEL[s]}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-4 gap-3 sm:grid-cols-6">
        {currentClass?.students.map((student) => {
          const status = statusFor(student.id);
          return (
            <button
              key={student.id}
              onClick={() => setSelectedStudent(student)}
              className={`rounded-lg border-2 p-3 text-center shadow-sm transition hover:shadow-md ${STATUS_COLOR[status]}`}
            >
              <div className="text-xs text-gray-400">{student.seat_number}番</div>
              <div className="text-sm font-semibold">{student.name}</div>
              <div className="mt-1 text-[10px]">{STATUS_LABEL[status]}</div>
            </button>
          );
        })}
      </div>

      {selectedStudent && currentUnit && (
        <CommentPanel
          key={`${selectedStudent.id}-${currentUnit.id}`}
          student={selectedStudent}
          classId={classId}
          unit={currentUnit}
          comment={commentFor(selectedStudent.id)}
          onClose={() => setSelectedStudent(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
