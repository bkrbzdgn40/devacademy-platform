import {canonicalFor} from "@/lib/site-url.mjs";
import type { Metadata } from "next";
import Link from "next/link";
import { AccountPanel } from "@/components/account-panel";

export const metadata: Metadata = { ...canonicalFor("/hesap"), title: "Hesabım", description: "DevAcademy hesabına giriş yap; tamamladığın dersleri, tahmin sonuçlarını ve tekrar bekleyen soruları tek yerde gör." };
export default function AccountPage() {
  return <section className="shell account-page">
    <Link href="/dersler" className="back-link">← JavaScript dersleri</Link>
    <header className="listing-header"><p className="overline">DevAcademy hesabın</p><h1>Öğrenmeye kaldığın yerden devam et.</h1><p>İlerleme kayıtları yalnızca kendi hesabına aittir.</p></header>
    <div className="account-layout">
      <AccountPanel />
      <aside className="account-aside" aria-label="Hesap kapsamı">
        <p className="overline">Kayıt ve gizlilik</p>
        <h2>Hesap neleri saklar?</h2>
        <ul className="account-aside-list">
          <li><strong>Ders ilerlemesi:</strong> Tamamladığın dersler ve kaldığın sıradaki adım yalnızca kendi oturumunda görünür.</li>
          <li><strong>Aralıklı tekrar:</strong> Yanlış veya pekiştirilecek sorular zamanı geldiğinde tekrar sırasına girer.</li>
          <li><strong>Minimum veri:</strong> E-posta veya profil bilgisi toplanmaz; hesabını ve tüm kayıtlarını istediğin an silebilirsin.</li>
        </ul>
        <div className="account-aside-links">
          <Link href="/kurslar" className="catalog-lesson-link">Kursları incele →</Link>
          <Link href="/tekrar" className="catalog-lesson-link">Tekrar oturumuna git →</Link>
        </div>
      </aside>
    </div>
  </section>;
}
