// M8.5.1: nine additional authored, bounded teaching traces.
// This is NOT an interpreter. The reviewed Java/JS/Python programs are
// executed in CI, and their full stdout is compared against each timeline.
export const extraStudioLessons=Object.freeze([
  "lesson.javascript.equality","lesson.javascript.functions",
  "lesson.javascript.scope","lesson.javascript.filter",
  "lesson.javascript.async","lesson.java.methods",
  "lesson.python.variables","lesson.python.conditions",
  "lesson.python.collections"
]);
const metadata=Object.freeze({
  "lesson.javascript.equality":{
    title:"Katı eşitlik laboratuvarı",question:"Türler farklıysa == ve === aynı mı davranır?",
    hint:"Önce iki değerin türlerini oku. == dönüşüm yapabilir, === yapmaz.",
    topics:["Gevşek karşılaştırma ve dönüşüm","Katı karşılaştırma ve tür"]},
  "lesson.javascript.functions":{
    title:"Fonksiyonun iki yüzü",question:"Fonksiyonun dönüş değeri ve arrow ifadesi nasıl hesaplanır?",
    hint:"return ile gelen değeri yazdırmadan önce hesapla; arrow ifadesindeki işlemi ayrıca izle.",
    topics:["return değeri","Arrow function hesabı"]},
  "lesson.javascript.scope":{
    title:"İç ve dış değişken izleyicisi",question:"Blok içindeki let, dışarıdaki aynı adlı bağı değiştirir mi?",
    hint:"İçteki let yeni bir bağ kurar; blok bitince hangi bağa erişildiğini düşün.",
    topics:["İç blok kapsamı","Dış blok kapsamı"]},
  "lesson.javascript.filter":{
    title:"Seçim ve biriktirme laboratuvarı",question:"filter ile kaç öğe kalır; reduce ile toplam ne olur?",
    hint:"Önce yalnızca koşulu sağlayan öğeleri seç, sonra seçilenleri sıfırdan topla.",
    topics:["filter öğe seçimi","reduce birikim değeri"]},
  "lesson.javascript.async":{
    title:"Mikrogörev sıralaması",question:"Promise hemen çözülse bile .then ne zaman çalışır?",
    hint:"Senkron kod tamamlanmadan .then callback'i çalıştırılmaz.",
    topics:["Senkron A çıktısı","Microtask B çıktısı"]},
  "lesson.java.methods":{
    title:"Java metot dönüşü",question:"Dönen sayı hangi satırda kullanılır?",
    hint:"return çağrı noktasına değer verir; println çıktı üretir.",
    topics:["Metot dönüş değeri","Dönen değerle yeni işlem"]},
  "lesson.python.variables":{
    title:"Sayı ve metin ayrımı",question:"int olarak tutulan sayı ile f-string içindeki metin aynı mı?",
    hint:"Toplama için sayıyı kullan; f-string'in karakter sayısını ayrı hesapla.",
    topics:["Sayısal işlem","f-string metin uzunluğu"]},
  "lesson.python.conditions":{
    title:"Koşul dalı laboratuvarı",question:"if/else hangi dalı seçer, ikinci koşul farklı olabilir mi?",
    hint:"Her koşulu ayrı doğruluk değeri olarak değerlendir; girintilere dikkat et.",
    topics:["if/else dalı","İkinci karşılaştırma"]},
  "lesson.python.collections":{
    title:"Sözlükte güvenli okuma",question:"get, eksik anahtarda ne döndürür?",
    hint:"city yerine bulunmayan bir sayısal anahtar soruluyor: varsayılan değer kullanılır.",
    topics:["get varsayılan değeri","Var olan anahtarla hesap"]}
});
const data=Object.freeze({
  "lesson.javascript.equality":[
    {left:"5",right:5,kind:"string"},
    {left:0,right:0,kind:"number"},
    {left:"7",right:8,kind:"string"}],
  "lesson.javascript.functions":[
    {value:3,factor:4,offset:2},
    {value:5,factor:2,offset:-3},
    {value:-2,factor:5,offset:4}],
  "lesson.javascript.scope":[
    {outer:2,inner:7},
    {outer:10,inner:-3},
    {outer:-5,inner:12}],
  "lesson.javascript.filter":[
    {values:[1,2,3,4,6]},
    {values:[1,3,5,7]},
    {values:[-4,-2,0,5,8]}],
  "lesson.javascript.async":[
    {start:3,delta:4},
    {start:10,delta:-3},
    {start:0,delta:9}],
  "lesson.java.methods":[
    {value:4,scale:2,offset:3},
    {value:5,scale:3,offset:-2},
    {value:-3,scale:4,offset:7}],
  "lesson.python.variables":[
    {age:20,delta:3},
    {age:7,delta:-2},
    {age:105,delta:1}],
  "lesson.python.conditions":[
    {age:15},{age:18},{age:23}],
  "lesson.python.collections":[
    {age:20,fallback:11,delta:2},
    {age:35,fallback:-1,delta:-5},
    {age:8,fallback:0,delta:6}]
});
export const extraStudioVariantCount=(lessonId)=>data[lessonId]?.length??0;
function begin() {
  const steps=[],outputs=[];
  function add(line,variables,message,output){
    if(output)outputs.push({...output});
    steps.push({line,variables:{...variables},outputs:outputs.map(x=>({...x})),message});
  }
  return {steps,add};
}
export function buildExtraStudioScenario(lessonId,variant=0) {
  if(!extraStudioLessons.includes(lessonId))return null;
  if(!Number.isInteger(variant)||variant<0||variant>=extraStudioVariantCount(lessonId))
    throw Error("STUDIO_VARIANT_OUT_OF_RANGE");
  const p=data[lessonId][variant],meta=metadata[lessonId],{steps,add}=begin();
  let code,expected;
  switch(lessonId){
    case "lesson.javascript.equality":{
      const left=p.kind==="string"?JSON.stringify(p.left):String(p.left);
      const loose=Number(p.left==p.right),strict=Number(p.left===p.right);
      code=[
        "const left = "+left+";",
        "const right = "+p.right+";",
        "console.log(Number(left == right));  // A",
        "console.log(Number(left === right)); // B"
      ];
      add(1,{left:p.left,"typeof left":p.kind},"İlk değer ve türü belirlenir.");
      add(2,{left:p.left,right:p.right,"typeof left":p.kind,"typeof right":"number"},
        "İki operandın değerini ve türünü karşılaştır.");
      add(3,{left:p.left,right:p.right},"== bazı türlerde dönüşüm yapabilir.",
        {label:"A",value:String(loose)});
      add(4,{left:p.left,right:p.right},"=== değerle birlikte türün de aynı olmasını ister.",
        {label:"B",value:String(strict)});
      expected=[String(loose),String(strict)];break;
    }
    case "lesson.javascript.functions":{
      const first=p.value*p.factor,second=p.value+p.offset;
      code=[
        "function multiply(n) { return n * "+p.factor+"; }",
        "const shift = n => n + ("+p.offset+");",
        "console.log(multiply("+p.value+")); // A",
        "console.log(shift("+p.value+"));    // B"
      ];
      add(1,{multiply:"fonksiyon"},"multiply bir değer döndüren fonksiyon olarak tanımlanır.");
      add(2,{multiply:"fonksiyon",shift:"arrow"},"shift bir ifade kullanan arrow function'dır.");
      add(3,{n:p.value,"return (multiply)":first},"multiply çağrısı return değeri üretir.",
        {label:"A",value:String(first)});
      add(4,{n:p.value,"return (shift)":second},"Arrow ifadesindeki n + offset döndürülür.",
        {label:"B",value:String(second)});
      expected=[String(first),String(second)];break;
    }
    case "lesson.javascript.scope":{
      code=[
        "let count = "+p.outer+";",
        "{",
        "  let count = "+p.inner+";",
        "  console.log(count); // A",
        "}",
        "console.log(count); // B"
      ];
      add(1,{"dış count":p.outer},"Dış blokta count bağlanır.");
      add(3,{"dış count":p.outer,"iç count":p.inner},
        "İç blok yeni bir let count oluşturur; dış count değişmez.");
      add(4,{"dış count":p.outer,"iç count":p.inner},"A iç bağın değerini görür.",
        {label:"A",value:String(p.inner)});
      add(6,{"dış count":p.outer},"Blok kapandı; B yalnızca dış count'a erişebilir.",
        {label:"B",value:String(p.outer)});
      expected=[String(p.inner),String(p.outer)];break;
    }
    case "lesson.javascript.filter":{
      const evens=p.values.filter(n=>n%2===0),total=evens.reduce((a,n)=>a+n,0);
      code=[
        "const values = "+JSON.stringify(p.values)+";",
        "const evens = values.filter(n => n % 2 === 0);",
        "console.log(evens.length); // A",
        "console.log(evens.reduce((sum,n) => sum+n,0)); // B"
      ];
      add(1,{values:JSON.stringify(p.values)},"Kaynak dizinin tüm öğeleri tutulur.");
      add(2,{values:JSON.stringify(p.values),evens:JSON.stringify(evens)},
        "filter yalnızca çift sayıları yeni diziye alır.");
      add(3,{evens:JSON.stringify(evens),length:evens.length},
        "A kalan öğe sayısını yazdırır.",{label:"A",value:String(evens.length)});
      add(4,{evens:JSON.stringify(evens),total},
        "reduce sıfırdan başlayarak seçilen öğeleri biriktirir.",
        {label:"B",value:String(total)});
      expected=[String(evens.length),String(total)];break;
    }
    case "lesson.javascript.async":{
      const later=p.start+p.delta;
      code=[
        "let count = "+p.start+";",
        "Promise.resolve().then(() => {",
        "  count += "+p.delta+";",
        "  console.log(count); // B",
        "});",
        "console.log(count); // A"
      ];
      add(1,{count:p.start},"count senkron olarak atanır.");
      add(2,{count:p.start,callback:"bekliyor"},
        "Promise callback'i microtask kuyruğuna yazılır; hemen çalışmaz.");
      add(6,{count:p.start,callback:"bekliyor"},
        "Senkron console.log önce çalışır.",{label:"A",value:String(p.start)});
      add(3,{count:later,callback:"çalışıyor"},
        "Senkron kod bitince microtask çalışır ve count güncellenir.");
      add(4,{count:later,callback:"tamamlandı"},
        "B, güncellenmiş değeri yazdırır.",{label:"B",value:String(later)});
      expected=[String(p.start),String(later)];break;
    }
    case "lesson.java.methods":{
      const first=p.value*p.scale,second=first+p.offset;
      code=[
        "class Main {",
        "  static int multiply(int n) { return n * "+p.scale+"; }",
        "  public static void main(String[] args) {",
        "    int result = multiply("+p.value+");",
        "    System.out.println(result); // A",
        "    System.out.println(result + ("+p.offset+")); // B",
        "  }",
        "}"
      ];
      add(2,{multiply:"int → int"},"Metodun dönüş türü int olarak tanımlanır.");
      add(4,{n:p.value,result:first},"multiply çağrısı sonucu result'a atanır.");
      add(5,{result:first},"A, return edilen değeri yazdırır.",{label:"A",value:String(first)});
      add(6,{result:first,offset:p.offset},
        "B, dönen değeri yeni bir hesapta kullanır.",{label:"B",value:String(second)});
      expected=[String(first),String(second)];break;
    }
    case "lesson.python.variables":{
      const label="Yaş: "+p.age,updated=p.age+p.delta;
      code=[
        "age = "+p.age,
        "label = f\"Yaş: {age}\"",
        "print(age + ("+p.delta+")) # A",
        "print(len(label)) # B"
      ];
      add(1,{age:p.age,"age türü":"int"},"age bir tam sayıdır.");
      add(2,{age:p.age,label,"label türü":"str"},
        "f-string tam sayı değerini metin içine yerleştirir.");
      add(3,{age:p.age,delta:p.delta},"A sayısal toplama yapar.",
        {label:"A",value:String(updated)});
      add(4,{label,"karakter sayısı":label.length},"B, f-string metninin karakterlerini sayar.",
        {label:"B",value:String(label.length)});
      expected=[String(updated),String(label.length)];break;
    }
    case "lesson.python.conditions":{
      const adult=Number(p.age>=18),threshold=Number(p.age>=21);
      code=[
        "age = "+p.age,
        "if age >= 18:",
        "    status = 1",
        "else:",
        "    status = 0",
        "print(status) # A",
        "print(int(age >= 21)) # B"
      ];
      add(1,{age:p.age},"age değişkeni atanır.");
      add(2,{age:p.age,"age >= 18":String(Boolean(adult))},
        "İlk koşulun doğruluk değeri kontrol edilir.");
      add(adult?3:5,{age:p.age,status:adult},
        adult?"if dalına girilir.":"else dalına girilir.");
      add(6,{age:p.age,status:adult},"A, seçilen dalın sonucunu yazdırır.",
        {label:"A",value:String(adult)});
      add(7,{age:p.age,status:adult,"age >= 21":String(Boolean(threshold))},
        "İkinci koşul ayrı değerlendirilir.",{label:"B",value:String(threshold)});
      expected=[String(adult),String(threshold)];break;
    }
    case "lesson.python.collections":{
      const updated=p.age+p.delta;
      code=[
        "person = {\"age\": "+p.age+"}",
        "missing = person.get(\"score\", "+p.fallback+")",
        "print(missing) # A",
        "print(person[\"age\"] + ("+p.delta+")) # B"
      ];
      add(1,{"person.age":p.age},"Sözlükte age anahtarı tanımlıdır; score yoktur.");
      add(2,{"person.age":p.age,missing:p.fallback},
        "get, bulunmayan score anahtarına varsayılan değer döndürür.");
      add(3,{missing:p.fallback},"A varsayılan sayısal değeri yazdırır.",
        {label:"A",value:String(p.fallback)});
      add(4,{"person.age":p.age,delta:p.delta},
        "age anahtarı vardır, bu nedenle indeksle erişilip toplama yapılır.",
        {label:"B",value:String(updated)});
      expected=[String(p.fallback),String(updated)];break;
    }
  }
  return {lessonId,variant,title:meta.title,question:meta.question,hint:meta.hint,
    topics:meta.topics,code:code.join("\n"),codeLines:code,expected,steps,
    variantCount:extraStudioVariantCount(lessonId)};
}
