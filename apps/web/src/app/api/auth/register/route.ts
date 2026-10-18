import { createAccount, issueSession, setSessionCookie } from "@/server/auth.mjs";
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
    const account = await createAccount(username, password);
    if (account.status === "invalid") return json({ error: "Kullanıcı adı 3-24 karakter, parola en az 15 karakter olmalı." }, 400);
    if (account.status === "limited") {
      const response = json({ error: "Çok fazla hesap oluşturma denemesi. 15 dakika sonra tekrar deneyin." }, 429);
      response.headers.set("Retry-After", "900");
      return response;
    }
    if (account.status === "conflict") return json({ error: "Kullanıcı adı kullanılamıyor." }, 409);
    const session = await issueSession(account.learnerId);
    const response = json({ authenticated: true, username: account.username }, 201);
    setSessionCookie(response, request, session.token, session.expires);
    return response;
  } catch { return json({ error: "Hesap oluşturulamadı." }, 503); }
}
