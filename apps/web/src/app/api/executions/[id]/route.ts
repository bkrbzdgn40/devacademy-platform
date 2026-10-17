import { currentLearner } from "@/server/auth.mjs";
import { executionLabEnabled, getExecution } from "@/server/execution-store.mjs";
import { isDatabaseConfigured, json } from "@/server/http.mjs";
export const runtime="nodejs";
export const dynamic="force-dynamic";
export async function GET(request:Request,{params}:{params:Promise<{id:string}>}) {
  if(!executionLabEnabled())return json({error:"Kod çalıştırma laboratuvarı kapalı."},503);
  if(!isDatabaseConfigured())return json({error:"Veritabanı yapılandırılmamış."},503);
  try {
    const learner=await currentLearner(request);
    if(!learner)return json({error:"Oturum gerekli."},401);
    const {id}=await params;
    const job=await getExecution(learner.learnerId,id);
    return job?json(job):json({error:"İş bulunamadı."},404);
  } catch{return json({error:"İş durumu okunamadı."},503);}
}
