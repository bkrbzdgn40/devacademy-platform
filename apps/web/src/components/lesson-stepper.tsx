"use client";

import {useEffect,useRef,useState,type KeyboardEvent,type ReactNode} from "react";
import {replaceSearchParam} from "@/lib/url-state";

export type LessonStep = {
  id:string;
  label:string;
  title:string;
  content:ReactNode;
  // Questions answered in this stage; their first and latest result form the trail.
  questionIds?:string[];
};

const STAGE_PARAM="asama";
type Attempt={first:boolean;latest:boolean};
type Trail={tone:"hit"|"fixed"|"miss";text:string};

// The stage bar records how each guess went, so the "predict, then prove"
// idea of the home hero carries through the whole lesson.
function trailFor(step:LessonStep,attempts:Record<string,Attempt>):Trail|null{
  const ids=(step.questionIds??[]).filter(id=>attempts[id]);
  if(!ids.length)return null;
  const total=step.questionIds?.length??ids.length;
  if(total>1){
    const hits=ids.filter(id=>attempts[id].first).length;
    return {tone:hits===total?"hit":hits>0||ids.some(id=>attempts[id].latest)?"fixed":"miss",
      text:hits+"/"+total+" ilk denemede doğru"};
  }
  const a=attempts[ids[0]];
  const guess=step.id==="predict";
  if(a.first)return {tone:"hit",text:guess?"Tahminin tuttu":"İlk denemede doğru"};
  if(a.latest)return {tone:"fixed",text:"Sonra düzelttin"};
  return {tone:"miss",text:guess?"Tahminin tutmadı":"Henüz doğru değil"};
}

