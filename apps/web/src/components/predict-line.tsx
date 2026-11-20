// One line of code with its output hidden behind a native <details>: the
// "predict first" idea in a form small enough for list rows and cards.
// When the line sits inside a link (lesson rows), use `still` to render the
// same strip without the reveal, since interactive content can't nest in <a>.
import {HighlightedLine} from "./code-tokens";

type Props={code:string;answer?:string;language?:string;still?:boolean};

export function PredictLine({code,answer,language="javascript",still=false}:Props){
  const lines=code.split("\n");
  const body=<span className="predict-line-code">{lines.map((line,i)=>
    <code key={i}><HighlightedLine line={line} language={language}/></code>)}</span>;
  // Inside a link the code would bloat the link's accessible name; it is a visual preview only.
  if(still||answer===undefined)return <span className="predict-line predict-line-still" aria-hidden="true">
    {body}<span className="predict-line-q" aria-hidden="true">→ ?</span>
  </span>;
  return <details className="predict-line">
    <summary>{body}<span className="predict-line-q" aria-hidden="true">→ ?</span>
      <span className="sr-only">Tahmin et, sonra çıktıyı göster</span></summary>
    <p><span className="output-teaser-label">Çıktı</span><code>{answer}</code></p>
  </details>;
}
