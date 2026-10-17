import { gradeSubmission } from "@/server/grade";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const MAX_BODY_BYTES = 2048;
const headers = { "Cache-Control": "no-store" };

async function parseSmallJson(request: Request): Promise<unknown> {
  const reader = request.body?.getReader();
  if (!reader) throw new Error("invalid");
  let bytes = 0;
  let text = "";
  const decoder = new TextDecoder("utf-8", { fatal: true });
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > MAX_BODY_BYTES) {
        await reader.cancel();
        throw new Error("too-large");
      }
      text += decoder.decode(value, { stream: true });
    }
    text += decoder.decode();
    return JSON.parse(text) as unknown;
  } finally {
    reader.releaseLock();
  }
}

export async function POST(request: Request) {
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    return Response.json({ error: "Yalnızca JSON destekleniyor." }, { status: 415, headers });
  }
  let submission: unknown;
  try { submission = await parseSmallJson(request); }
  catch (error) {
    const isLarge = error instanceof Error && error.message === "too-large";
    return Response.json({ error: isLarge ? "İstek çok büyük." : "Geçersiz JSON." }, { status: isLarge ? 413 : 400, headers });
  }
  const grade = gradeSubmission(submission);
  if (grade.status === "invalid") {
    return Response.json({ error: "Soru veya cevap geçersiz." }, { status: 400, headers });
  }
  return Response.json(grade, { status: 200, headers });
}
