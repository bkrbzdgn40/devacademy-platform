"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { javascript } from "@codemirror/lang-javascript";

const CodeMirror = dynamic(() => import("@uiw/react-codemirror"), {
  ssr: false,
  loading: () => <p role="status" className="editor-loading">Kod editörü yükleniyor…</p>,
});

export function CodePlayground({ starterCode, label = "JavaScript kod editörü" }: { starterCode: string; label?: string }) {
  const [code, setCode] = useState(starterCode);
  const extensions = useMemo(() => [javascript()], []);
  const changed = code !== starterCode;
  return <section aria-label={label} className="editor-shell">
    <div className="editor-toolbar">
      <div><strong>JavaScript editörü</strong><span>CodeMirror 6 · Düzenleme modu</span></div>
      <button type="button" onClick={() => setCode(starterCode)} disabled={!changed}>Örneği sıfırla</button>
    </div>
    <CodeMirror
      value={code}
      theme="dark"
      extensions={extensions}
      height="320px"
      basicSetup={{lineNumbers:true,highlightActiveLine:true,foldGutter:true,autocompletion:true}}
      onChange={setCode}
      aria-label={label}
    />
    <div className="editor-footer">
      <span aria-live="polite">{code.length.toLocaleString("tr-TR")} karakter · {code.split("\n").length} satır</span>
      <button type="button" disabled aria-disabled="true" title="İzole çalıştırıcı güvenlik denetimi bitmedi">Çalıştır (hazırlanıyor)</button>
    </div>
    <p className="editor-privacy">Bu editör kodu tarayıcıda düzenler. Kod çalıştırılmaz, sunucuya gönderilmez ve hesabına kaydedilmez. Değişiklikler sayfadan ayrılınca kaybolur.</p>
  </section>;
}
