import {currentLearner} from "@/server/auth.mjs";
import {getTransferState,startTransfer,submitTransfer,supportsTransfer} from "@/server/transfer-store.mjs";
import {checkMutatingRequest,isDatabaseConfigured,json,readJson} from "@/server/http.mjs";
export const runtime="nodejs";
export const dynamic="force-dynamic";

export async function GET(request:Request) {
  const lessonId=new URL(request.url).searchParams.get("lessonId");
  if(!supportsTransfer(lessonId))return json({error:"Bu ders için bağımsız görev henüz yok."},404);
  if(!isDatabaseConfigured())return json({error:"Hesap sistemi yapılandırılmamış."},503);
  try {
    const user=await currentLearner(request);
    if(!user)return json({error:"Oturum gerekli."},401);
    return json(await getTransferState(user.learnerId,lessonId));
  } catch {return json({error:"Transfer durumu alınamadı."},503);}
}
export async function POST(request:Request) {
  const forbidden=checkMutatingRequest(request);
  if(forbidden)return forbidden;
  if(!isDatabaseConfigured())return json({error:"Hesap sistemi yapılandırılmamış."},503);
  const payload=await readJson(request,1024);
  if(payload.error)return payload.error;
  const input=payload.value as Record<string,unknown>;
  if(!supportsTransfer(input.lessonId)||!["start","submit"].includes(String(input.operation)))
    return json({error:"Geçersiz transfer isteği."},400);
  try {
    const user=await currentLearner(request);
    if(!user)return json({error:"Oturum gerekli."},401);
    const result=input.operation==="start"?
      await startTransfer(user.learnerId,input.lessonId):
      await submitTransfer(user.learnerId,input);
    if(result.status==="invalid")return json({error:"Yanıt biçimi geçersiz."},400);
    if(["locked","unavailable","waiting","cooldown","stale"].includes(result.status))return json(result,409);
    return json(result);
  } catch {return json({error:"Transfer kaydedilemedi."},503);}
}
