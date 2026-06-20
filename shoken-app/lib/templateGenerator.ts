const CLOSING_PHRASES: Record<string, string[]> = {
  "知識・技能": [
    "ことができました。",
    "姿が見られ、確実に身につけることができました。",
    "ようになりました。",
  ],
  "思考・判断・表現": [
    "姿が見られました。",
    "ことができ、考えを深めていました。",
    "様子が見られました。",
  ],
  "主体的に学習に取り組む態度": [
    "様子が見られました。",
    "姿が大変立派でした。",
    "ことができ、意欲的に取り組んでいました。",
  ],
};

const DEFAULT_CLOSINGS = ["ことができました。", "姿が見られました。"];

const FILLER = "今後もこの調子で取り組んでいけるよう期待しています。";

export interface TemplateGenerateParams {
  keywords: string[];
  perspectives: string[];
  length: number;
  recentExpressions: string[];
}

function pickClosing(perspective: string | undefined, avoid: string[]): string {
  const candidates = (perspective && CLOSING_PHRASES[perspective]) || DEFAULT_CLOSINGS;
  const fresh = candidates.find((c) => !avoid.some((text) => text.endsWith(c)));
  return fresh ?? candidates[0];
}

export function generateCommentFromTemplate(params: TemplateGenerateParams): string {
  const { keywords, perspectives, length, recentExpressions } = params;
  const closing = pickClosing(perspectives[0], recentExpressions);
  const body = keywords.join("、");
  let text = `${body}${closing}`;

  if (text.length < length - 10) {
    text = `${body}${closing} ${FILLER}`;
  }

  if (text.length > length + 10 && keywords.length > 1) {
    text = `${keywords[0]}${closing}`;
  }

  return text;
}
