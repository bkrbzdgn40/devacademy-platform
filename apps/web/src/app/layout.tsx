import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import {ThemeSwitcher} from "@/components/theme-switcher";
import {StatusPill} from "@/components/ui-primitives";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "DevAcademy | Yazılımı öğren, uygulayarak ilerle", template: "%s | DevAcademy" },
  description: "Programlama dillerini, yazılım kavramlarını ve teknolojileri keşfet.",
};

const themeBoot="// M8.6 dark theme initial boot: keep it tiny and run before first CSS paint.\n// Not a source of account preferences. System preference is the default.\ntry {\n  var pref=localStorage.getItem(\"devacademy-theme\");\n  if(pref!==\"light\"&&pref!==\"dark\")pref=\"system\";\n  var dark=pref===\"dark\"||(pref===\"system\"&&window.matchMedia(\"(prefers-color-scheme: dark)\").matches);\n  var root=document.documentElement;\n  root.dataset.theme=dark?\"dark\":\"light\";\n  root.dataset.themePreference=pref;\n  root.style.colorScheme=dark?\"dark\":\"light\";\n}catch(e){\n  document.documentElement.dataset.theme=\"light\";\n  document.documentElement.dataset.themePreference=\"system\";\n}\n";

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="tr" suppressHydrationWarning><body>
    <Script id="devacademy-theme-boot" strategy="beforeInteractive" dangerouslySetInnerHTML={{__html:themeBoot}}/>
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
      <ThemeSwitcher/>
      <span className="alpha-pill"><StatusPill tone="terracotta">Geliştirme önizlemesi</StatusPill></span>
    </div></header>
    <main id="main-content">{children}</main>
    <footer className="footer"><div className="shell footer-inner"><span>© DevAcademy · Eğitim odaklı yazılım laboratuvarı</span><span>İlk sürüm geliştirme aşamasında</span></div></footer>
  </body></html>;
}
