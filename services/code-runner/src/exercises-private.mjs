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
  "transfer.js.equality": {
    revision:1,functionName:"matchNumericId",cases:[
      {label:"Metin olarak gelen eşleşen kimlik",public:true,args:["42",42],expected:true},
      {label:"Boş metin 0 ile eşleşmemeli",public:true,args:["",0],expected:false},
      {public:false,args:[42,42],expected:true},
      {public:false,args:["42",43],expected:false},
      {public:false,args:["   ",0],expected:false}
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
  "transfer.js.functions": {
    revision:1,functionName:"computePaceScore",cases:[
      {label:"Varsayılan tur puanı ve bonus",public:true,args:[4],expected:65},
      {label:"Açık argümanlarla sıfır bonus",public:true,args:[3,20,0],expected:60},
      {public:false,args:[2,10],expected:25},
      {public:false,args:[0,15,5],expected:5},
      {public:false,args:[5,12,-10],expected:50}
    ]
  },
  "transfer.js.scope": {
    revision:1,functionName:"trackQuota",cases:[
      {label:"Yerel gölgeleme ve dış artış",public:true,args:[25,10,5],expected:[12,30]},
      {label:"Dış kontenjan azalırken yerel sabit artış",public:true,args:[20,8,-4],expected:[10,16]},
      {public:false,args:[15,0,0],expected:[2,15]},
      {public:false,args:[30,18,10],expected:[20,40]},
      {public:false,args:[12,5,-12],expected:[7,0]}
    ]
  },
  "transfer.js.filter": {
    revision:1,functionName:"sumQualifiedOrders",cases:[
      {label:"Karma siparişler ve sınır değeri",public:true,args:[[60,-40,30,50,90],50],expected:200},
      {label:"Eşiği geçen sipariş yok",public:true,args:[[10,25,-80],50],expected:0},
      {public:false,args:[[],10],expected:0},
      {public:false,args:[[20,20,19],20],expected:40},
      {public:false,args:[[-10,0,15,35],15],expected:50}
    ]
  },
  "transfer.js.async": {
    revision:1,functionName:"resolveAlertBatch",cases:[
      {label:"Acil ve normal bildirimler kısmen sığar",public:true,args:[4,5,6],expected:[4,2,3]},
      {label:"Acil bildirimler tüm kapasiteyi doldurur",public:true,args:[8,3,5],expected:[5,0,6]},
      {public:false,args:[0,3,5],expected:[0,3,0]},
      {public:false,args:[3,2,0],expected:[0,0,5]},
      {public:false,args:[-2,4,3],expected:[0,3,1]}
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
  },
  "transfer.python.format-total": {
    revision:1,runtimeId:"python-3.12",functionName:"format_total",cases:[
      {label:"Formdan gelen ondalıklı fiyat",public:true,args:["12.50",3,4.99],expected:"42.49"},
      {label:"Ürün yok, yalnızca teslimat",public:true,args:["0.99",0,4.5],expected:"4.50"},
      {public:false,args:["19.99",2,0],expected:"39.98"},
      {public:false,args:["7",4,2.25],expected:"30.25"},
      {public:false,args:["100",1,0],expected:"100.00"}
    ]
  },
  "transfer.python.shipping-fee": {
    revision:1,runtimeId:"python-3.12",functionName:"shipping_fee",cases:[
      {label:"Tam ücretsiz kargo sınırı",public:true,args:[500],expected:0},
      {label:"Alt kademe",public:true,args:[150],expected:50},
      {public:false,args:[499.99],expected:30},
      {public:false,args:[200],expected:30},
      {public:false,args:[199.99],expected:50},
      {public:false,args:[1000],expected:0}
    ]
  },
  "transfer.python.low-stock": {
    revision:1,runtimeId:"python-3.12",functionName:"low_stock",cases:[
      {label:"Düşük ve kayıtsız ürün",public:true,args:[{"elma":3,"armut":12},["elma","armut","kiraz"],5],expected:["elma","kiraz"]},
      {label:"Boş sipariş",public:true,args:[{},[],5],expected:[]},
      {public:false,args:[{"kalem":5},["kalem"],5],expected:[]},
      {public:false,args:[{"x":0,"y":9},["y","x","z"],10],expected:["y","x","z"]},
      {public:false,args:[{"a":1,"b":2},["b","a"],2],expected:["a"]}
    ]
  }
});
