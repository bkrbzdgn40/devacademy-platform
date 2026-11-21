// Reviewed, server-only diagnostic interventions. These are hypotheses about
// observed mistakes, not mind-reading or psychometric diagnoses.
import {transferProblem,normalizedAnswer} from "./transfer-missions.mjs";

const hypothesis={
  "lesson.javascript.let-const": {
    a:"A sonucunda değişkenin yeniden atanması ile önceki değerinin korunması karışmış olabilir.",
    b:"B sonucunda nesnenin alanını değiştirmek ile const bağını değiştirmek karışmış olabilir."
  },
  "lesson.javascript.equality": {
    a:"A sonucunda === operatörünün farklı türleri dönüştürmeden false verdiği gözden kaçmış olabilir.",
    b:"B sonucunda Number(raw) açık dönüşümünün metni sayıya çevirip === eşitliğini sağladığı karışmış olabilir."
  },
  "lesson.javascript.array-map": {
    a:"A sonucunda map içindeki dönüşümün hangi öğeye uygulandığı karışmış olabilir.",
    b:"B sonucunda map'in kaynak diziyi değiştirip değiştirmediği karışmış olabilir."
  },
  "lesson.javascript.functions": {
    a:"A sonucunda varsayılan parametrenin argüman verilmediğinde devreye girdiği veya return ifadesi karışmış olabilir.",
    b:"B sonucunda açıkça gönderilen argümanın varsayılan parametreyi ezdiği gözden kaçmış olabilir."
  },
  "lesson.javascript.scope": {
    a:"A sonucunda iç bloktaki let tanımının yerel değeri nasıl güncellediği karışmış olabilir.",
    b:"B sonucunda başında let olmayan atamanın dış değişkeni değiştirdiği gözden kaçmış olabilir."
  },
  "lesson.javascript.filter": {
    a:"A sonucunda filter koşulunun hangi öğeleri yeni diziye seçtiği karışmış olabilir.",
    b:"B sonucunda reduce toplamının yalnızca filtrelenen öğeler üzerinden hesaplandığı gözden kaçmış olabilir."
  },
  "lesson.javascript.async": {
    a:"A sonucunda .then callback'inin senkron satırdan sonra çalıştığı gözden kaçmış olabilir.",
    b:"B sonucunda microtask çalıştığında güncel değişken değerinin korunduğu karışmış olabilir."
  },
  "lesson.java.variables": {
    a:"A sonucunda tamsayı bölmesinin ondalıklı değişkene atanmadan önce tamamlandığı gözden kaçmış olabilir.",
    b:"B sonucunda tür dönüşümünü bölmeden önce veya sonra yapmanın etkisi karışmış olabilir."
  },
  "lesson.java.methods": {
    a:"A sonucunda erken return koşulunun veya değer döndüren metodun çağrıldığı satır karışmış olabilir.",
    b:"B sonucunda metodun return ile döndürdüğü değerin çağrı yerinde nasıl toplandığı gözden kaçmış olabilir."
  },
  "lesson.java.polymorphism": {
    a:"A sonucunda kalıtılan parametresiz metodun hangi sınıftan geldiği karışmış olabilir.",
    b:"B sonucunda speak(int) aşırı yüklemesinin argümanla nasıl çağrıldığı karışmış olabilir."
  },
  "lesson.python.variables": {
    a:"A sonucunda metnin sayıya dönüştürülmesinin çarpmadan önce mi sonra mı yapıldığı karışmış olabilir.",
    b:"B sonucunda str * int işleminin metni tekrarladığı, çarpmadığı gözden kaçmış olabilir."
  },
  "lesson.python.conditions": {
    a:"A sonucunda sınır değerinin > ve >= ile hangi dala düştüğü karışmış olabilir.",
    b:"B sonucunda zincirde ilk doğru koşulun kalan dalları atlattığı gözden kaçmış olabilir."
  },
  "lesson.python.collections": {
    a:"A sonucunda get varsayılanının yalnızca anahtar yoksa kullanıldığı karışmış olabilir.",
    b:"B sonucunda eksik anahtarın varsayılan 0 ile filtreye girdiği gözden kaçmış olabilir."
  },
  "lesson.python.loops": {
    a:"A sonucunda range bitiş değerinin dışarıda kaldığı gözden kaçmış olabilir.",
    b:"B sonucunda bitiş sınırını bir artırmanın hangi ek öğeyi kattığı karışmış olabilir."
  },
  "lesson.python.functions": {
    a:"A sonucunda ekrana yazdırılan değer ile çağırana dönen değer karışmış olabilir.",
    b:"B sonucunda return edilen değer ile fonksiyon argümanının ilişkisi karışmış olabilir."
  },
  "lesson.python.strings": {
    a:"A sonucunda split'in ardışık ayraçlar arasında boş parça ürettiği gözden kaçmış olabilir.",
    b:"B sonucunda strip ve lower uygulanmadan farklı yazılmış etiketlerin eşleşmediği karışmış olabilir."
  }
};
export const adaptiveFocuses=Object.freeze(["standard","a","b"]);
export function errorPattern(problem,answerA,answerB) {
  const a=normalizedAnswer(answerA)===normalizedAnswer(problem.expected[0]);
  const b=normalizedAnswer(answerB)===normalizedAnswer(problem.expected[1]);
  return a&&b?"none":!a&&!b?"both":a?"b":"a";
}
export function nextFocus(pattern,attemptCount) {
  if(pattern==="a"||pattern==="b")return pattern;
  if(pattern==="both")return attemptCount%2===0?"a":"b";
  return "standard";
}
export function diagnosticHypothesis(lessonId,pattern,focus) {
  const title=pattern==="both"?"Her iki sonuç için işlem sırasını yeniden sınayacağız.":
    pattern==="a"?"A çıktısında bir varsayımı sınayacağız.":
    "B çıktısında bir varsayımı sınayacağız.";
  return {pattern,title,focus,
    rationale:hypothesis[lessonId]?.[focus]??"Bu işlem sırasını daha küçük bir örnekte sınayacağız.",
    // Only an observation-based pedagogic guess, not a classification of the learner.
    disclaimer:"Bu bir yanılgı hipotezidir, öğrencinin ne düşündüğüne ilişkin kesin teşhis değildir."};
}
function step(seed) {
  let n=seed>>>0;
  return (min,max)=>{
    n=(Math.imul(1664525,n)+1013904223)>>>0;
    return min+n%(max-min+1);
  };
}
function task(title,code,expected,explanation) {
  return {title,code:code.join("\n"),expected:expected.map(String),
    promptA:"A satırının sonucu nedir?",promptB:"B satırının sonucu nedir?",
    explanation};
}
export function adaptiveProblem(lessonId,seed,focus="standard") {
  if(!adaptiveFocuses.includes(focus))throw Error("INVALID_FOCUS");
  if(focus==="standard")return transferProblem(lessonId,seed);
  if(!Number.isSafeInteger(seed)||seed<1||seed>2147483646)throw Error("INVALID_SEED");
  const n=step(seed),a=n(2,9),b=n(2,6),c=n(3,7),k=n(2,4);
  switch(lessonId) {
    case "lesson.javascript.let-const":
      return focus==="a"
        ?task("Değerin fotoğrafı ile yeni değer",
          ["let score = "+a+";","const before = score;","score += "+b+";",
           "console.log(before); // A","console.log(score);  // B"],
          [a,a+b],"before değişkeni eski sayısal değeri tutar; score daha sonra değişir.")
        :task("Aynı nesnenin iki adı",
          ["const profile = { value: "+a+" };","const alias = profile;",
           "alias.value += "+b+";","console.log(profile.value); // A",
           "console.log(alias.value);   // B"],
          [a+b,a+b],"profile ve alias aynı nesneyi gösterdiği için ikisi de güncellenmiş alanı görür.");
    case "lesson.javascript.equality":
      return focus==="a"
        ?task("Farklı türlerde == ve === farkı",
          ["const text = \""+a+"\";","const num = "+a+";",
           "console.log(Number(text == num));  // A","console.log(Number(text === num)); // B"],
          [1,0],"== metni sayıya dönüştürüp true (1) verir; === türler farklı olduğu için false (0) verir.")
        :task("Açık Number dönüşümü sonrası katı eşitlik",
          ["const first = Number(\""+a+"\");","const second = Number(\""+(a+b)+"\");",
           "console.log(Number(first === "+a+"));  // A","console.log(Number(second === "+a+")); // B"],
          [1,0],"Number() dönüşümünden sonra iki taraf da sayıdır; yalnızca değeri aynı olan karşılaştırma 1 verir.");
    case "lesson.javascript.array-map":
      return focus==="a"
        ?task("map tüm öğelere ayrı uygulanır",
          ["const values = ["+a+", "+b+"];","const changed = values.map(n => n + "+k+");",
           "console.log(changed[0]); // A","console.log(changed[1]); // B"],
          [a+k,b+k],"map callback'i her elemanı ayrı dönüştürerek yeni diziyi oluşturur.")
        :task("Yeni dizi, eski dizi",
          ["const source = ["+a+", "+b+"];","const changed = source.map(n => n * "+k+");",
           "console.log(source[0]);  // A","console.log(changed[0]); // B"],
          [a,a*k],"map'in döndürdüğü dizi değişir; orijinal source öğeleri yerinde kalır.");
    case "lesson.javascript.functions":
      return focus==="a"
        ?task("İfade gövdesi ve açık return",
          ["const addDefault = (n, step = "+b+") => n + step;",
           "console.log(addDefault("+a+"));    // A","console.log(addDefault("+a+", 0)); // B"],
          [a+b,a],"İlk çağrıda varsayılan step eklenir; ikinci çağrıda 0 açıkça verildiği için varsayılan kullanılmaz.")
        :task("Dönen değeri yeni hesapta kullanmak",
          ["function calc(n, factor = "+k+") { return n * factor; }",
           "console.log(calc("+a+"));          // A","console.log(calc("+a+", "+(k+1)+")); // B"],
          [a*k,a*(k+1)],"Açıkça verilen ikinci argüman varsayılan çarpanın yerine geçer.");
    case "lesson.javascript.scope":
      return focus==="a"
        ?task("İç bloktaki let dışarıyı etkilemez",
          ["let count = "+a+";","{","  let count = "+b+";","  count += "+k+";",
           "  console.log(count); // A","}","console.log(count); // B"],
          [b+k,a],"İçteki let yeni bir bağ kurar; blok kapandığında dış count başlangıç değerinde kalır.")
        :task("Yeni let olmadan yapılan atama",
          ["let count = "+a+";","{","  count += "+b+";","  console.log(count); // A","}",
           "console.log(count); // B"],
          [a+b,a+b],"İç blokta let yazılmadığı için dış değişken doğrudan güncellenir ve blok sonrasında da yeni değerini korur.");
    case "lesson.javascript.filter":
      return focus==="a"
        ?task("Koşulu geçenlerin sayısı",
          ["const list = ["+a+", "+(a+10)+", -5];",
           "const big = list.filter(n => n > "+a+");",
           "console.log(big.length); // A","console.log(list.length); // B"],
          [1,3],"filter yalnızca koşulu sağlayan öğeleri yeni diziye alır; kaynak dizinin uzunluğu değişmez.")
        :task("Boş filtre ve dolu filtrede reduce",
          ["const list = ["+a+", "+b+"];",
           "const emptySum = list.filter(n => n > 100).reduce((s, n) => s + n, 0);",
           "const fullSum = list.filter(n => n > 0).reduce((s, n) => s + n, 0);",
           "console.log(emptySum); // A","console.log(fullSum);  // B"],
          [0,a+b],"Boş filtre sonucunda başlangıç değeri 0 döner; dolu filtrede seçilen öğeler toplanır.");
    case "lesson.javascript.async":
      return focus==="a"
        ?task("Promise hemen çözülse de senkron satır önce gelir",
          ["let count = "+a+";",
           "Promise.resolve("+b+").then((add) => {",
           "  count += add;",
           "  console.log(count); // B",
           "});",
           "console.log(count);   // A"],
          [a,a+b],"Senkron console.log callback çalışmadan önce ilk count değerini yazar; B güncellenmiş değeri yazar.")
        :task("Microtask zincirinde return ile değer aktarımı",
          ["let total = "+a+";",
           "Promise.resolve("+c+").then((inc) => total + inc).then((next) => {",
           "  console.log(next); // B",
           "});",
           "total += "+b+";",
           "console.log(total);  // A"],
          [a+b,a+b+c],"Senkron total += b önce çalışır ve A bunu yazar; ardından çalışan microtask güncel total ile inc değerini toplayıp B'ye aktarır.");
    case "lesson.java.variables": {
      const parts=n(2,4)*2,total=parts*c+parts/2;
      const boiler=(expressions)=>["class Main {","  public static void main(String[] args) {",
        "    int total = "+total+";","    int parts = "+parts+";",
        ...expressions.map(s=>"    "+s),"  }","}"];
      return focus==="a"
        ?task("Sonradan yapılan cast kesri geri getirmez",
          boiler(["double a = total / parts;","double b = (double)(total / parts);",
            "System.out.println(a); // A","System.out.println(b); // B"]),
          [c,c],"İki ifade de önce int bölme yapar; sonradan double dönüşümü kaybolan kesri geri getirmez.")
        :task("Bölmeden önce veya sonra cast",
          boiler(["double a = (double)total / parts;","double b = (double)(total / parts);",
            "System.out.println(a); // A","System.out.println(b); // B"]),
          [c+.5,c],"A'da cast bölmeden önce, B'de bölmeden sonra gerçekleşir.");
    }
    case "lesson.java.methods":
      return focus==="a"
        ?task("Erken return koşulu sağlandığında",
          ["class Main {",
           "  static int stepCost(int unit, int rate) {",
           "    if (unit <= 0) return 0;",
           "    return unit * rate;",
           "  }",
           "  public static void main(String[] args) {",
           "    System.out.println(stepCost(-"+a+", "+b+")); // A",
           "    System.out.println(stepCost("+c+", "+b+"));  // B",
           "  }","}"],
          [0,c*b],"Negatif veya sıfır birimde erken return 0 çalışır ve alt satıra geçmez; pozitif birimde unit * rate döner.")
        :task("Dönen değerleri biriktirme",
          ["class Main {",
           "  static int compute(int base, int extra) {",
           "    return base * "+k+" + extra;",
           "  }",
           "  public static void main(String[] args) {",
           "    int x = compute("+a+", "+b+");",
           "    System.out.println(x);         // A",
           "    System.out.println(x + "+c+"); // B",
           "  }","}"],
          [a*k+b,a*k+b+c],"compute değeri ekrana basmaz, return ile x değişkenine döndürür; B ise x üzerine "+c+" ekler.");
    case "lesson.java.polymorphism": {
      const classes=[
        "class Animal { int speak() { return "+a+"; } }",
        "class Dog extends Animal { int speak(int x) { return x + "+b+"; } }",
        "class Main {","  public static void main(String[] args) {",
        "    Dog dog = new Dog();"];
      return focus==="a"
        ?task("Tür değişse de kalıtılan metod",
          [...classes,"    Animal animal = dog;",
           "    System.out.println(dog.speak());    // A",
           "    System.out.println(animal.speak()); // B","  }","}"],
          [a,a],"Dog, speak() metodunu override etmediği için iki çağrı Animal.speak() kullanır.")
        :task("Parametrenin seçtiği overload",
          [...classes,"    System.out.println(dog.speak("+c+"));     // A",
           "    System.out.println(dog.speak("+(c+1)+")); // B","  }","}"],
          [c+b,c+1+b],"speak(int) overload'u, çağrıda verilen sayıyı kullanır.");
    }
    case "lesson.python.variables":
      return focus==="a"
        ?task("Dönüşüm çarpmadan önce mi, sonra mı?",
          ["price_text = \""+a+"\"","quantity = "+b,
           "print(int(price_text) * quantity)  # A","print(int(price_text * quantity))  # B"],
          [a*b,String(a).repeat(b)],"A'da önce sayıya dönüştürülüp çarpılır. B'de önce metin tekrarlanır, sonra oluşan metin sayıya çevrilir.")
        :task("Metin tekrarının uzunluğu",
          ["price_text = \""+a+"\"","quantity = "+b,
           "print(len(price_text * quantity))  # A","print(price_text * quantity)       # B"],
          [b,String(a).repeat(b)],"str * int metni quantity kez yan yana yazar; tek rakamlı metnin uzunluğu quantity olur.");
    case "lesson.python.conditions": {
      const limit=c*100,fee=k*10;
      return focus==="a"
        ?task("Sınır tam eşit olduğunda",
          ["total = "+limit,"if total > "+limit+":","    fee_a = 0","else:","    fee_a = "+fee,
           "if total >= "+limit+":","    fee_b = 0","else:","    fee_b = "+fee,
           "print(fee_a)  # A","print(fee_b)  # B"],
          [fee,0],"> eşitliği kapsamaz, >= kapsar. Sepet tam sınırdayken iki koşul farklı karar verir.")
        :task("Geniş koşul önce gelirse",
          ["total = "+(limit+b*100+a*10),
           "if total >= "+(limit+b*100)+":","    fee_a = 0","elif total >= "+limit+":","    fee_a = "+fee,"else:","    fee_a = 99",
           "if total >= "+limit+":","    fee_b = "+fee,"elif total >= "+(limit+b*100)+":","    fee_b = 0","else:","    fee_b = 99",
           "print(fee_a)  # A","print(fee_b)  # B"],
          [0,fee],"İlk doğru koşul zinciri bitirir. B'de geniş koşul önce doğru olduğu için ücretsiz dal denenmez.");
    }
    case "lesson.python.collections":
      return focus==="a"
        ?task("get varsayılanı ne zaman devreye girer?",
          ["stock = {\"elma\": "+a+"}",
           "print(stock.get(\"elma\", 0))  # A","print(stock.get(\"kiraz\", "+k+"))  # B"],
          [a,k],"Anahtar varsa kayıtlı değer döner; varsayılan yalnızca anahtar yoksa kullanılır.")
        :task("Eksik ürün filtreye girer mi?",
          ["stock = {\"elma\": "+a+", \"armut\": "+b+"}","wanted = [\"elma\", \"armut\", \"kiraz\"]",
           "low = [n for n in wanted if stock.get(n, 0) < "+k+"]",
           "enough = [n for n in wanted if stock.get(n, 0) >= "+k+"]",
           "print(len(low))     # A","print(len(enough))  # B"],
          [(a<k)+(b<k)+1,2-(a<k)-(b<k)],"Eksik kiraz 0 sayılır; 0 her eşikten küçük olduğu için düşük stok listesine girer.");
    case "lesson.python.loops": {
      const start=n(1,4),stop=start+n(3,7),sum=(start+stop-1)*(stop-start)/2;
      return focus==="a"
        ?task("range son sayıyı dahil eder mi?",
          ["start = "+start,"stop = "+stop,
           "print(list(range(start,stop))[-1]) # A",
           "print(len(list(range(start,stop)))) # B"],
          [stop-1,stop-start],"range(start,stop), stop değerini içermez; son öğe stop-1'dir.")
        :task("Bir birim daha geniş sınır",
          ["start = "+start,"stop = "+stop,
           "print(sum(range(start,stop+1))) # A",
           "print(sum(range(start,stop+2))) # B"],
          [sum+stop,sum+stop+stop+1],"İkinci range bir öğe daha alır: stop+1.");
    }
    case "lesson.python.functions":
      return focus==="a"
        ?task("print dönüş değeri üretmez",
          ["def show(n):","    print(n * "+k+")","",
           "value = show("+a+")","print(value) # A",
           "print(int(value is None)) # B"],
          ["None",1],"show sayıyı ekrana yazar; dönüş değeri None'dır, is None doğrudur.")
        :task("return argümanı izler",
          ["def give(n):","    return n * "+k,"",
           "print(give("+a+")) # A","print(give("+(a+1)+")) # B"],
          [a*k,(a+1)*k],"return sonucu, fonksiyona verilen parametreyle hesaplanır.");
    case "lesson.python.strings": {
      if(focus==="a"){
        const line=Array(b).fill("elma").join(",".repeat(k));
        return task("Ardışık ayraçlar boş parça üretir",
          ["line = \""+line+"\"",
           "print(len(line.split(\",\")))  # A",
           "print(len([p for p in line.split(\",\") if p]))  # B"],
          [(b-1)*k+1,b],"Her ayraç bir bölme noktasıdır; iki virgülün arasında boş metin oluşur. Boş metinler atlanınca yalnızca elma parçaları kalır.");
      }
      const variants=[" Veri","VERI ","veri"];
      const raw=Array.from({length:b},(_,i)=>"\""+variants[i%3]+"\"");
      return task("Temizlemeden önce ve sonra say",
        ["raw = ["+raw.join(", ")+"]",
         "print(raw.count(\"veri\"))  # A",
         "print([t.strip().lower() for t in raw].count(\"veri\"))  # B"],
        [Math.floor(b/3),b],"count yalnızca birebir aynı metni sayar. strip ve lower sonrası bütün yazımlar 'veri' olur.");
    }
    default:return null;
  }
}
