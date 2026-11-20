// A small, dependency-free line highlighter for the read-only code blocks (hero
// puzzle, lesson studio, header teasers). It is deliberately shallow: strings,
// comments, numbers, keywords, literals and call names are enough to make code
// scannable. The editable lab editor uses CodeMirror's real grammars instead;
// the token colours here match that editor's palette (globals.css .tok-*).
import type {ReactNode} from "react";

const keywords = new Set([
  // JavaScript / TypeScript
  "const","let","var","function","return","if","else","for","while","of","in","new","class","extends",
  "await","async","import","export","from","typeof","instanceof","switch","case","break","continue",
  "throw","try","catch","finally","this","type","interface",
  // Java
  "void","public","private","protected","static","final","int","double","boolean","String","System",
  // Python
  "def","elif","lambda","pass","not","and","or","is","with","as","print","range","len",
  // SQL (uppercase)
  "SELECT","FROM","WHERE","GROUP","BY","ORDER","JOIN","LEFT","ON","AS","AND","OR","COUNT","SUM",
  "INSERT","INTO","VALUES","UPDATE","SET","HAVING","LIMIT","DISTINCT","NULL","IS","NOT",
]);
const literals = new Set(["true","false","null","undefined","None","True","False","NaN"]);

type Kind = "kw"|"str"|"num"|"com"|"fn"|"lit"|"ann"|"txt";

function commentStart(line: string, language: string, from: number): number {
  const marks = language === "python" ? ["#"] : language === "sql" ? ["--"] : ["//"];
  let quote = "";
  for (let i = from; i < line.length; i++) {
    const ch = line[i];
    if (quote) { if (ch === "\\") i++; else if (ch === quote) quote = ""; continue; }
    if (ch === "\"" || ch === "'" || ch === "`") { quote = ch; continue; }
    if (marks.some(m => line.startsWith(m, i))) return i;
  }
  return -1;
}

export function tokenizeLine(line: string, language = "javascript"): {kind: Kind; text: string}[] {
  const out: {kind: Kind; text: string}[] = [];
  const cut = commentStart(line, language, 0);
  const body = cut < 0 ? line : line.slice(0, cut);
  const pattern = /("(?:\\.|[^"\\])*"?|'(?:\\.|[^'\\])*'?|`(?:\\.|[^`\\])*`?)|(@[A-Za-z]+)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_$][\w$]*)/g;
  let last = 0;
  for (const m of body.matchAll(pattern)) {
    const at = m.index ?? 0;
    if (at > last) out.push({kind: "txt", text: body.slice(last, at)});
    const text = m[0];
    let kind: Kind = "txt";
    if (m[1]) kind = "str";
    else if (m[2]) kind = "ann";
    else if (m[3]) kind = "num";
    else if (literals.has(text)) kind = "lit";
    else if (keywords.has(text)) kind = "kw";
    else if (body[at + text.length] === "(") kind = "fn";
    out.push({kind, text});
    last = at + text.length;
  }
  if (last < body.length) out.push({kind: "txt", text: body.slice(last)});
  if (cut >= 0) out.push({kind: "com", text: line.slice(cut)});
  return out;
}

export function HighlightedLine({line, language}: {line: string; language?: string}): ReactNode {
  if (!line) return " ";
  return tokenizeLine(line, language).map((token, index) =>
    token.kind === "txt" ? token.text : <span key={index} className={"tok-" + token.kind}>{token.text}</span>);
}
