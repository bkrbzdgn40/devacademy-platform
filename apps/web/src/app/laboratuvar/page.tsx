import type { Metadata } from "next";
import Link from "next/link";
import { CodePlayground } from "@/components/code-playground";
export const metadata: Metadata = {title:"Kod laboratuvarı",description:"CodeMirror 6 ile JavaScript kodu düzenle."};
const sample=`function greet(name) {
  return \`Merhaba, \${name}!\`;
}
console.log(greet("DevAcademy"));`;
export default function LabPage(){
  return <section className="shell listing-page lab-page"><Link className="back-link" href="/dersler">← Derslere dön</Link>
    <div className="listing-header"><p className="overline">Geliştirme önizlemesi</p><h1>Kod laboratuvarı</h1><p>JavaScript kodunu satır numaraları, vurgulama ve otomatik tamamlama ile düzenle.</p></div>
    <div className="availability-note">Kodlar burada çalıştırılmaz. Güvenlik sınırı kanıtlanana kadar çalıştırma işlevi kapalıdır.</div>
    <CodePlayground starterCode={sample}/>
  </section>;
}
