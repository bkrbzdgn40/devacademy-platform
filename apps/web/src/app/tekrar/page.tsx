import {canonicalFor} from "@/lib/site-url.mjs";
import Link from "next/link";
import type {Metadata} from "next";
import {ReviewSession} from "@/components/review-session";
export const metadata:Metadata={...canonicalFor("/tekrar"),title:"Kişisel tekrar",description:"Yanlış ve doğru cevapladığın soruların zamanlanmış tekrarları; unutmadan önce yeniden karşına çıkar."};
export default function ReviewPage(){
 return <section className="shell review-page">
   <Link className="back-link" href="/kurslar">← Kurslara dön</Link>
   <header className="listing-header"><p className="overline">Öğrenme laboratuvarı · Aralıklı tekrar</p>
     <h1>Hatırladığını kanıtla.</h1>
     <p>Tekrarlar geçmiş cevaplarına göre zamanlanır.</p>
   </header>
   <ReviewSession/>
 </section>;
}
