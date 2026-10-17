import Link from "next/link";
import type {Metadata} from "next";
import {ReviewSession} from "@/components/review-session";
export const metadata:Metadata={title:"Kişisel tekrar",description:"Yanlışların ve doğru cevaplarının zamanlanmış tekrarları."};
export default function ReviewPage(){
 return <section className="shell review-page">
   <Link className="back-link" href="/kurslar">← Kurslara dön</Link>
   <header className="listing-header"><p className="overline">Öğrenme laboratuvarı · Aralıklı tekrar</p>
     <h1>Hatırladığını kanıtla.</h1>
     <p>Tekrarlar rastgele değil, geçmiş cevaplarına göre zamanlanır. Amaç ezberlenmiş işaretlemeleri değil, konuyu gerçekten hatırlamayı geliştirmek.</p>
   </header>
   <ReviewSession/>
 </section>;
}
