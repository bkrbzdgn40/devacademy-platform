import { executionLabEnabled } from "@/server/execution-store.mjs";
import { isDatabaseConfigured, json } from "@/server/http.mjs";
export const runtime="nodejs";
export const dynamic="force-dynamic";
export async function GET() {
  return json({enabled:executionLabEnabled()&&isDatabaseConfigured(),runtimeId:"nodejs-24",maxSourceBytes:8192});
}
