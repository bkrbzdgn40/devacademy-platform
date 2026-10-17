// Server-only answer keys. Never import this module into a client component.
// Browser-facing lesson/question JSON intentionally excludes correct answers.
import questions from "../data/questions.json" with { type: "json" };

const answerKeys: Record<string, { optionId: string; explanation: string }> = {
  "js.binding.increment": { optionId: "b", explanation: "score önce 2'dir. += 3 ifadesi aynı değişkene 5 değerini atar." },
  "js.binding.object": { optionId: "c", explanation: "const nesne referansının yeniden atanmasını engeller; person.name alanını değiştirmeye izin verir." },
  "js.equality.strict": { optionId: "b", explanation: "0 sayı, false boolean türündedir. === farklı türler arasında dönüşüm yapmaz, dolayısıyla false döndürür." },
  "js.equality.loose": { optionId: "a", explanation: "== karşılaştırması boolean false değerini 0'a dönüştürdüğünden 0 == false sonucu true'dur." },
  "js.map.output": { optionId: "b", explanation: "map her sayıyı ikiyle çarpar ve [2,4,6] oluşturur; join(',') bunu 2,4,6 metnine dönüştürür." },
  "js.map.original": { optionId: "a", explanation: "map yeni bir dizi döndürür. Dönen dizi saklanmazsa bile values değişmez; ilk öğe 1'dir." },
};

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
