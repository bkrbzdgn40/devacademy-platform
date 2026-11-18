import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import {SiteNav} from "@/components/site-nav";
import {ThemeSwitcher} from "@/components/theme-switcher";
import {StatusPill} from "@/components/ui-primitives";
import "./globals.css";

export const metadata: Metadata = {
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
  return <html lang="tr" suppressHydrationWarning><body>
    <Script id="devacademy-theme-boot" strategy="beforeInteractive" dangerouslySetInnerHTML={{__html:themeBoot}}/>
    <a className="skip-link" href="#main-content">İçeriğe geç</a>
    <header className="site-header"><div className="shell nav-inner">
      <Link href="/" className="logo" aria-label="DevAcademy ana sayfa"><span className="logo-mark" aria-hidden="true">{"<>"}</span><span className="logo-type">DevAcademy</span></Link>
      <SiteNav/>
      <ThemeSwitcher/>
      <span className="alpha-pill"><StatusPill tone="terracotta">Geliştirme önizlemesi</StatusPill></span>
    </div></header>
    <main id="main-content">{children}</main>
    <footer className="footer"><div className="shell footer-inner"><span>© DevAcademy · Eğitim odaklı yazılım laboratuvarı</span><span>İlk sürüm geliştirme aşamasında</span></div></footer>
  </body></html>;
}
