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
          placeholder="Örn. polymorphism, döngüler, Promise"
          value={query} onChange={e=>setQuery(e.target.value)} />
        {query&&<button type="button" onClick={()=>setQuery("")}>Temizle</button>}
      </div>
      <p>Arama kurs adları, öğrenme hedefleri ve mevcut derslerin başlıkları üzerinden yapılır.</p>
    </div>
    <p className="explorer-count" aria-live="polite">{matched.length} öğrenme yolu gösteriliyor.
      {query.trim()?" Eşleşen dersler kartların içinde listelenir.":""}</p>
    {matched.length?<div className="path-grid">{matched.map(path=>
      <LearningPathCard key={path.id} path={path}/>)}</div>:
      <div className="explorer-empty" role="status"><strong>Eşleşen kurs veya ders bulunamadı.</strong>
        <p>Henüz yayımlanmamış teknolojiler için sonuç uydurmuyoruz. Başka bir kavram ara.</p>
        <button type="button" className="ui-button ui-button-secondary" onClick={()=>setQuery("")}>Tüm kursları göster</button>
      </div>}
  </div>;
}
