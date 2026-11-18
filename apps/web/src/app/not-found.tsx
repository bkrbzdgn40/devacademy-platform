import Link from "next/link";
export default function NotFound() {
  return <section className="shell notfound"><p className="overline">404 · Sayfa bulunamadı</p><h1>Bu sayfa henüz burada değil.</h1><p>Aradığın konuyu kütüphanede bulabilirsin.</p><div className="notfound-actions"><Link className="primary-button" href="/">Ana sayfaya dön →</Link><Link className="ui-button ui-button-secondary" href="/kutuphane/kavramlar">Kavramlar kütüphanesi</Link></div></section>;
}
