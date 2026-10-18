// Trusted worker-only exercise bank. NEVER import from a browser/Next route or serialize its cases.
// Arguments can reach one short-lived untrusted sandbox; expected values NEVER enter it.
export const caseBank = Object.freeze({
  "js.sum-even": {
    revision:1,functionName:"sumEven",cases:[
      {label:"Karma pozitif ve negatifler",public:true,args:[[-3,-2,0,1,4]],expected:2},
      {label:"Çift sayı bulunmuyor",public:true,args:[[1,3,5]],expected:0},
      {public:false,args:[[2,4,6]],expected:12},
      {public:false,args:[[-2,-4,7,9,10]],expected:4},
      {public:false,args:[[0,0,11,-7]],expected:0}
    ]
  },
  "js.unique-sorted":{
    revision:1,functionName:"uniqueSorted",cases:[
      {label:"Karışık tekrarlar",public:true,args:[[4,1,4,2]],expected:[1,2,4]},
      {label:"Boş dizi",public:true,args:[[]],expected:[]},
      {public:false,args:[[3,3,2,1,2]],expected:[1,2,3]},
      {public:false,args:[[-1,-3,-1,0]],expected:[-3,-1,0]},
      {public:false,args:[[8,7,6,6,7]],expected:[6,7,8]}
    ]
  },
  "js.clamp":{
    revision:1,functionName:"clamp",cases:[
      {label:"Üst sınır aşılmış",public:true,args:[12,0,10],expected:10},
      {label:"Alt sınır aşılmış",public:true,args:[-4,0,10],expected:0},
      {public:false,args:[5,0,10],expected:5},
      {public:false,args:[10,0,10],expected:10},
      {public:false,args:[4,4,4],expected:4}
    ]
  },
  "python.sum-even": {
    revision:1,runtimeId:"python-3.12",functionName:"sum_even",cases:[
      {label:"Pozitif ve negatif karışık",public:true,args:[[-3,-2,0,1,4]],expected:2},
      {label:"Hiç çift sayı yok",public:true,args:[[1,3,5]],expected:0},
      {public:false,args:[[2,4,6,8]],expected:20},
      {public:false,args:[[-8,-1,2,3,0]],expected:-6}
    ]
  },
  "java.clamp": {
    revision:1,runtimeId:"java-21",functionName:"clamp",cases:[
      {label:"Üst sınır dışı",public:true,args:[12,0,10],expected:10},
      {label:"Alt sınır dışı",public:true,args:[-4,0,10],expected:0},
      {public:false,args:[5,0,10],expected:5},
      {public:false,args:[4,4,4],expected:4}
    ]
  }
,
  "transfer.js.snapshot": {
    revision:1,functionName:"snapshotScore",cases:[
      {label:"Artan skor",public:true,args:[6,3],expected:[6,9]},
      {label:"Azalan skor",public:true,args:[8,-2],expected:[8,6]},
      {public:false,args:[-5,9],expected:[-5,4]},
      {public:false,args:[0,0],expected:[0,0]},
      {public:false,args:[19,-30],expected:[19,-11]}
    ]
  },
  "transfer.js.map": {
    revision:1,functionName:"scaleCopy",cases:[
      {label:"Karma sayılar",public:true,args:[[-2,0,3],3],expected:[-6,0,9]},
      {label:"Boş liste",public:true,args:[[],5],expected:[]},
      {public:false,args:[[1,2,-5],-2],expected:[-2,-4,10]},
      {public:false,args:[[0,0,0],4],expected:[0,0,0]},
      {public:false,args:[[11],0],expected:[0]}
    ]
  },
  "transfer.java.divide": {
    revision:1,runtimeId:"java-21",functionName:"exactDivide",cases:[
      {label:"Kesirli bölüm",public:true,args:[7,2],expected:3.5},
      {label:"Tam bölüm",public:true,args:[8,4],expected:2},
      {public:false,args:[9,4],expected:2.25},
      {public:false,args:[-3,4],expected:-0.75}
    ]
  },
  "transfer.java.overload": {
    revision:1,runtimeId:"java-21",functionName:"combineSounds",cases:[
      {label:"İki çağrının toplamı",public:true,args:[4,3,5],expected:12},
      {label:"Sıfır değer",public:true,args:[0,2,6],expected:8},
      {public:false,args:[-4,9,2],expected:7},
      {public:false,args:[11,-4,-1],expected:6}
    ]
  },
  "transfer.python.range": {
    revision:1,runtimeId:"python-3.12",functionName:"sum_exclusive",cases:[
      {label:"Pozitif aralık",public:true,args:[2,5],expected:9},
      {label:"Boş aralık",public:true,args:[3,3],expected:0},
      {public:false,args:[-3,2],expected:-5},
      {public:false,args:[8,11],expected:27}
    ]
  },
  "transfer.python.return": {
    revision:1,runtimeId:"python-3.12",functionName:"return_product",cases:[
      {label:"Çarpan pozitif",public:true,args:[4,3],expected:12},
      {label:"Sıfır çarpanı",public:true,args:[8,0],expected:0},
      {public:false,args:[-7,5],expected:-35},
      {public:false,args:[-3,-4],expected:12}
    ]
  }
});