export function LessonStepper({steps}:{steps:LessonStep[]}){
  const [active,setActive]=useState(0);
  // Preserve answers in visited panels. CodeMirror stays unmounted until Apply.
  const [visited,setVisited]=useState<number[]>([0]);
  const navRef=useRef<HTMLElement>(null);
  const rootRef=useRef<HTMLElement>(null);
  const [attempts,setAttempts]=useState<Record<string,Attempt>>({});
  useEffect(()=>{
    const onGraded=(event:Event)=>{
      const detail=(event as CustomEvent<{questionId?:string;correct?:boolean}>).detail;
      const questionId=detail?.questionId,correct=detail?.correct;
      if(!questionId||typeof correct!=="boolean")return;
      setAttempts(old=>({...old,[questionId]:{first:old[questionId]?.first??correct,latest:correct}}));
    };
    window.addEventListener("devacademy:graded",onGraded);
    return ()=>window.removeEventListener("devacademy:graded",onGraded);
  },[]);
  // Content headings get scroll-margin-top equal to the sticky stage bar so a
  // jump never lands underneath it. The CSS fallback covers no-JS rendering.
  useEffect(()=>{
    const nav=navRef.current,root=rootRef.current;
    if(!nav||!root||typeof ResizeObserver==="undefined")return;
    const update=()=>{
      const top=parseFloat(getComputedStyle(nav).top)||0;
      root.style.setProperty("--lesson-stage-offset",Math.ceil(top+nav.offsetHeight+12)+"px");
    };
    update();
    const observer=new ResizeObserver(update);
    observer.observe(nav);
    return ()=>observer.disconnect();
  },[]);
  // Yenileme ya da geri dönüşte öğrenci kaldığı aşamaya döner (?asama=<id>).
  useEffect(()=>{
    const id=new URLSearchParams(window.location.search).get(STAGE_PARAM);
    const index=id?steps.findIndex(step=>step.id===id):-1;
    if(index<=0)return;
    // Hidrasyondan hemen sonra uygula (gizli sekmede de çalışır); sunucu çıktısı aşama 01 ile eşleşir.
    const timer=setTimeout(()=>{
      setActive(index);
      setVisited(old=>old.includes(index)?old:[...old,index]);
    },0);
    return ()=>clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- yalnızca ilk açılışta adresi oku
  },[]);
  if(!steps.length)return null;

  function openStep(index:number,fromFooter=false){
    if(index<0||index>=steps.length)return;
    setActive(index);
    setVisited(old=>old.includes(index)?old:[...old,index]);
    // Aşamalar geri tuşu geçmişini doldurmaz, yalnızca adres güncellenir.
    replaceSearchParam(STAGE_PARAM,index===0?null:steps[index].id);
    requestAnimationFrame(()=>{
      const heading=document.getElementById("lesson-step-heading-"+steps[index].id);
      const panel=heading?.parentElement;
      if(!heading||!panel)return;
      // Land on the new stage card and its heading, just below the sticky
      // stage bar. A card whose top is already visible is left where it is.
      const offset=parseFloat(getComputedStyle(panel).scrollMarginTop)||0;
      const top=panel.getBoundingClientRect().top;
      if(fromFooter||top<offset||top>window.innerHeight*.6)
        panel.scrollIntoView({block:"start",behavior:"instant"});
      // The footer can be far below a long exercise; move focus with the view.
      if(fromFooter)heading.focus({preventScroll:true});
    });
  }
  function onStepKeys(event:KeyboardEvent<HTMLElement>){
    const keys=["ArrowLeft","ArrowRight","Home","End"];
    if(!keys.includes(event.key))return;
    const buttons=Array.from(navRef.current?.querySelectorAll<HTMLButtonElement>(
      "button[data-lesson-step]"
    )??[]);
    if(!buttons.includes(event.target as HTMLButtonElement))return;
    event.preventDefault();
    const current=buttons.indexOf(event.target as HTMLButtonElement);
    const next=event.key==="Home"?0:event.key==="End"?buttons.length-1:
      (current+(event.key==="ArrowRight"?1:-1)+buttons.length)%buttons.length;
    buttons[next]?.focus();
  }

  return <section ref={rootRef} className="lesson-stepper" aria-label="Ders çalışma aşamaları">
    <div className="lesson-stage-position sr-only" aria-live="polite">
      <span>Aşama {active+1} / {steps.length}</span> <strong>{steps[active].label}</strong>
    </div>
    <nav className="lesson-stepper-nav" aria-label="Ders aşamaları"
      ref={navRef} onKeyDown={onStepKeys}>
      <ol>{steps.map((step,index)=>{const trail=trailFor(step,attempts);return <li key={step.id}
        className={"lesson-trail-node"+(trail?" is-"+trail.tone:"")+(index<active?" is-passed":"")}>
        <button type="button" data-lesson-step={index}
          aria-current={active===index?"step":undefined}
          aria-controls={visited.includes(index)?"lesson-step-panel-"+step.id:undefined}
          onClick={()=>openStep(index)}>
          <span className="lesson-step-number" aria-hidden="true">{trail?.tone==="hit"?"✓":trail?.tone==="miss"?"×":String(index+1).padStart(2,"0")}</span>
          <span className="lesson-step-text"><span>{step.label}</span>
            {trail&&<span className="lesson-trail-note">{trail.text}</span>}</span>
        </button>
      </li>;})}</ol>
    </nav>
    {steps.map((step,index)=>visited.includes(index)?<section key={step.id}
      id={"lesson-step-panel-"+step.id}
      className="lesson-step-panel" aria-labelledby={"lesson-step-heading-"+step.id}
      hidden={active!==index}>
      <h2 id={"lesson-step-heading-"+step.id} tabIndex={-1}>{step.title}</h2>
      {step.content}
    </section>:null)}
    <div className="lesson-step-actions">
      <button type="button" className="ui-button ui-button-secondary"
        data-stage-previous disabled={active===0}
        onClick={()=>openStep(active-1,true)}><span aria-hidden="true">←</span> Önceki aşama</button>
      {active<steps.length-1&&<button type="button" className="primary-button"
        data-stage-next onClick={()=>openStep(active+1,true)}>Sonraki aşama <span aria-hidden="true">→</span></button>}
      {active===steps.length-1&&<span className="lesson-last-stage-note">
        Son aşamadasın. Ders tamamlanma durumun, değerlendirme sonucuna bağlıdır.
      </span>}
    </div>
  </section>;
}
