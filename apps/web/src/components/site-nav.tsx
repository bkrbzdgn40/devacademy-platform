"use client";
import Link from "next/link";
import {usePathname} from "next/navigation";

type Section="learn"|"practice"|"discover"|"account"|null;
function within(pathname:string,base:string){return pathname===base||pathname.startsWith(base+"/");}
export function sectionFor(pathname:string):Section{
  if(within(pathname,"/kurslar"))return "learn";
  if(within(pathname,"/pratik"))return "practice";
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
    <Link href="/kurslar" aria-current={current("learn")}>Öğren</Link>
    <Link href="/pratik" aria-current={current("practice")}>Pratik yap</Link>
    <details className="nav-discovery"><summary aria-current={current("discover")}>Keşfet</summary>
      <div className="nav-discovery-links">
        <Link href="/kutuphane/diller" aria-current={here("/kutuphane/diller")}>Diller</Link>
        <Link href="/kutuphane/kavramlar" aria-current={here("/kutuphane/kavramlar")}>Kavramlar</Link>
        <Link href="/kutuphane/teknolojiler" aria-current={here("/kutuphane/teknolojiler")}>Teknolojiler</Link>
        <Link href="/radar" aria-current={here("/radar")}>Sektör Radarı</Link>
      </div>
    </details>
    <Link href="/hesap" aria-current={current("account")}>İlerlemem</Link>
  </nav>;
}
