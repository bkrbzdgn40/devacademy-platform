import { gradeSubmission } from "@/server/grade";
import { currentLearner } from "@/server/auth.mjs";
import { recordAttempt } from "@/server/learning-store.mjs";
import { checkMutatingRequest, isDatabaseConfigured, json, readJson } from "@/server/http.mjs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Grading is public educational feedback; persistence requires an authenticated session.
export async function POST(request: Request) {
  const forbidden = checkMutatingRequest(request);
  if (forbidden) return forbidden;
  const parsed = await readJson(request);
  if (parsed.error) return parsed.error;
  const grade = gradeSubmission(parsed.value);
  if (grade.status === "invalid") return json({ error: "Soru veya cevap geçersiz." }, 400);
  let saved = false;
  if (isDatabaseConfigured()) {
    try {
      const learner = await currentLearner(request);
      if (learner) {
        const { optionId } = parsed.value as { optionId: string };
        await recordAttempt(learner.learnerId, grade, optionId);
        saved = true;
      }
    } catch {
      return json({ error: "Sonuç kaydedilemedi. Lütfen tekrar deneyin." }, 503);
    }
  }
  return json({ ...grade, saved });
}
