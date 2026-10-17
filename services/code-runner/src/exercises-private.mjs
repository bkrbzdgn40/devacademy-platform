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
});
