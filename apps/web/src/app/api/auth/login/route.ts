import { authenticate, issueSession, setSessionCookie } from "@/server/auth.mjs";
import { checkMutatingRequest, isDatabaseConfigured, json, readJson } from "@/server/http.mjs";
export const runtime = "nodejs";
export async function POST(request: Request) {
  const forbidden = checkMutatingRequest(request);
  if (forbidden) return forbidden;
  if (!isDatabaseConfigured()) return json({ error: "Hesap sistemi yapılandırılmamış." }, 503);
  const input = await readJson(request, 2048);
  if (input.error) return input.error;
  try {
    const { username, password } = input.value as Record<string, unknown>;
    const result = await authenticate(username, password);
    if (result.status === "limited") return json({ error: "Çok fazla deneme. 15 dakika sonra tekrar deneyin." }, 429);
    if (result.status !== "authenticated") return json({ error: "Kullanıcı adı veya parola hatalı." }, 401);
    const session = await issueSession(result.learnerId);
    const response = json({ authenticated: true, username: result.username });
    setSessionCookie(response, request, session.token, session.expires);
    return response;
  } catch { return json({ error: "Oturum açılamadı." }, 503); }
}
