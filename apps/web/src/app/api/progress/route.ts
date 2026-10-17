import { currentLearner } from "@/server/auth.mjs";
import { getLearningProgress, updateLessonProgress } from "@/server/learning-store.mjs";
import { checkMutatingRequest, isDatabaseConfigured, json, readJson } from "@/server/http.mjs";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  if (!isDatabaseConfigured()) return json({ error: "Veritabanı yapılandırılmamış." }, 503);
  try {
    const learner = await currentLearner(request);
    if (!learner) return json({ error: "Oturum gerekli." }, 401);
    return json(await getLearningProgress(learner.learnerId));
  } catch { return json({ error: "İlerleme okunamadı." }, 503); }
}
export async function POST(request: Request) {
  const forbidden = checkMutatingRequest(request);
  if (forbidden) return forbidden;
  if (!isDatabaseConfigured()) return json({ error: "Veritabanı yapılandırılmamış." }, 503);
  const input = await readJson(request);
  if (input.error) return input.error;
  const { lessonId, operation } = input.value as Record<string, unknown>;
  if (typeof lessonId !== "string" || typeof operation !== "string") return json({ error: "Geçersiz işlem." }, 400);
  try {
    const learner = await currentLearner(request);
    if (!learner) return json({ error: "Oturum gerekli." }, 401);
    const result = await updateLessonProgress(learner.learnerId, lessonId, operation);
    if (result.status === "invalid") return json({ error: "Ders veya işlem geçersiz." }, 400);
    if (result.status === "incomplete") return json({ error: "Önce bu dersin tüm sorularını doğru çözmelisin." }, 409);
    return json(result);
  } catch { return json({ error: "İlerleme kaydedilemedi." }, 503); }
}
