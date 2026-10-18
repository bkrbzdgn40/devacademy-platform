import type { Metadata } from "next";
import Link from "next/link";
import {StatusPill} from "@/components/ui-primitives";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "DevAcademy | Yazılımı öğren, uygulayarak ilerle", template: "%s | DevAcademy" },
  description: "Programlama dillerini, yazılım kavramlarını ve teknolojileri keşfet.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="tr"><body>
    <a className="skip-link" href="#main-content">İçeriğe geç</a>
    <header className="site-header"><div className="shell nav-inner">
      <Link href="/" className="logo" aria-label="DevAcademy ana sayfa"><span className="logo-mark" aria-hidden="true">{"<>"}</span><span className="logo-type">DevAcademy</span></Link>
      <nav aria-label="Ana menü" className="nav-links">
        <Link href="/kurslar">Öğren</Link>
        <Link href="/pratik">Pratik yap</Link>
        <details className="nav-discovery"><summary>Keşfet</summary>
          <div className="nav-discovery-links">
            <Link href="/kutuphane/diller">Diller</Link>
            <Link href="/kutuphane/kavramlar">Kavramlar</Link>
            <Link href="/kutuphane/teknolojiler">Teknolojiler</Link>
          </div>
        </details>
        <Link href="/hesap">İlerlemem</Link>
      </nav>
      <span className="alpha-pill"><StatusPill tone="terracotta">Geliştirme önizlemesi</StatusPill></span>
    </div></header>
    <main id="main-content">{children}</main>
    <footer className="footer"><div className="shell footer-inner"><span>© DevAcademy · Eğitim odaklı yazılım laboratuvarı</span><span>İlk sürüm geliştirme aşamasında</span></div></footer>
  </body></html>;
}
