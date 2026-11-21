import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const read=(p)=>readFileSync(new URL("../src/"+p,import.meta.url),"utf8");
const nav=read("components/site-nav.tsx");
const layout=read("app/layout.tsx");
const styles=read("app/globals.css");

test("header navigation marks the current section with aria-current",()=>{
  assert.match(layout,/<SiteNav\/>/);
  assert.match(nav,/usePathname/);
  assert.match(nav,/within\(pathname,"\/kurslar"\)\)return "learn"/);
  assert.match(nav,/within\(pathname,"\/kutuphane"\)\|\|within\(pathname,"\/radar"\)\)return "discover"/);
  assert.match(nav,/<summary aria-current=\{current\("discover"\)\}>.*<span className="nav-label"[^>]*>Keşfet<\/span><\/summary>/);
  assert.match(styles,/\.nav-links>a\[aria-current="page"\]/);
});
test("Keşfet menüsü dışarı tıklayınca, Escape ile ve sayfa değişince kapanır",()=>{
  assert.match(nav,/<details ref=\{menu\} className="nav-discovery"/);
  // Dışarıdaki herhangi bir işaretçi basışı menüyü kapatır; içerideki tıklama kapatmaz.
  assert.match(nav,/addEventListener\("pointerdown"/);
  assert.match(nav,/!el\.contains\(event\.target as Node\)/);
  // Escape menüyü kapatır ve odağı Keşfet düğmesine geri verir.
  assert.match(nav,/event\.key==="Escape"/);
  assert.match(nav,/querySelector<HTMLElement>\("summary"\)\?\.focus\(\)/);
  // Layout istemci gezintisinde yeniden oluşmadığı için yol değişince elle kapatılır.
  assert.match(nav,/useEffect\(\(\)=>\{if\(menu\.current\)menu\.current\.open=false;\},\[pathname\]\)/);
  assert.match(nav,/removeEventListener\("pointerdown"/);
  // Bağlantıya basınca menü sayfa yüklenmesini beklemeden kapanır.
  assert.ok(nav.includes('className="nav-discovery-links" onClick={()=>{if(menu.current)menu.current.open=false;}}'));
});
