// Server-only deterministic, reviewed counterfactual missions; no learner code runs.
export const transferLessonIds=Object.freeze([
  "lesson.javascript.let-const","lesson.javascript.equality","lesson.javascript.array-map",
  "lesson.javascript.functions","lesson.javascript.scope","lesson.javascript.filter",
  "lesson.java.variables","lesson.java.polymorphism",
  "lesson.python.variables","lesson.python.conditions",
  "lesson.python.loops","lesson.python.functions","lesson.python.collections"
]);
function numbers(seed) {
  let state=seed>>>0;
  return (min,max)=>{
    state=(Math.imul(1664525,state)+1013904223)>>>0;
    return min+(state%(max-min+1));
  };
}
export function transferProblem(lessonId,seed) {
  if(!Number.isSafeInteger(seed)||seed<0||seed>2147483647)throw Error("INVALID_SEED");
  const next=numbers(seed);
  switch(lessonId) {
    case "lesson.javascript.let-const": {
      const a=next(2,12),b=next(2,7),c=next(1,6);
      return {title:"Bağın değeri mi, nesnenin içi mi?",
        code:["let score = "+a+";","score += "+b+";","const profile = { score };",
          "profile.score += "+c+";","console.log(score);         // A",
          "console.log(profile.score); // B"].join("\n"),
        promptA:"A satırı hangi sayıyı yazdırır?",promptB:"B satırı hangi sayıyı yazdırır?",
        expected:[String(a+b),String(a+b+c)],
        explanation:"const değişkenin yeniden atanmasını engeller, nesnenin alanını değil. profile.score güncellenirken score aynı kalır."};
    }
    case "lesson.javascript.equality": {
      const id=next(12,98);
      return {title:"Gevşek dönüşüm mü, katı tür kontrolü mü?",
        code:["const raw = \""+id+"\";","const code = "+id+";",
          "console.log(Number(raw === code));         // A",
          "console.log(Number(Number(raw) === code)); // B"].join("\n"),
        promptA:"A satırı hangi sayıyı yazdırır? (0 veya 1)",promptB:"B satırı hangi sayıyı yazdırır? (0 veya 1)",
        expected:["0","1"],
        explanation:"raw bir string, code bir number'dır; raw === code false (0) verir. Number(raw) dönüşümünden sonra iki taraf da number olduğu için === true (1) üretir."};
    }
    case "lesson.javascript.array-map": {
      const a=next(1,6),b=next(3,9),c=next(6,12),k=next(2,4);
      return {title:"Yeni dizi değişirken kaynak değişir mi?",
        code:["const values = ["+a+", "+b+", "+c+"];",
          "const updated = values.map(n => n * "+k+");",
          "console.log(updated[1]); // A","console.log(values[1]);  // B"].join("\n"),
        promptA:"A satırının sayısal çıktısı?",promptB:"B satırının sayısal çıktısı?",
        expected:[String(b*k),String(b)],
        explanation:"map yeni bir dizi üretir; orijinal values dizisinin ikinci elemanı değiştirilmez."};
    }
    case "lesson.javascript.functions": {
      const base=next(3,9),bonus=next(2,6),custom=next(7,12);
      return {title:"Varsayılan parametre mi, açık argüman mı?",
        code:["function score(points, extra = "+bonus+") {",
          "  return points * 2 + extra;","}",
          "console.log(score("+base+"));            // A",
          "console.log(score("+base+", "+custom+")); // B"].join("\n"),
        promptA:"A satırı hangi sayıyı yazdırır?",promptB:"B satırı hangi sayıyı yazdırır?",
        expected:[String(base*2+bonus),String(base*2+custom)],
        explanation:"İlk çağrıda ikinci argüman verilmediği için varsayılan extra kullanılır; ikinci çağrıda açıkça verilen argüman varsayılanın yerini alır."};
    }
    case "lesson.javascript.scope": {
      const outer=next(10,25),shadow=next(3,8),delta=next(2,6);
      return {title:"Gölgeleyen blok mu, güncelleyen blok mu?",
        code:["let quota = "+outer+";","{","  let quota = "+shadow+";","  quota += "+delta+";",
          "  console.log(quota); // A","}","{","  quota += "+delta+";","}",
          "console.log(quota); // B"].join("\n"),
        promptA:"A satırı hangi sayıyı yazdırır?",promptB:"B satırı hangi sayıyı yazdırır?",
        expected:[String(shadow+delta),String(outer+delta)],
        explanation:"İlk blok yeni bir let quota tanımladığı için yalnızca kendi yerel değerini değiştirir. İkinci blokta let olmadığından dıştaki quota güncellenir."};
    }
    case "lesson.javascript.filter": {
      const a=next(10,30),b=next(40,70),c=next(80,110),limit=35;
      return {title:"Süzülen öğe sayısı ve birikimli toplam",
        code:["const amounts = ["+a+", -"+b+", "+b+", "+c+"];",
          "const valid = amounts.filter(n => n >= "+limit+");",
          "console.log(valid.length);                        // A",
          "console.log(valid.reduce((sum, n) => sum + n, 0)); // B"].join("\n"),
        promptA:"A satırı kaç öğe yazdırır?",promptB:"B satırı hangi toplamı yazdırır?",
        expected:["2",String(b+c)],
        explanation:"filter yalnızca 35 ve üzerindeki pozitif değerleri (b ve c) yeni diziye alır; reduce ise başlangıç değeri 0 üzerine bu iki sayıyı toplar."};
    }
    case "lesson.java.variables": {
      const parts=next(2,4)*2,whole=next(1,4),total=parts*whole+parts/2;
      return {title:"Cast ne zaman yapılır?",
        code:["class Main {",
          "  public static void main(String[] args) {",
          "    int total = "+total+";","    int parts = "+parts+";",
          "    double a = total / parts;","    double b = (double) total / parts;",
          "    System.out.println(a); // A","    System.out.println(b); // B",
          "  }","}"].join("\n"),
        promptA:"A çıktısı? (Örn. 2.0)",promptB:"B çıktısı? (Örn. 2.5)",
        expected:[String(whole),String(whole+.5)],
        explanation:"İki int arasındaki bölme önce tam sayıya kesilir. Cast işlemin öncesinde olunca kesir korunur."};
    }
    case "lesson.java.polymorphism": {
      const base=next(1,9),plus=next(2,6),arg=next(3,11);
      return {title:"Overload mı, override mı?",
        code:["class Animal { int speak() { return "+base+"; } }",
          "class Dog extends Animal { int speak(int x) { return x + "+plus+"; } }",
          "class Main {",
          "  public static void main(String[] args) {",
          "    Dog d = new Dog();",
          "    System.out.println(d.speak());      // A",
          "    System.out.println(d.speak("+arg+")); // B",
          "  }","}"].join("\n"),
        promptA:"Parametresiz çağrı A kaç üretir?",promptB:"Argümanlı çağrı B kaç üretir?",
        expected:[String(base),String(arg+plus)],
        explanation:"speak(int) yeni bir aşırı yüklemedir. Parametresiz speak() override edilmediği için Animal'dan gelir."};
    }
    case "lesson.python.variables": {
      const price=next(2,9),quantity=next(2,3),fee=next(1,9);
      return {title:"Metin mi, sayı mı?",
        code:["price_text = \""+price+"\"  # formdan gelir","quantity = "+quantity,
          "print(int(price_text) * quantity + "+fee+")  # A",
          "print(price_text * quantity)              # B"].join("\n"),
        promptA:"A hangi sayıyı yazdırır?",promptB:"B ekranda hangi rakamları gösterir?",
        expected:[String(price*quantity+fee),String(price).repeat(quantity)],
        explanation:"int() dönüşümünden sonra * çarpma yapar. Dönüştürülmemiş bir str ile * ise metni tekrarlar; hata vermez."};
    }
    case "lesson.python.conditions": {
      const high=next(3,9)*100,low=high-next(1,2)*100,mid=next(2,4)*10,base=mid+next(1,3)*10;
      const total=[high,high-1,low-1][next(0,2)];
      return {title:"Koşulların sırası kararı değiştirir mi?",
        code:["total = "+total,
          "if total >= "+high+":","    fee_a = 0","elif total >= "+low+":","    fee_a = "+mid,"else:","    fee_a = "+base,
          "if total >= "+low+":","    fee_b = "+mid,"elif total >= "+high+":","    fee_b = 0","else:","    fee_b = "+base,
          "print(fee_a)  # A","print(fee_b)  # B"].join("\n"),
        promptA:"A hangi ücreti yazdırır?",promptB:"B hangi ücreti yazdırır?",
        expected:[String(total>=high?0:total>=low?mid:base),String(total>=low?mid:base)],
        explanation:"Zincirde yalnızca ilk doğru koşulun bloğu çalışır. B'de geniş koşul önce geldiği için ücretsiz kargo dalına hiç ulaşılmaz."};
    }
    case "lesson.python.collections": {
      const apple=next(1,9),pear=next(1,9),limit=next(2,9);
      return {title:"Eksik anahtar ne anlama gelir?",
        code:["stock = {\"elma\": "+apple+", \"armut\": "+pear+"}","wanted = [\"elma\", \"armut\", \"kiraz\"]",
          "print(stock.get(\"kiraz\", 0) + stock[\"elma\"])  # A",
          "low = [name for name in wanted if stock.get(name, 0) < "+limit+"]",
          "print(len(low))  # B"].join("\n"),
        promptA:"A hangi sayıyı yazdırır?",promptB:"B hangi sayıyı yazdırır?",
        expected:[String(apple),String((apple<limit)+(pear<limit)+1)],
        explanation:"get eksik anahtar için verilen varsayılanı (0) döndürür; bu yüzden kiraz hem A'da 0 sayılır hem de B'de düşük stok listesine girer."};
    }
    case "lesson.python.loops": {
      const start=next(1,4),stop=start+next(3,7);
      const a=(start+stop-1)*(stop-start)/2;
      return {title:"Dahil edilmeyen sınır",
        code:["start = "+start,"stop = "+stop,
          "print(sum(range(start, stop)))     # A",
          "print(sum(range(start, stop + 1))) # B"].join("\n"),
        promptA:"A hangi sayıyı yazdırır?",promptB:"B hangi sayıyı yazdırır?",
        expected:[String(a),String(a+stop)],
        explanation:"Python range başlangıcı içerir ama bitiş sınırını içermez. Üst sınıra 1 eklenince stop da toplama girer."};
    }
    case "lesson.python.functions": {
      const x=next(2,11),factor=next(2,5);
      return {title:"Yazdırmak döndürmek değildir",
        code:["def show(n):","    print(n * "+factor+")","",
          "def give(n):","    return n * "+factor,"",
          "first = show("+x+")","second = give("+x+")",
          "print(first)  # A","print(second) # B"].join("\n"),
        promptA:"A çıktısı ne? (sayı veya None)",promptB:"B çıktısı ne?",
        expected:["None",String(x*factor)],
        explanation:"show önce bir sayı yazdırır ama return içermez, bu yüzden first None'dır. give değeri çağırana döndürür."};
    }
    default: return null;
  }
}
export function normalizedAnswer(value) {
  if(typeof value!=="string"||value.length>24)return null;
  const clean=value.trim();
  if(/^none$/i.test(clean))return "none";
  // Turkish learners may enter 2,5 instead of 2.5.
  const numeric=clean.replace(",",".");
  if(!/^-?\d{1,7}(?:\.\d{1,3})?$/.test(numeric))return null;
  const n=Number(numeric);
  return Number.isFinite(n)?String(n):null;
}
export function evaluateTransfer(problem,answerA,answerB) {
  const one=normalizedAnswer(answerA),two=normalizedAnswer(answerB);
  if(one===null||two===null)return null;
  return {correct:one===normalizedAnswer(problem.expected[0]) &&
    two===normalizedAnswer(problem.expected[1])};
}
