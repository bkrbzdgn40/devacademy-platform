import {canonicalFor} from "@/lib/site-url.mjs";
import type { Metadata } from "next";
import Link from "next/link";
import { CodePlayground } from "@/components/code-playground";
export const metadata: Metadata = {...canonicalFor("/laboratuvar"),title:"Kod laboratuvarı",description:"Tarayıcıda JavaScript kodu yaz, çıktısını önce tahmin et ve sözdizimi renklendirmeli editörde dene."};
const sample=`function greet(name) {
  return \`Merhaba, \${name}!\`;
}
console.log(greet("DevAcademy"));`;
export default function LabPage(){
  return <section className="shell listing-page lab-page"><Link className="back-link" href="/dersler">← Derslere dön</Link>
    <div className="listing-header"><p className="overline">Yerel laboratuvar</p><h1>Kod laboratuvarı</h1><p>JavaScript kodunu satır numaraları, vurgulama ve otomatik tamamlama ile düzenle.</p></div>
    <div className="availability-note">Kodlar burada çalıştırılmaz. Güvenlik sınırı kanıtlanana kadar çalıştırma işlevi kapalıdır.</div>
    <CodePlayground starterCode={sample}/>
  </section>;
}
