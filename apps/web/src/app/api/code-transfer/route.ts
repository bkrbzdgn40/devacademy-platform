import {currentLearner} from "@/server/auth.mjs";
import {getCodeTransferState,supportsCodeTransfer} from "@/server/code-transfer.mjs";
import {isDatabaseConfigured,json} from "@/server/http.mjs";
export const runtime="nodejs";
export const dynamic="force-dynamic";
export async function GET(request:Request) {
  const lessonId=new URL(request.url).searchParams.get("lessonId");
  if(!supportsCodeTransfer(lessonId))
    return json({error:"Bu kavram için bağımsız kod görevi henüz bulunmuyor."},404);
  if(!isDatabaseConfigured())
    return json({error:"Veritabanı yapılandırılmamış."},503);
  try {
    const learner=await currentLearner(request);
    if(!learner)return json({error:"Oturum gerekli."},401);
    return json(await getCodeTransferState(learner.learnerId,lessonId));
  } catch {return json({error:"Kod aktarım kanıtı okunamadı."},503);}
}
