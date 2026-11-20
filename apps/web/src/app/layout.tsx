import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import {ViewTransition} from "react";
import {Fraunces,Inter} from "next/font/google";
import {LogoMark} from "@/components/logo-mark";
import {SiteNav} from "@/components/site-nav";
import {ThemeSwitcher} from "@/components/theme-switcher";
import {StatusPill} from "@/components/ui-primitives";
import {siteOrigin} from "@/lib/site-url.mjs";
import "./globals.css";

// Display: Fraunces with optical sizing; body: Inter. Both carry Turkish glyphs (latin-ext).
const display=Fraunces({subsets:["latin","latin-ext"],axes:["opsz","SOFT"],variable:"--font-fraunces",display:"swap"});
const body=Inter({subsets:["latin","latin-ext"],variable:"--font-inter",display:"swap"});
const origin=siteOrigin();
export const metadata: Metadata = {
  ...(origin?{metadataBase:new URL(origin)}:{}),
  title: { default: "DevAcademy | Yazılımı öğren, uygulayarak ilerle", template: "%s | DevAcademy" },
  description: "Programlama dillerini, yazılım kavramlarını ve teknolojileri keşfet.",
};

const themeBoot=`// M8.6 dark theme initial boot: keep it tiny and run before first CSS paint.
// Not a source of account preferences. System preference is the default.
// theme-booting disables every transition until the first frame has painted,
// so colors never animate from the light palette into the stored theme.
var root=document.documentElement;
root.classList.add("theme-booting");
try {
  var pref=localStorage.getItem("devacademy-theme");
  if(pref!=="light"&&pref!=="dark")pref="system";
  var dark=pref==="dark"||(pref==="system"&&window.matchMedia("(prefers-color-scheme: dark)").matches);
  root.dataset.theme=dark?"dark":"light";
  root.dataset.themePreference=pref;
  root.style.colorScheme=dark?"dark":"light";
}catch(e){
  root.dataset.theme="light";
  root.dataset.themePreference="system";
}
requestAnimationFrame(function(){requestAnimationFrame(function(){root.classList.remove("theme-booting");});});
`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="tr" className={display.variable+" "+body.variable} suppressHydrationWarning><body>
    <Script id="devacademy-theme-boot" strategy="beforeInteractive" dangerouslySetInnerHTML={{__html:themeBoot}}/>
    <a className="skip-link" href="#main-content">İçeriğe geç</a>
    <header className="site-header"><div className="shell nav-inner">
      <Link href="/" className="logo" aria-label="DevAcademy ana sayfa"><LogoMark/><span className="logo-type">DevAcademy</span></Link>
      <SiteNav/>
      <ThemeSwitcher/>
    </div></header>
    <main id="main-content"><ViewTransition default="page-swap">{children}</ViewTransition></main>
    <footer className="footer"><div className="shell footer-grid">
      <div className="footer-brand">
        <Link href="/" className="logo" aria-label="DevAcademy ana sayfa"><LogoMark/><span className="logo-type">DevAcademy</span></Link>
        <p>Önce tahmin et, sonra satır satır kanıtla. Türkçe, ücretsiz kod öğrenme laboratuvarı.</p>
        <span className="footer-status"><StatusPill tone="terracotta">Geliştirme önizlemesi</StatusPill></span>
      </div>
      <nav className="footer-nav" aria-label="Alt menü">
        <div><h2>Öğren</h2><ul><li><Link href="/kurslar">Kurslar</Link></li><li><Link href="/pratik">Kod pratiği</Link></li><li><Link href="/laboratuvar">Laboratuvar</Link></li></ul></div>
        <div><h2>Keşfet</h2><ul><li><Link href="/kutuphane/diller">Diller</Link></li><li><Link href="/kutuphane/kavramlar">Kavramlar</Link></li><li><Link href="/radar">Sektör radarı</Link></li></ul></div>
        <div><h2>Sen</h2><ul><li><Link href="/hesap">İlerlemem</Link></li><li><Link href="/tekrar">Tekrar</Link></li></ul></div>
      </nav>
      <p className="footer-legal">© DevAcademy · İlk sürüm geliştirme aşamasında; içerik ve özellikler değişebilir.</p>
    </div></footer>
  </body></html>;
}
