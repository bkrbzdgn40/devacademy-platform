// Three lines of code with the middle one under the trace highlight:
// the same "this line runs now" mark the hero and lesson traces use.
export function LogoMark(){
  return <svg className="logo-mark" viewBox="0 0 32 32" width="38" height="38" aria-hidden="true" focusable="false">
    <rect className="logo-mark-bg" width="32" height="32" rx="8"/>
    <rect className="logo-mark-line" x="7" y="8" width="11" height="3" rx="1.5"/>
    <rect className="logo-mark-trace" x="4" y="13.5" width="24" height="6" rx="3"/>
    <rect className="logo-mark-active" x="7" y="15" width="15" height="3" rx="1.5"/>
    <rect className="logo-mark-line" x="7" y="22" width="8" height="3" rx="1.5"/>
  </svg>;
}
