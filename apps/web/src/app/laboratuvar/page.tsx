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
    <div className="lab-layout">
      <CodePlayground starterCode={sample}/>
      <aside className="ui-card lab-aside" aria-label="Editör rehberi">
        <p className="overline">Çalışma alanı notu</p>
        <h2>Bu editör ne için?</h2>
        <p>Sözdizimini okumak, kendi çözüm taslağını yazmak ve kod yapısını görmek için açık bir CodeMirror alanıdır.</p>
        <ul className="lab-aside-list">
          <li><strong>Adım adım izleme:</strong> Kodu tahmin edip satır satır incelemek için ders stüdyolarını kullan.</li>
          <li><strong>Fonksiyon görevleri:</strong> Açık örnekler ve gizli testler için kod pratiği sayfasına geç.</li>
          <li><strong>Kısayol:</strong> Editörde tamamlama önerileri için <code>Ctrl + Space</code> kullanabilirsin.</li>
        </ul>
        <div className="lab-aside-links">
          <Link href="/pratik" className="catalog-lesson-link">Kod pratiği görevlerine git →</Link>
          <Link href="/kurslar/javascript-temelleri" className="catalog-lesson-link">JavaScript Temelleri dersleri →</Link>
        </div>
      </aside>
    </div>
  </section>;
}
