// Adres çubuğundaki tek bir sorgu parametresini, geçmişe kayıt eklemeden günceller.
// Next.js App Router, history.replaceState'i yamalar: state'te kendi işareti (__NA)
// yoksa bir yönlendirici "restore" geçişi başlatır ve bu geçiş bileşenin sonraki
// güncellemelerini dondurabilir. Mevcut state'i aynen geçirmek yamayı atlatır,
// Next'in iç ağacını korur ve geri/ileri gezintiyi bozmaz.
export function replaceSearchParam(name:string,value:string|null){
  const url=new URL(window.location.href);
  if(value)url.searchParams.set(name,value);else url.searchParams.delete(name);
  window.history.replaceState(window.history.state,"",url);
}
