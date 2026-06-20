import Anthropic from "@anthropic-ai/sdk";

let client: Anthropic | null = null;

export function getAnthropicClient() {
  if (!client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error("ANTHROPIC_API_KEY が設定されていません");
    client = new Anthropic({ apiKey });
  }
  return client;
}

const SYSTEM_PROMPT = `あなたは小学校の通知表所見文を作成するベテラン教員です。
以下の条件に従い、所見文を1つ作成してください。

【条件】
- 学年: {grade}
- 教科: {subject}
- 単元: {unit_name}
- 評価の観点: {perspectives}
- 含めるキーワード: {keywords}
- 文字数: {length}字程度（±5字以内）
- 文体: 敬体（「〜できました」「〜られました」等）、
  児童の主体性を尊重する前向きな表現
- 主語（児童の名前）は使わず、文頭は内容から始める
- 1〜2文に収め、簡潔にまとめる
- 出力は所見文の本文のみ。前置きや説明は不要

【参考: 直近生成した所見文（表現の重複を避けてください）】
{recent_expressions}
`;

export interface GenerateCommentParams {
  grade: number;
  subject: string;
  unitName: string;
  perspectives: string[];
  keywords: string[];
  length: number;
  recentExpressions: string[];
}

export async function generateComment(params: GenerateCommentParams): Promise<string> {
  const prompt = SYSTEM_PROMPT.replace("{grade}", `${params.grade}年`)
    .replace("{subject}", params.subject)
    .replace("{unit_name}", params.unitName)
    .replace("{perspectives}", params.perspectives.join("、"))
    .replace("{keywords}", params.keywords.join("、"))
    .replace("{length}", `${params.length}`)
    .replace(
      "{recent_expressions}",
      params.recentExpressions.length > 0
        ? params.recentExpressions.map((t, i) => `${i + 1}. ${t}`).join("\n")
        : "（なし）"
    );

  const anthropic = getAnthropicClient();
  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 300,
    system: prompt,
    messages: [{ role: "user", content: "所見文を作成してください。" }],
  });

  const textBlock = message.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("AIからの応答を取得できませんでした");
  }
  return textBlock.text.trim();
}
