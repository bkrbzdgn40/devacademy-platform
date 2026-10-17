import { workerGuard } from "@/server/execution-worker-auth.mjs";
import { claimExecution } from "@/server/execution-store.mjs";
import { isDatabaseConfigured, json } from "@/server/http.mjs";
export const runtime="nodejs";
export const dynamic="force-dynamic";
export async function POST(request:Request) {
  const forbidden=workerGuard(request);
  if(forbidden)return forbidden;
  if(!isDatabaseConfigured())return json({error:"Veritabanı yapılandırılmamış."},503);
  try {
    const job=await claimExecution();
    return job?json(job):new Response(null,{status:204,headers:{"Cache-Control":"no-store"}});
  } catch {return json({error:"Kuyruktan iş alınamadı."},503);}
}
