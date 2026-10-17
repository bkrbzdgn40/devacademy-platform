import { clearSessionCookie, currentLearner, deleteLearnerAccount } from "@/server/auth.mjs";
import { checkMutatingRequest, json, readJson } from "@/server/http.mjs";
export const runtime = "nodejs";
export async function POST(request: Request) {
  const forbidden = checkMutatingRequest(request);
  if (forbidden) return forbidden;
  const input = await readJson(request, 2048);
  if (input.error) return input.error;
  const { confirmation, password } = input.value as Record<string, unknown>;
  if (confirmation !== "DELETE" || typeof password !== "string") return json({ error: "Parola ve DELETE onayı gerekli." }, 400);
  try {
    const learner = await currentLearner(request);
    if (!learner) return json({ error: "Oturum gerekli." }, 401);
    const deleted = await deleteLearnerAccount(learner.learnerId, password);
    if (!deleted) return json({ error: "Parola doğrulanamadı." }, 401);
    const response = json({ deleted: true });
    clearSessionCookie(response, request);
    return response;
  } catch { return json({ error: "Hesap silinemedi." }, 503); }
}
