"use client";

import { useState } from "react";
import type { CommentRow, EditHistoryEntry, Student, Unit } from "@/lib/types";
import { LENGTH_OPTIONS } from "@/lib/types";

interface CommentPanelProps {
  student: Student;
  classId: string;
  unit: Unit;
  comment: CommentRow | null;
  onClose: () => void;
  onSaved: (comment: CommentRow) => void;
}

export default function CommentPanel({
  student,
  classId,
  unit,
  comment,
  onClose,
  onSaved,
}: CommentPanelProps) {
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>(
    comment?.selected_keywords ?? []
  );
  const [length, setLength] = useState(comment?.length_type ?? "70");
  const [text, setText] = useState(comment?.edited_text ?? comment?.generated_text ?? "");
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<EditHistoryEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  function toggleKeyword(keywordText: string) {
    setSelectedKeywords((prev) =>
      prev.includes(keywordText)
        ? prev.filter((k) => k !== keywordText)
        : prev.length < 3
        ? [...prev, keywordText]
        : prev
    );
  }

  async function handleGenerate() {
    if (selectedKeywords.length === 0) {
      setError("キーワードを1つ以上選択してください");
      return;
    }
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: student.id,
          unitId: unit.id,
          classId,
          keywords: selectedKeywords,
          length: Number(length),
        }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "生成に失敗しました");
      setText(body.text);
    } catch (e) {
      setError(e instanceof Error ? e.message : "生成に失敗しました");
    } finally {
      setGenerating(false);
    }
  }

  async function handleSave(status: "draft" | "final") {
    if (!text.trim()) {
      setError("所見文を入力してください");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: student.id,
          unitId: unit.id,
          selectedKeywords,
          lengthType: length,
          text,
          status,
        }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "保存に失敗しました");
      onSaved(body.comment);
    } catch (e) {
      setError(e instanceof Error ? e.message : "保存に失敗しました");
    } finally {
      setSaving(false);
    }
  }

  async function loadHistory() {
    if (!comment) return;
    const res = await fetch(`/api/comments/${comment.id}/history`);
    const body = await res.json();
    setHistory(body.history ?? []);
    setShowHistory(true);
  }

  const perspectiveGroups = unit.perspectives.map((perspective) => ({
    perspective,
    keywords: unit.keywords.filter((k) => k.perspective === perspective),
  }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">
            {student.seat_number}番 {student.name} ／ {unit.name}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700">
            ✕
          </button>
        </div>

        {perspectiveGroups.map((group) => (
          <div key={group.perspective} className="mb-3">
            <p className="mb-1 text-sm font-semibold text-gray-600">{group.perspective}</p>
            <div className="flex flex-wrap gap-2">
              {group.keywords.map((kw) => (
                <button
                  key={kw.id}
                  type="button"
                  onClick={() => toggleKeyword(kw.text)}
                  className={`rounded-full border px-3 py-1 text-sm ${
                    selectedKeywords.includes(kw.text)
                      ? "border-orange-500 bg-orange-100 text-orange-700"
                      : "border-gray-300 text-gray-600 hover:border-orange-300"
                  }`}
                >
                  {kw.text}
                </button>
              ))}
            </div>
          </div>
        ))}

        <div className="mb-4 mt-3 flex items-center gap-3">
          <label className="text-sm font-semibold text-gray-600">文字数</label>
          <select
            value={length}
            onChange={(e) => setLength(e.target.value)}
            className="rounded-md border border-gray-300 px-2 py-1 text-sm"
          >
            {LENGTH_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={generating}
            className="rounded-md bg-orange-500 px-4 py-1.5 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
          >
            {generating ? "生成中..." : "生成"}
          </button>
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          className="mb-2 w-full rounded-md border border-gray-300 p-3 text-sm focus:border-orange-400 focus:outline-none"
          placeholder="生成された所見文がここに表示されます。自由に編集できます。"
        />
        <p className="mb-3 text-right text-xs text-gray-400">{text.length}字</p>

        {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleSave("draft")}
              disabled={saving}
              className="rounded-md border border-gray-300 px-4 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              下書き保存
            </button>
            <button
              type="button"
              onClick={() => handleSave("final")}
              disabled={saving}
              className="rounded-md bg-green-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
            >
              確定
            </button>
          </div>
          {comment && (
            <button
              type="button"
              onClick={loadHistory}
              className="text-xs text-gray-400 underline hover:text-gray-600"
            >
              編集履歴を見る
            </button>
          )}
        </div>

        {showHistory && (
          <div className="mt-4 rounded-md border border-gray-200 bg-gray-50 p-3">
            <p className="mb-2 text-sm font-semibold text-gray-600">編集履歴</p>
            {history.length === 0 ? (
              <p className="text-xs text-gray-400">変更履歴はまだありません</p>
            ) : (
              <ul className="space-y-2">
                {history.map((h) => (
                  <li key={h.id} className="text-xs text-gray-600">
                    <span className="text-gray-400">
                      {new Date(h.edited_at).toLocaleString("ja-JP")}
                    </span>
                    <div className="mt-1 rounded bg-white p-2">
                      <p className="text-red-500 line-through">{h.previous_text}</p>
                      <p className="text-green-700">{h.new_text}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
