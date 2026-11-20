"use client";
import {useState} from "react";
import {learningPaths,searchLearningPaths} from "@/lib/learning-paths.mjs";
import {LearningPathCard,type LearningPath} from "@/components/learning-path-card";
export function CourseExplorer(){
  const [query,setQuery]=useState("");
  const matched=searchLearningPaths(learningPaths,query) as LearningPath[];
  return <div className="course-explorer">
    <div className="explorer-search">
      <label htmlFor="course-search">Kurs veya ders ara</label>
      <div className="explorer-search-row">
        <input id="course-search" type="search" autoComplete="off"
          placeholder="Örn. döngüler"
          value={query} onChange={e=>setQuery(e.target.value)} />
        {query&&<button type="button" onClick={()=>setQuery("")}>Temizle</button>}
      </div>
      <p>Arama kurs adları, öğrenme hedefleri ve mevcut derslerin başlıkları üzerinden yapılır.</p>
    </div>
    <p className="explorer-count" aria-live="polite">{matched.length} öğrenme yolu gösteriliyor.
      {query.trim()?" Eşleşen dersler ilgili kursun altında listelenir.":""}</p>
    <h2 className="sr-only">Kurslar</h2>
    {matched.length?<ol className="path-index">{matched.map(path=>
      <li key={path.id}><LearningPathCard path={path} index={learningPaths.findIndex(p=>p.id===path.id)}/></li>)}</ol>:
      <div className="explorer-empty" role="status"><strong>Eşleşen kurs veya ders bulunamadı.</strong>
        <p>Henüz yayımlanmamış teknolojiler için sonuç uydurmuyoruz. Başka bir kavram ara.</p>
        <button type="button" className="ui-button ui-button-secondary" onClick={()=>setQuery("")}>Tüm kursları göster</button>
      </div>}
  </div>;
}
