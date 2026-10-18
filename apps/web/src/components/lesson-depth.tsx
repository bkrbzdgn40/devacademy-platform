import depth from "@/data/lesson-depth.json";

export function LessonDepth({lessonId}:{lessonId:string}) {
  const content=depth.find(item=>item.id===lessonId);
  if(!content)return null;
  return <section className="lesson-depth" aria-labelledby={"lesson-depth-"+lessonId}>
    <header className="lesson-depth-header">
      <span className="overline">KAVRAMI DERİNLEŞTİR</span>
      <h3 id={"lesson-depth-"+lessonId}>Sadece sonucu değil, nedenini öğren</h3>
      <p>Örneği yeni bir durumda kullanabilmek için aşağıdaki varsayımları incele.</p>
    </header>
    <div className="lesson-depth-grid">
      <article className="lesson-depth-model">
        <span className="lesson-depth-kicker">01 · Zihinsel model</span>
        <h4>Bu kavramı nasıl düşünmelisin?</h4>
        <p>{content.model}</p>
      </article>
      <article className="lesson-depth-mistake">
        <span className="lesson-depth-kicker">02 · Sık yapılan hata</span>
        <h4>Seni yanıltabilecek varsayım</h4>
        <p>{content.pitfall}</p>
      </article>
    </div>
    <details className="lesson-depth-contrast">
      <summary>03 · Bir karşı örneğin arkasındaki mantığı incele</summary>
      <div>
        <p className="lesson-depth-contrast-example">{content.contrast}</p>
        <p><strong>Neden?</strong> {content.why}</p>
      </div>
    </details>
    <div className="lesson-depth-checkpoint">
      <span className="lesson-depth-kicker">04 · Şimdi sen düşün</span>
      <h4>Yeni durumda ne yapardın?</h4>
      <p>{content.challenge}</p>
      <details>
        <summary>Önce kendin düşün, sonra açıklamayı aç</summary>
        <p>{content.answer}</p>
      </details>
      <p className="lesson-depth-real-world"><strong>Gerçek dünyada:</strong> {content.application}</p>
    </div>
    <p className="lesson-depth-note">Bu bölüm rehberli öğrenme içindir; cevapları açmak bağımsız yeterlilik puanını değiştirmez.</p>
  </section>;
}
