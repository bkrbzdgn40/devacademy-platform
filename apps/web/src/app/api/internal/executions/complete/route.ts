import { workerGuard } from "@/server/execution-worker-auth.mjs";
import { completeExecution, validCompletion } from "@/server/execution-store.mjs";
import { isDatabaseConfigured, json, readJson } from "@/server/http.mjs";
export const runtime="nodejs";
export const dynamic="force-dynamic";
export async function POST(request:Request) {
  const forbidden=workerGuard(request);
  if(forbidden)return forbidden;
  if(!isDatabaseConfigured())return json({error:"Veritabanı yapılandırılmamış."},503);
  const parsed=await readJson(request,18000);
  if(parsed.error)return parsed.error;
  if(!validCompletion(parsed.value))return json({error:"Geçersiz sonuç."},400);
  try {
    const accepted=await completeExecution(parsed.value);
    return accepted?json({accepted:true}):json({error:"İş bulunamadı veya süre doldu."},409);
  } catch {return json({error:"Sonuç kaydedilemedi."},503);}
}
