// Server-only deterministic, reviewed counterfactual missions; no learner code runs.
export const transferLessonIds=Object.freeze([
  "lesson.javascript.let-const","lesson.javascript.array-map",
  "lesson.java.variables","lesson.java.polymorphism",
  "lesson.python.loops","lesson.python.functions"
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
        code:["def show(n):","    print(n * "+factor,"",
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
  if(!/^-?\d{1,7}(?:\.\d{1,3})?$/.test(clean))return null;
  const n=Number(clean);
  return Number.isFinite(n)?String(n):null;
}
export function evaluateTransfer(problem,answerA,answerB) {
  const one=normalizedAnswer(answerA),two=normalizedAnswer(answerB);
  if(one===null||two===null)return null;
  return {correct:one===normalizedAnswer(problem.expected[0]) &&
    two===normalizedAnswer(problem.expected[1])};
}
