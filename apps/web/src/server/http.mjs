// Shared request boundary for state-changing JSON endpoints.
export const noStore = { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" };
export function json(value, status=200) {
  return Response.json(value, { status, headers: noStore });
}
export function isSameOrigin(request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  // Public deployments MUST configure the trusted canonical browser origin.
  // Next.js can receive an internal loopback URL behind a reverse proxy; never
  // require that internal URL to match the browser-facing APP_ORIGIN.
  if (!process.env.APP_ORIGIN && process.env.NODE_ENV === "production") return false;
  const expected = process.env.APP_ORIGIN || new URL(request.url).origin;
  try {
    const target = new URL(expected);
    // Outside loopback, any production login requires TLS on the public origin.
    const loopback = ["localhost", "127.0.0.1", "[::1]"].includes(target.hostname);
    if (process.env.NODE_ENV === "production" && target.protocol !== "https:" && !loopback) return false;
    return new URL(origin).origin === target.origin;
  } catch { return false; }
}
export async function readJson(request, limit=2048) {
  const type = request.headers.get("content-type")?.split(";")[0].trim().toLowerCase();
  if (type !== "application/json") return { error: json({ error: "JSON gerekli." }, 415) };
  if (Number(request.headers.get("content-length")) > limit) return { error: json({ error: "İstek çok büyük." }, 413) };
  const reader = request.body?.getReader();
  if (!reader) return { error: json({ error: "Gövde gerekli." }, 400) };
  const decoder = new TextDecoder("utf-8", { fatal: true });
  let total = 0;
  let input = "";
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > limit) {
        await reader.cancel();
        return { error: json({ error: "İstek çok büyük." }, 413) };
      }
      input += decoder.decode(value, { stream: true });
    }
    input += decoder.decode();
    const value = JSON.parse(input);
    if (value === null || Array.isArray(value) || typeof value !== "object") throw new Error("invalid body");
    return { value };
  } catch { return { error: json({ error: "Geçersiz JSON." }, 400) }; }
  finally { reader.releaseLock(); }
}
export function isDatabaseConfigured() { return Boolean(process.env.DATABASE_URL); }
export function checkMutatingRequest(request) {
  return isSameOrigin(request) ? null : json({ error: "İstek kaynağı doğrulanamadı." }, 403);
}
