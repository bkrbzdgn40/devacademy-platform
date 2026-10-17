"use client";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { ProgressDashboard } from "@/components/progress-dashboard";

type Viewer = { authenticated: boolean; configured: boolean; username?: string };
type Progress = {
  lessons: { lessonId: string; lastViewedAt: string; completedAt: string | null }[];
  recentAttempts: { lessonId: string; exerciseId: string; correct: boolean; attemptedAt: string }[];
  reviewSummary?:{total:number;due:number};
};
const emptyViewer: Viewer = { authenticated: false, configured: false };

export function AccountPanel() {
  const [viewer, setViewer] = useState<Viewer | null>(null);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [mode, setMode] = useState<"login" | "register">("register");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const refresh = useCallback(async () => {
    try {
      const response = await fetch("/api/me", { cache: "no-store" });
      if (!response.ok) throw new Error();
      const data = (await response.json()) as Viewer;
      setViewer(data);
      if (data.authenticated) {
        const prog = await fetch("/api/progress", { cache: "no-store" });
        setProgress(prog.ok ? (await prog.json()) as Progress : null);
      } else setProgress(null);
    } catch { setViewer(emptyViewer); setMessage("Hesap servisine ulaşılamıyor."); }
  }, []);

  useEffect(() => {
    let active = true;
    fetch("/api/me", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("account unavailable");
        const data = (await response.json()) as Viewer;
        if (!active) return;
        setViewer(data);
        if (data.authenticated) {
          const prog = await fetch("/api/progress", { cache: "no-store" });
          if (active) setProgress(prog.ok ? (await prog.json()) as Progress : null);
        }
      })
      .catch(() => {
        if (active) { setViewer(emptyViewer); setMessage("Hesap servisine ulaşılamıyor."); }
      });
    return () => { active = false; };
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true); setMessage("");
    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const body = (await response.json()) as { error?: string };
      if (!response.ok) { setMessage(body.error || "İşlem başarısız."); return; }
      setPassword(""); setUsername("");
      setMessage("Oturum açıldı. İlerleme kayıtları artık hesabına bağlanabilir.");
      await refresh();
    } catch { setMessage("Sunucuya erişilemiyor."); }
    finally { setBusy(false); }
  }

  async function logout() {
    setBusy(true); setMessage("");
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) { setMessage("Çıkış tamamlanamadı."); return; }
      await refresh(); setMessage("Oturum kapatıldı.");
    } catch { setMessage("Sunucuya erişilemiyor."); }
    finally { setBusy(false); }
  }

  async function deleteAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (confirmation !== "DELETE") return;
    setBusy(true); setMessage("");
    try {
      const response = await fetch("/api/auth/delete", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmation, password: deletePassword }),
      });
      const body = (await response.json()) as { error?: string };
      setDeletePassword("");
      if (!response.ok) { setMessage(body.error || "Hesap silinemedi."); return; }
      setConfirmation("");
      await refresh(); setMessage("Hesap ve ilişkili öğrenme kayıtları silindi.");
    } catch { setMessage("Sunucuya erişilemiyor."); }
    finally { setBusy(false); }
  }

  if (!viewer) return <p role="status">Hesap durumu yükleniyor…</p>;
  if (!viewer.configured) return <div className="availability-note">Kimlik doğrulama bu ortamda yapılandırılmamış. Hesap oluşturmak ve ilerleme kaydetmek için yerel PostgreSQL bağlantısı gereklidir.</div>;

  return <div className="account-panel">
    {message && <p className="account-message" role="status">{message}</p>}
    {viewer.authenticated ? <>
      <section className="account-section" aria-label="Oturum bilgisi">
        <p className="overline">Aktif hesap</p>
        <h2>{viewer.username}</h2>
        <p>Bu hesabın ilerlemesi sunucu tarafında saklanır. Diğer kullanıcılar bu kayıtlara erişemez.</p>
        <button className="subtle-action" disabled={busy} onClick={logout}>Oturumu kapat</button>
      </section>
      <section className="account-section"><h2>Öğrenme geçmişim</h2><ProgressDashboard progress={progress} /></section>
      <section className="account-section danger-section">
        <h2>Hesabı kalıcı olarak sil</h2>
        <p>Bu işlem geri alınamaz. Hesabınla birlikte tüm oturumlar, alıştırma cevapları ve ders ilerlemesi silinir.</p>
        <form className="account-form" onSubmit={deleteAccount}>
          <label>Mevcut parolan<input autoComplete="current-password" type="password" value={deletePassword} onChange={(e)=>setDeletePassword(e.target.value)} required /></label>
          <label>Onay için DELETE yaz<input autoComplete="off" value={confirmation} onChange={(e)=>setConfirmation(e.target.value)} required /></label>
          <button className="danger-button" type="submit" disabled={busy || confirmation !== "DELETE" || !deletePassword}>Hesabımı ve verilerimi sil</button>
        </form>
      </section>
    </> : <section className="account-section">
      <div className="auth-tabs" role="group" aria-label="Hesap işlemi">
        <button type="button" aria-pressed={mode==="register"} onClick={()=>{setMode("register");setMessage("");}}>Hesap oluştur</button>
        <button type="button" aria-pressed={mode==="login"} onClick={()=>{setMode("login");setMessage("");}}>Oturum aç</button>
      </div>
      <form className="account-form" onSubmit={submit}>
        <label>Kullanıcı adı<input type="text" autoComplete="username" pattern="[a-zA-Z][a-zA-Z0-9_]{2,23}" minLength={3} maxLength={24} required value={username} onChange={(e)=>setUsername(e.target.value)} /></label>
        <label>Parola<input type="password" autoComplete={mode==="register"?"new-password":"current-password"} minLength={15} maxLength={128} required value={password} onChange={(e)=>setPassword(e.target.value)} /></label>
        {mode === "register" && <p className="small-note">Parolan en az 15 karakter olmalı. Bu önizlemede e-posta kurtarma bulunmadığından parolanı kaybetmemelisin.</p>}
        <button className="primary-button" type="submit" disabled={busy}>{busy ? "İşleniyor…" : mode==="register"?"Hesap oluştur":"Oturum aç"}</button>
      </form>
    </section>}
  </div>;
}
