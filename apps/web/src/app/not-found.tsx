import type {Metadata} from "next";
import Link from "next/link";
import {OutputTeaser} from "@/components/output-teaser";
// Own title so the 404 does not reuse the home page title.
export const metadata:Metadata={title:"Sayfa bulunamadı",robots:{index:false}};
export default function NotFound() {
  return <section className="shell notfound teaser-header"><div><p className="overline">404 · Sayfa bulunamadı</p><h1>Bu sayfa henüz burada değil.</h1><p>Aradığın konuyu kütüphanede bulabilirsin.</p><div className="notfound-actions"><Link className="primary-button" href="/">Ana sayfaya dön →</Link><Link className="ui-button ui-button-secondary" href="/kutuphane/kavramlar">Kavramlar kütüphanesi</Link></div></div><OutputTeaser file="bu-sayfa.js" code={`const site = { dersler: 23 };
console.log(site.buSayfa);`} answer="undefined"
    explanation="Olmayan bir özelliği okumak hata vermez, undefined döner. Aradığın sayfa da tam olarak böyle: tanımlı değil."/></section>;
}
