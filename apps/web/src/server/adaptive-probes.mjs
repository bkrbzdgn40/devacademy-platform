// Reviewed, server-only diagnostic interventions. These are hypotheses about
// observed mistakes, not mind-reading or psychometric diagnoses.
import {transferProblem,normalizedAnswer} from "./transfer-missions.mjs";

const hypothesis={
  "lesson.javascript.let-const": {
    a:"A sonucunda değişkenin yeniden atanması ile önceki değerinin korunması karışmış olabilir.",
    b:"B sonucunda nesnenin alanını değiştirmek ile const bağını değiştirmek karışmış olabilir."
  },
  "lesson.javascript.array-map": {
    a:"A sonucunda map içindeki dönüşümün hangi öğeye uygulandığı karışmış olabilir.",
    b:"B sonucunda map'in kaynak diziyi değiştirip değiştirmediği karışmış olabilir."
  },
  "lesson.java.variables": {
    a:"A sonucunda tamsayı bölmesinin ondalıklı değişkene atanmadan önce tamamlandığı gözden kaçmış olabilir.",
    b:"B sonucunda tür dönüşümünü bölmeden önce veya sonra yapmanın etkisi karışmış olabilir."
  },
  "lesson.java.polymorphism": {
    a:"A sonucunda kalıtılan parametresiz metodun hangi sınıftan geldiği karışmış olabilir.",
    b:"B sonucunda speak(int) aşırı yüklemesinin argümanla nasıl çağrıldığı karışmış olabilir."
  },
  "lesson.python.loops": {
    a:"A sonucunda range bitiş değerinin dışarıda kaldığı gözden kaçmış olabilir.",
    b:"B sonucunda bitiş sınırını bir artırmanın hangi ek öğeyi kattığı karışmış olabilir."
  },
  "lesson.python.functions": {
    a:"A sonucunda ekrana yazdırılan değer ile çağırana dönen değer karışmış olabilir.",
    b:"B sonucunda return edilen değer ile fonksiyon argümanının ilişkisi karışmış olabilir."
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
    default:return null;
  }
}
