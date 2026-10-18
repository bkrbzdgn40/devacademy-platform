import {extraStudioLessons,extraStudioVariantCount,buildExtraStudioScenario}
  from "./studio-scenarios-extra.mjs";

// M8.5: client-safe, reviewed teaching traces. This is NOT a general-purpose
// interpreter, an assessment oracle, or a graded independent transfer attempt.
// Every source variant is generated from a fixed, bounded authored model.
export const studioLessons=Object.freeze([
  "lesson.javascript.let-const",
  "lesson.javascript.array-map",
  "lesson.java.variables",
  "lesson.java.polymorphism",
  "lesson.python.loops",
  "lesson.python.functions",
  ...extraStudioLessons
]);
const descriptions=Object.freeze({
  "lesson.javascript.let-const":{title:"Değişken ve nesne izleyicisi",question:"Nesnenin alanı güncellenince score değişir mi?",hint:"İki ayrı sayı değeri mi, yoksa aynı nesneye verilen iki isim mi var?",topics:["Değerin kopyalanması","Nesne alanı"]},
  "lesson.javascript.array-map":{title:"Dizi dönüşüm izleyicisi",question:"map kaynak diziyi de değiştirir mi?",hint:"map'in döndürdüğü dizi ile başlangıçtaki values dizisini ayrı ayrı takip et.",topics:["Yeni dizi","Kaynak dizi"]},
  "lesson.java.variables":{title:"Bölme ve tür izleyicisi",question:"Bir işlemin sonucu ne zaman double olur?",hint:"Atama yapılan değişkene değil, / operatörünün operandlarına bak.",topics:["Tamsayı bölmesi","İşlem öncesi cast"]},
  "lesson.java.polymorphism":{title:"Metot seçim izleyicisi",question:"speak(int), speak() metodunu override eder mi?",hint:"Metodun adı aynı, fakat parametre listesi aynı mı?",topics:["Kalıtılan metot","Aşırı yükleme"]},
  "lesson.python.loops":{title:"range adım izleyicisi",question:"Döngü bitiş değerini toplar mı?",hint:"range(start, stop) durmadan önce hangi son değeri üretir?",topics:["Bitiş hariç aralık","Bitiş dahil hesap"]},
  "lesson.python.functions":{title:"print / return izleyicisi",question:"Ekrana yazılan değer fonksiyondan geri gelir mi?",hint:"Konsola çıktı vermek, çağırana değer döndürmekle aynı işlem değildir.",topics:["Dönüş değeri","Konsol çıktısı"]}
});
const inputs=Object.freeze({
  "lesson.javascript.let-const":[{score:3,delta:4,extra:2},{score:9,delta:-3,extra:5},{score:0,delta:7,extra:-2}],
  "lesson.javascript.array-map":[{values:[2,4,6],factor:2},{values:[-3,0,5],factor:3},{values:[8,1,-2],factor:-2}],
  "lesson.java.variables":[{total:7,parts:2},{total:9,parts:4},{total:13,parts:4}],
  "lesson.java.polymorphism":[{base:4,extra:3,arg:5},{base:8,extra:2,arg:2},{base:1,extra:4,arg:9}],
  "lesson.python.loops":[{start:1,stop:5},{start:2,stop:6},{start:3,stop:8}],
  "lesson.python.functions":[{value:4,factor:2},{value:7,factor:3},{value:5,factor:4}]
});
export function studioVariantCount(lessonId){return inputs[lessonId]?.length??extraStudioVariantCount(lessonId);}
export function studioHasLesson(lessonId){return studioLessons.includes(lessonId);}
function traceBuilder() {
  const steps=[],outputs=[];
  function add(line,variables,message,newOutput){
    if(newOutput)outputs.push(newOutput);
    steps.push({line,variables:{...variables},outputs:outputs.map(x=>({...x})),message});
  }
  return {steps,add};
}
export function buildStudioScenario(lessonId,variant=0) {
  if(!studioHasLesson(lessonId))return null;
  if(!Number.isInteger(variant)||variant<0||variant>=studioVariantCount(lessonId))
    throw Error("STUDIO_VARIANT_OUT_OF_RANGE");
  if(extraStudioLessons.includes(lessonId))return buildExtraStudioScenario(lessonId,variant);
  const p=inputs[lessonId][variant], meta=descriptions[lessonId], {steps,add}=traceBuilder();
  let code,expected;
  switch(lessonId) {
    case "lesson.javascript.let-const":{
      const initial=p.score, updated=initial+p.delta,field=updated+p.extra;
      code=[
        "let score = "+initial+";",
        "score += "+p.delta+";",
        "const profile = { score };",
        "profile.score += "+p.extra+";",
        "console.log(score);         // A",
        "console.log(profile.score); // B"
      ];
      add(1,{score:initial},"score başlangıç değerini alır.");
      add(2,{score:updated},"score yeni sayısal değeri alır.");
      add(3,{score:updated,"profile.score":updated},"Nesne, o andaki score değerini alan bir alanla oluşturulur.");
      add(4,{score:updated,"profile.score":field},"Nesne alanı değişir; dışarıdaki score değişkeni aynı kalır.");
      add(5,{score:updated,"profile.score":field},"A, score değerini yazdırır.",{label:"A",value:String(updated)});
      add(6,{score:updated,"profile.score":field},"B, güncellenmiş nesne alanını yazdırır.",{label:"B",value:String(field)});
      expected=[String(updated),String(field)];break;
    }
    case "lesson.javascript.array-map":{
      const source=p.values.slice(),scaled=source.map(v=>v*p.factor);
      code=[
        "const values = "+JSON.stringify(source)+";",
        "const scaled = values.map(n => n * "+p.factor+");",
        "console.log(scaled[1]); // A",
        "console.log(values[1]); // B"
      ];
      add(1,{values:JSON.stringify(source)},"Başlangıç dizisi oluşturulur.");
      add(2,{values:JSON.stringify(source),scaled:JSON.stringify(scaled)},
        "map her öğeye çarpma uygular ve YENİ dizi üretir.");
      add(3,{values:JSON.stringify(source),scaled:JSON.stringify(scaled)},
        "A yeni dizinin ikinci öğesidir.",{label:"A",value:String(scaled[1])});
      add(4,{values:JSON.stringify(source),scaled:JSON.stringify(scaled)},
        "B kaynak dizinin değişmemiş ikinci öğesidir.",{label:"B",value:String(source[1])});
      expected=[String(scaled[1]),String(source[1])];break;
    }
    case "lesson.java.variables":{
      const quotient=Math.trunc(p.total/p.parts),decimal=p.total/p.parts;
      code=[
        "class Main {",
        "  public static void main(String[] args) {",
        "    int total = "+p.total+";",
        "    int parts = "+p.parts+";",
        "    double a = total / parts;",
        "    double b = (double) total / parts;",
        "    System.out.println(a); // A",
        "    System.out.println(b); // B",
        "  }",
        "}"
      ];
      add(3,{total:p.total},"total, int türündedir.");
      add(4,{total:p.total,parts:p.parts},"parts da int türündedir.");
      add(5,{total:p.total,parts:p.parts,a:quotient+".0"},
        "Her iki operand int olduğu için bölme tam sayı üretir. Sonra double'a atanır.");
      add(6,{total:p.total,parts:p.parts,a:quotient+".0",b:String(decimal)},
        "Bölmeden ÖNCE cast yapıldığı için kesir korunur.");
      add(7,{a:quotient+".0",b:String(decimal)},"A değerinin double biçimi yazdırılır.",
        {label:"A",value:quotient+".0"});
      add(8,{a:quotient+".0",b:String(decimal)},"B değerinin kesirli biçimi yazdırılır.",
        {label:"B",value:String(decimal)});
      expected=[quotient+".0",String(decimal)];break;
    }
    case "lesson.java.polymorphism":{
      const passed=p.arg+p.extra;
      code=[
        "class Animal { int speak() { return "+p.base+"; } }",
        "class Dog extends Animal { int speak(int x) { return x + "+p.extra+"; } }",
        "class Main {",
        "  public static void main(String[] args) {",
        "    Dog dog = new Dog();",
        "    System.out.println(dog.speak()); // A",
        "    System.out.println(dog.speak("+p.arg+")); // B",
        "  }",
        "}"
      ];
      add(1,{"Animal.speak()":p.base},"Animal parametresiz metodu tanımlar.");
      add(2,{"Animal.speak()":p.base,"Dog.speak(int)":"x + "+p.extra},
        "Dog aynı isimle farklı parametre alan bir overload tanımlar.");
      add(5,{dog:"Dog","Dog.speak(int)":"x + "+p.extra},"dog gerçek türü Dog olan nesnedir.");
      add(6,{dog:"Dog","seçilen metot":"Animal.speak()"},"Parametresiz sürüm Dog'da override edilmemiştir.",
        {label:"A",value:String(p.base)});
      add(7,{dog:"Dog","seçilen metot":"Dog.speak(int)",x:p.arg},
        "Argümanlı çağrı, farklı parametreli overload'u seçer.",
        {label:"B",value:String(passed)});
      expected=[String(p.base),String(passed)];break;
    }
    case "lesson.python.loops":{
      code=[
        "start = "+p.start,
        "stop = "+p.stop,
        "total = 0",
        "for number in range(start, stop):",
        "    total += number",
        "print(total)               # A",
        "print(sum(range(start, stop + 1))) # B"
      ];
      let total=0;
      add(1,{start:p.start},"Başlangıç sınırı atanır.");
      add(2,{start:p.start,stop:p.stop},"Bitiş sınırı atanır.");
      add(3,{start:p.start,stop:p.stop,total:0},"Toplam sıfırdan başlar.");
      for(let number=p.start;number<p.stop;number++){
        add(4,{number,total},"range, stop değerini DIŞARIDA bırakarak sonraki sayıyı üretir.");
        total+=number;
        add(5,{number,total},"number, total üzerine eklenir.");
      }
      add(6,{total},"A, üst sınır eklenmeden hesaplanan toplamdır.",
        {label:"A",value:String(total)});
      add(7,{total,"üst sınır dahil":total+p.stop},
        "B, stop değerini de kapsadığı için toplam "+p.stop+" artar.",
        {label:"B",value:String(total+p.stop)});
      expected=[String(total),String(total+p.stop)];break;
    }
    case "lesson.python.functions":{
      const value=p.value*p.factor;
      code=[
        "def show(n):",
        "    print(n * "+p.factor+")",
        "",
        "def give(n):",
        "    return n * "+p.factor,
        "",
        "first = show("+p.value+")",
        "second = give("+p.value+")",
        "print(first)  # A",
        "print(second) # B"
      ];
      add(1,{show:"fonksiyon"},"show tanımlanır; henüz çağrılmaz.");
      add(4,{show:"fonksiyon",give:"fonksiyon"},"give tanımlanır; henüz çağrılmaz.");
      add(2,{n:p.value},"show içindeki print çalışır; ama bir return değildir.",
        {label:"Ara çıktı",value:String(value)});
      add(7,{first:"None"},"show değer döndürmediği için first None olur.");
      add(5,{first:"None",n:p.value},"give sonucu çağırana geri döndürür.");
      add(8,{first:"None",second:value},"second dönüş değerini alır.");
      add(9,{first:"None",second:value},"A, None değerini yazdırır.",{label:"A",value:"None"});
      add(10,{first:"None",second:value},"B, döndürülen sayıyı yazdırır.",
        {label:"B",value:String(value)});
      expected=["None",String(value)];break;
    }
  }
  return {lessonId,variant,title:meta.title,question:meta.question,
    hint:meta.hint,topics:meta.topics,code:code.join("\n"),codeLines:code,
    expected,steps,variantCount:studioVariantCount(lessonId)};
}
export function normalizeStudioAnswer(value) {
  if(typeof value!=="string"||value.length>24)return null;
  const trimmed=value.trim();
  if(/^none$/i.test(trimmed))return "None";
  const n=trimmed.replace(",",".");
  if(!/^-?\d{1,8}(?:\.\d{1,3})?$/.test(n))return null;
  return String(Number(n));
}
export function gradeStudioPrediction(scenario,a,b) {
  const input=[normalizeStudioAnswer(a),normalizeStudioAnswer(b)];
  if(input.some(x=>x===null))return null;
  return input.map((x,i)=>x===normalizeStudioAnswer(scenario.expected[i]));
}
