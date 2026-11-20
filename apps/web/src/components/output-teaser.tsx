// A small "what does this print?" card for page headers. It carries the site's
// predict-first idea onto listing pages without JavaScript: the answer sits in a
// native <details>, so it is keyboard and screen-reader friendly by default.
import {HighlightedLine} from "./code-tokens";

export function OutputTeaser({file, language="JavaScript", code, answer, explanation}: {
  file: string; language?: string; code: string; answer: string; explanation: string;
}) {
  const lines = code.split("\n");
  return <aside className="output-teaser" aria-label={"Tahmin sorusu: "+file}>
    <div className="code-heading"><span>{file}</span><span>{language}</span></div>
    <div className="output-teaser-code">
      {lines.map((line, index) => <div key={index} className="studio-code-row">
        <span className="studio-line-number" aria-hidden="true">{index+1}</span>
        <code><HighlightedLine line={line} language={language.toLowerCase()}/></code>
      </div>)}
    </div>
    <details className="output-teaser-answer">
      <summary>Bu ne yazdırır? <span>Cevabı gör</span></summary>
      <p><span className="output-teaser-label">Çıktı</span><code>{answer}</code></p>
      <p>{explanation}</p>
    </details>
  </aside>;
}
