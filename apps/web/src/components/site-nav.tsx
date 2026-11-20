"use client";
import Link from "next/link";
import {usePathname} from "next/navigation";
import {ViewTransition} from "react";

// One shared pill: when the section changes it slides from the old link to the new one.
const Pill=()=><ViewTransition name="nav-pill" share="nav-pill-slide" enter="nav-pill-enter" exit="nav-pill-exit"><span className="nav-pill" aria-hidden="true"/></ViewTransition>;

type Section="learn"|"practice"|"discover"|"account"|null;
function within(pathname:string,base:string){return pathname===base||pathname.startsWith(base+"/");}
export function sectionFor(pathname:string):Section{
  if(within(pathname,"/kurslar"))return "learn";
  if(within(pathname,"/pratik")||within(pathname,"/laboratuvar"))return "practice";
  if(within(pathname,"/kutuphane")||within(pathname,"/radar"))return "discover";
  if(within(pathname,"/hesap"))return "account";
  return null;
}

export function SiteNav(){
  const pathname=usePathname()??"/";
  const section=sectionFor(pathname);
  const current=(name:Section)=>section===name?"page" as const:undefined;
  const here=(base:string)=>within(pathname,base)?"page" as const:undefined;
  return <nav aria-label="Ana menü" className="nav-links">
    <Link href="/kurslar" aria-current={current("learn")}>{section==="learn"&&<Pill/>}<span className="nav-label" style={{viewTransitionName:"nav-label-learn",viewTransitionClass:"nav-label"}}>Öğren</span></Link>
    <Link href="/pratik" aria-current={current("practice")}>{section==="practice"&&<Pill/>}<span className="nav-label" style={{viewTransitionName:"nav-label-practice",viewTransitionClass:"nav-label"}}>Pratik yap</span></Link>
    <details className="nav-discovery"><summary aria-current={current("discover")}>{section==="discover"&&<Pill/>}<span className="nav-label" style={{viewTransitionName:"nav-label-discover",viewTransitionClass:"nav-label"}}>Keşfet</span></summary>
      <div className="nav-discovery-links">
        <Link href="/kutuphane/diller" aria-current={here("/kutuphane/diller")}>Diller</Link>
        <Link href="/kutuphane/kavramlar" aria-current={here("/kutuphane/kavramlar")}>Kavramlar</Link>
        <Link href="/kutuphane/teknolojiler" aria-current={here("/kutuphane/teknolojiler")}>Teknolojiler</Link>
        <Link href="/radar" aria-current={here("/radar")}>Sektör Radarı</Link>
      </div>
    </details>
    <Link href="/hesap" aria-current={current("account")}>{section==="account"&&<Pill/>}<span className="nav-label" style={{viewTransitionName:"nav-label-account",viewTransitionClass:"nav-label"}}>İlerlemem</span></Link>
  </nav>;
}
