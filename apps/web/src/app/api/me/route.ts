import { currentLearner } from "@/server/auth.mjs";
import { isDatabaseConfigured, json } from "@/server/http.mjs";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  if (!isDatabaseConfigured()) return json({ authenticated: false, configured: false });
  try {
    const learner = await currentLearner(request);
    return json(learner ? { authenticated: true, configured: true, username: learner.username } : { authenticated: false, configured: true });
  } catch { return json({ error: "Oturum kontrol edilemedi." }, 503); }
}
