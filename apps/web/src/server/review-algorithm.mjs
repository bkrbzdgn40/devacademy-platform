// Lightweight spaced retrieval algorithm, deliberately not a claim of measured mastery.
// First correct: 1d; later successful due reviews: 3d, 7d, 14d, 30d.
// Wrong: short 10-minute corrective loop and streak reset.
// Re-answering a correct card early cannot farm intervals.
const DAYS=[0,1,3,7,14,30];
const MAX_STAGE=5;
export function nextReview(previous,isCorrect,now=new Date()){
  if(typeof isCorrect!=="boolean" ||!(now instanceof Date)||Number.isNaN(now.getTime()))
    throw Error("INVALID_REVIEW_INPUT");
  const prior=previous??{stage:0,lapses:0,dueAt:null,attempts:0};
  if(!Number.isInteger(prior.stage)||prior.stage<0||prior.stage>MAX_STAGE ||
    !Number.isInteger(prior.lapses)||prior.lapses<0||
    !Number.isInteger(prior.attempts)||prior.attempts<0)throw Error("INVALID_REVIEW_STATE");
  let stage=prior.stage,dueAt;
  let lapses=prior.lapses;
  if(!isCorrect){
    stage=0;lapses++;
    dueAt=new Date(now.getTime()+10*60*1000);
  }else if(prior.dueAt&&new Date(prior.dueAt).getTime()>now.getTime()&&prior.stage>0){
    // An early correct answer is logged, but doesn't postpone or accelerate review.
    dueAt=new Date(prior.dueAt);
  }else{
    stage=Math.min(stage+1,MAX_STAGE);
    dueAt=new Date(now.getTime()+DAYS[stage]*86400000);
  }
  return {stage,lapses,attempts:prior.attempts+1,dueAt};
}
