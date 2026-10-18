"use client";
import {useEffect,useSyncExternalStore} from "react";

type Preference="light"|"dark"|"system";
type ResolvedTheme="light"|"dark";
const KEY="devacademy-theme";
const EVENT="devacademy-theme-change";
const preferences:Preference[]=["system","light","dark"];
function valid(value:string|null):value is Preference{
  return value!==null&&preferences.includes(value as Preference);
}
function selection():Preference {
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
  const preference=useSyncExternalStore(subscribe,selection,()=>"system");
  useEffect(()=>{
    // A user-selected scheme is applied in the early head bootstrap, before paint.
    // The following handles live OS setting updates and storage changes.
    const media=window.matchMedia("(prefers-color-scheme: dark)");
    const resync=()=>{
      let stored:Preference="system";
      try{const candidate=localStorage.getItem(KEY);if(valid(candidate))stored=candidate;}
      catch{/* Private browsing/storage-blocked mode still supports this session. */}
      apply(stored);
    };
    media.addEventListener("change",resync);
    // Browsers can defer media-change delivery while a tab is backgrounded.
    // Re-evaluate on return so System mode cannot retain a stale palette.
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
  function onSelect(value:string){
    if(!valid(value))return;
    try{if(value==="system")localStorage.removeItem(KEY);else localStorage.setItem(KEY,value)}
    catch{/* Keep the active choice this session, even if persistence is blocked. */}
    apply(value);
  }
  return <label className="theme-control">
    <span className="theme-control-label">Görünüm</span>
    <select aria-label="Görünüm teması" value={preference}
      onChange={e=>onSelect(e.target.value)}>
      <option value="system">Sistem</option>
      <option value="light">Açık</option>
      <option value="dark">Koyu</option>
    </select>
  </label>;
}
