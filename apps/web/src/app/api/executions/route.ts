import { currentLearner } from "@/server/auth.mjs";
import { enqueueExecution, executionLabEnabled } from "@/server/execution-store.mjs";
import { checkMutatingRequest, isDatabaseConfigured, json, readJson } from "@/server/http.mjs";
export const runtime="nodejs";
export const dynamic="force-dynamic";
export async function POST(request:Request) {
  if(!executionLabEnabled())return json({error:"Kod çalıştırma laboratuvarı kapalı."},503);
  const badOrigin=checkMutatingRequest(request);
  if(badOrigin)return badOrigin;
  if(!isDatabaseConfigured())return json({error:"Veritabanı yapılandırılmamış."},503);
  try {
    const learner=await currentLearner(request);
    if(!learner)return json({error:"Oturum gerekli."},401);
    const body=await readJson(request,10000);
    if(body.error)return body.error;
    const {source,requestId}=body.value as Record<string,unknown>;
    const result=await enqueueExecution(learner.learnerId,{source,requestId});
    if(result.status==="invalid")return json({error:"Geçersiz veya fazla büyük kod/istek kimliği."},400);
    if(result.status==="limited")return json({error:"Çalıştırma kotasına ulaşıldı."},429);
    return json(result.job,result.status==="queued"?202:200);
  } catch {return json({error:"İş kuyruğu kullanılamıyor."},503);}
}
