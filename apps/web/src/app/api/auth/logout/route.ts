import { clearSessionCookie, revokeSession } from "@/server/auth.mjs";
import { checkMutatingRequest, json } from "@/server/http.mjs";
export const runtime = "nodejs";
export async function POST(request: Request) {
  const forbidden = checkMutatingRequest(request);
  if (forbidden) return forbidden;
  try {
    await revokeSession(request);
    const response = json({ authenticated: false });
    clearSessionCookie(response, request);
    return response;
  } catch { return json({ error: "Oturum sonlandırılamadı." }, 503); }
}
