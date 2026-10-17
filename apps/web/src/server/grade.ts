// Server-only answer keys. Never import this module into a client component.
// Browser-facing lesson/question JSON intentionally excludes correct answers.
import questions from "../data/questions.json" with { type: "json" };

import answerKeyData from "./answer-keys.json" with { type: "json" };
const answerKeys: Record<string, { optionId: string; explanation: string }> = answerKeyData;

export type GradeResult =
  | { status: "graded"; questionId: string; correct: boolean; correctOptionId: string; explanation: string }
  | { status: "invalid" };

export function gradeSubmission(input: unknown): GradeResult {
  if (typeof input !== "object" || input === null || Array.isArray(input)) return { status: "invalid" };
  const data = input as Record<string, unknown>;
  if (typeof data.questionId !== "string" || data.questionId.length > 80 ||
      typeof data.optionId !== "string" || data.optionId.length > 20) return { status: "invalid" };
  const question = questions.find((item) => item.id === data.questionId);
  const key = answerKeys[data.questionId];
  if (!question || !key || !question.options.some((option) => option.id === data.optionId)) return { status: "invalid" };
  return { status: "graded", questionId: question.id, correct: key.optionId === data.optionId,
    correctOptionId: key.optionId, explanation: key.explanation };
}

export function answerKeyIds(): string[] { return Object.keys(answerKeys); }
