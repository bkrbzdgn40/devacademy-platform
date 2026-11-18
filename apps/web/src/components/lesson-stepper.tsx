"use client";

import {useEffect,useRef,useState,type KeyboardEvent,type ReactNode} from "react";

export type LessonStep = {
  id:string;
  label:string;
  title:string;
  content:ReactNode;
};

export function LessonStepper({steps}:{steps:LessonStep[]}){
  const [active,setActive]=useState(0);
  // Preserve answers in visited panels. CodeMirror stays unmounted until Apply.
  const [visited,setVisited]=useState<number[]>([0]);
  const navRef=useRef<HTMLElement>(null);
  const rootRef=useRef<HTMLElement>(null);
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
  if(!steps.length)return null;

  function openStep(index:number,fromFooter=false){
    if(index<0||index>=steps.length)return;
    setActive(index);
    setVisited(old=>old.includes(index)?old:[...old,index]);
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
    <div className="lesson-stage-bar">
      <span className="ui-eyebrow">Çalışma akışı</span>
      <div className="lesson-stage-position" aria-live="polite">
        <span>Aşama {active+1} / {steps.length}</span>
        <strong>{steps[active].label}</strong>
      </div>
      <progress value={active+1} max={steps.length}
        aria-label={"Ders aşamasındaki konum: "+(active+1)+"/"+steps.length}/>
    </div>
    <nav className="lesson-stepper-nav" aria-label="Ders aşamaları"
      ref={navRef} onKeyDown={onStepKeys}>
      <ol>{steps.map((step,index)=><li key={step.id}>
        <button type="button" data-lesson-step={index}
          aria-current={active===index?"step":undefined}
          aria-controls={visited.includes(index)?"lesson-step-panel-"+step.id:undefined}
          onClick={()=>openStep(index)}>
          <span className="lesson-step-number">{String(index+1).padStart(2,"0")}</span>
          <span>{step.label}</span>
        </button>
      </li>)}</ol>
    </nav>
    <p className="lesson-step-count">
      Aşamalar arasında geçiş yapabilirsin. Görüntülediğin soruların yanıtları bu sayfada korunur.
    </p>
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
        onClick={()=>openStep(active-1,true)}>← Önceki aşama</button>
      {active<steps.length-1&&<button type="button" className="primary-button"
        data-stage-next onClick={()=>openStep(active+1,true)}>Sonraki aşama →</button>}
      {active===steps.length-1&&<span className="lesson-last-stage-note">
        Son aşamadasın. Ders tamamlanma durumun, değerlendirme sonucuna bağlıdır.
      </span>}
    </div>
  </section>;
}
