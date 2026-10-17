import Link from "next/link";
export default function NotFound() {
  return <section className="shell notfound"><p className="overline">404 · Sayfa bulunamadı</p><h1>Bu sayfa henüz burada değil.</h1><p>Aradığın konuyu kütüphanede bulabilirsin.</p><Link className="primary-button" href="/">Ana sayfaya dön →</Link></section>;
}
