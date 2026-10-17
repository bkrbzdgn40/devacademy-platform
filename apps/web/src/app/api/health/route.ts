// This endpoint checks the web process only, not future dependencies.
export async function GET() {
  return Response.json({ status: "ok", service: "devacademy-web", readiness: "web-only" }, { headers: { "Cache-Control": "no-store" } });
}
