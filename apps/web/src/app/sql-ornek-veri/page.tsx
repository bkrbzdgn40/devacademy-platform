import type {Metadata} from "next";
import Link from "next/link";

export const metadata:Metadata={title:"SQL Temelleri · Örnek veri"};
const customers=[{id:1,name:"Ayşe"},{id:2,name:"Bora"},{id:3,name:"Can"}];
const orders=[
  {id:10,customer:1,amount:120,status:"teslim",date:"2026-10-01"},
  {id:11,customer:1,amount:80,status:"bekliyor",date:"NULL"},
  {id:12,customer:2,amount:200,status:"teslim",date:"2026-10-02"},
  {id:13,customer:2,amount:50,status:"teslim",date:"2026-10-03"},
  {id:14,customer:1,amount:100,status:"teslim",date:"2026-10-04"}
];
export default function SqlDataPage(){
  return <section className="shell listing-page">
    <Link href="/kurslar/sql-temelleri" className="back-link">← SQL Temelleri kursu</Link>
    <div className="listing-header"><p className="overline">M11 · Örnek veri kümesi</p>
      <h1>Müşteriler ve siparişler</h1>
      <p>SQL derslerindeki bütün sorgular aynı sabit, kurgusal veriyi kullanır. Gerçek kişi veya öğrenci verileri değildir.</p></div>
    <div className="availability-note" role="status">
      Bu tablolardaki sorgu sonuçları PostgreSQL CI testleriyle doğrulanır. Uygulama tarayıcıdan SQL sorgusu çalıştırmaz; yerel hesabına ait veritabanını sorgulamaz.
    </div>
    <div className="sql-dataset">
      <section><h2>musteriler</h2><div className="sql-dataset-scroll"><table>
        <thead><tr><th scope="col">id</th><th scope="col">ad</th></tr></thead>
        <tbody>{customers.map(x=><tr key={x.id}><td>{x.id}</td><td>{x.name}</td></tr>)}</tbody>
      </table></div></section>
      <section><h2>siparisler</h2><div className="sql-dataset-scroll"><table>
        <thead><tr><th scope="col">id</th><th scope="col">musteri_id</th><th scope="col">tutar</th>
          <th scope="col">durum</th><th scope="col">teslim_tarihi</th></tr></thead>
        <tbody>{orders.map(x=><tr key={x.id}><td>{x.id}</td><td>{x.customer}</td><td>{x.amount}</td>
          <td>{x.status}</td><td>{x.date}</td></tr>)}</tbody>
      </table></div></section>
    </div>
    <p className="small-note">NULL: Bu örnekte henüz bilinmeyen teslim tarihi. Sayı sıfır veya boş metin değildir.</p>
    <Link className="ui-button ui-button-primary" href="/kurslar/sql-temelleri/select-ve-siralama">İlk SQL dersine başla →</Link>
  </section>;
}
