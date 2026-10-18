"use client";
import {useEffect,useId,useRef,useState,useSyncExternalStore} from "react";
import type {KeyboardEvent} from "react";

type Preference="light"|"dark"|"system";
type ResolvedTheme="light"|"dark";
const KEY="devacademy-theme";
const EVENT="devacademy-theme-change";
const choices:ReadonlyArray<{value:Preference;label:string}>=[
  {value:"system",label:"Sistem"},
  {value:"light",label:"Açık"},
  {value:"dark",label:"Koyu"}
];
const preferences:Preference[]=choices.map(choice=>choice.value);
function valid(value:string|null):value is Preference{
  return value!==null&&preferences.includes(value as Preference);
}
function selection():Preference{
  if(typeof document==="undefined")return "system";
  const value=document.documentElement.dataset.themePreference;
  return valid(value??null)?value as Preference:"system";
}
function subscribe(update:()=>void){
  window.addEventListener(EVENT,update);
  window.addEventListener("storage",update);
  return ()=>{window.removeEventListener(EVENT,update);window.removeEventListener("storage",update)};
}
export function useResolvedTheme():ResolvedTheme{
  return useSyncExternalStore(subscribe,
    ()=>document.documentElement.dataset.theme==="dark"?"dark":"light",()=>"light");
}
function apply(preference:Preference){
  const systemDark=window.matchMedia("(prefers-color-scheme: dark)").matches;
  const resolved:ResolvedTheme=preference==="system"?(systemDark?"dark":"light"):preference;
  document.documentElement.dataset.theme=resolved;
  document.documentElement.dataset.themePreference=preference;
  document.documentElement.style.colorScheme=resolved;
  window.dispatchEvent(new Event(EVENT));
}
export function ThemeSwitcher(){
  const preference=useSyncExternalStore<Preference>(subscribe,selection,()=>"system");
  const [open,setOpen]=useState(false);
  const menuId=useId();
  const containerRef=useRef<HTMLDivElement>(null);
  const triggerRef=useRef<HTMLButtonElement>(null);
  const menuRef=useRef<HTMLDivElement>(null);
  const initialFocus=useRef<Preference|null>(null);

  useEffect(()=>{
    // The early head bootstrap sets the initial scheme before first paint.
    const media=window.matchMedia("(prefers-color-scheme: dark)");
    const resync=()=>{
      let stored:Preference="system";
      try{const candidate=localStorage.getItem(KEY);if(valid(candidate))stored=candidate;}
      catch{/* The control still works for this page when storage is blocked. */}
      apply(stored);
    };
    media.addEventListener("change",resync);
    window.addEventListener("focus",resync);
    window.addEventListener("pageshow",resync);
    document.addEventListener("visibilitychange",resync);
    window.addEventListener("storage",resync);
    return ()=>{
      media.removeEventListener("change",resync);
      window.removeEventListener("focus",resync);
      window.removeEventListener("pageshow",resync);
      document.removeEventListener("visibilitychange",resync);
      window.removeEventListener("storage",resync);
    };
  },[]);

  useEffect(()=>{
    if(!open)return;
    const target=initialFocus.current??preference;
    menuRef.current?.querySelector<HTMLButtonElement>(
      '[data-theme-choice="'+target+'"]'
    )?.focus();
    initialFocus.current=null;
    const dismissPointer=(event:PointerEvent)=>{
      if(!containerRef.current?.contains(event.target as Node))setOpen(false);
    };
    const dismissFocus=(event:FocusEvent)=>{
      if(!containerRef.current?.contains(event.target as Node))setOpen(false);
    };
    document.addEventListener("pointerdown",dismissPointer);
    document.addEventListener("focusin",dismissFocus);
    return ()=>{
      document.removeEventListener("pointerdown",dismissPointer);
      document.removeEventListener("focusin",dismissFocus);
    };
  },[open,preference]);

  function selectTheme(value:Preference){
    try{if(value==="system")localStorage.removeItem(KEY);else localStorage.setItem(KEY,value);}
    catch{/* Keep the currently applied theme without storage. */}
    apply(value);
    setOpen(false);
    triggerRef.current?.focus();
  }
  function onTriggerKeyDown(event:KeyboardEvent<HTMLButtonElement>){
    if(event.key==="ArrowDown"||event.key==="ArrowUp"){
      event.preventDefault();
      initialFocus.current=event.key==="ArrowDown"?"system":"dark";
      setOpen(true);
    }else if(event.key==="Escape"&&open){
      event.preventDefault();
      setOpen(false);
    }
  }
  function onMenuKeyDown(event:KeyboardEvent<HTMLDivElement>){
    if(event.key==="Escape"){
      event.preventDefault();
      setOpen(false);
      triggerRef.current?.focus();
      return;
    }
    if(event.key==="Tab"){setOpen(false);return;}
    if(!["ArrowDown","ArrowUp","Home","End"].includes(event.key))return;
    event.preventDefault();
    const options=Array.from(menuRef.current?.querySelectorAll<HTMLButtonElement>(
      ".theme-control-option"
    )??[]);
    if(!options.length)return;
    const current=options.indexOf(document.activeElement as HTMLButtonElement);
    let next=0;
    if(event.key==="End")next=options.length-1;
    else if(event.key==="Home")next=0;
    else if(event.key==="ArrowDown")next=(current+1)%options.length;
    else next=(current<0?0:current+options.length-1)%options.length;
    options[next]?.focus();
  }
  const label=choices.find(choice=>choice.value===preference)?.label??"Sistem";
  return <div className="theme-control" ref={containerRef}>
    <span className="theme-control-label">Görünüm</span>
    <button ref={triggerRef} type="button" className="theme-control-trigger"
  aria-label={"Görünüm teması: "+label}
  aria-haspopup="menu" aria-expanded={open} aria-controls={menuId}
  onClick={()=>{initialFocus.current=preference;setOpen(previous=>!previous);}}
  onKeyDown={onTriggerKeyDown}>
  <span>{label}</span>
</button>
    {open&&<div id={menuId} ref={menuRef} className="theme-control-menu"
      role="menu" aria-label="Görünüm teması seçenekleri" onKeyDown={onMenuKeyDown}>
      {choices.map(choice=><button key={choice.value} type="button"
        className="theme-control-option" data-theme-choice={choice.value}
        role="menuitemradio" aria-checked={preference===choice.value}
        onClick={()=>selectTheme(choice.value)}>
        <span>{choice.label}</span>
        <span className="theme-control-check" aria-hidden="true">✓</span>
      </button>)}
    </div>}
  </div>;
}
