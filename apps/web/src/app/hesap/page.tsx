import type { Metadata } from "next";
import Link from "next/link";
import { AccountPanel } from "@/components/account-panel";

export const metadata: Metadata = { title: "Hesabım", description: "DevAcademy hesabın ve kaydedilen ders ilerlemen." };
export default function AccountPage() {
  return <section className="shell account-page">
    <Link href="/dersler" className="back-link">← JavaScript dersleri</Link>
    <header className="listing-header"><p className="overline">DevAcademy hesabın</p><h1>Öğrenmeye kaldığın yerden devam et.</h1><p>İlerleme kayıtları yalnızca kendi hesabına aittir.</p></header>
    <AccountPanel />
  </section>;
}
