// Course Engine v1.1: validated, review-gated curriculum publication.
// This module never executes course snippets or learner code.
import { validateCourseCatalog } from "../apps/web/src/server/course-validator.mjs";

const slugPattern=/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;
const forbiddenPublicKeys=new Set(["correctOptionId","hiddenCases","expectedOutput","answerKey","answers","secret","token","password"]);
const placeholder="[[DRAFT]]";
const fail=message=>{throw new Error("COURSE_AUTHORING_INVALID: "+message);};
export const validSlug=value=>typeof value==="string" && value.length<=70 && slugPattern.test(value);

const toId=value=>value.replaceAll("-",".");
function isCleanPublicData(input){
  if(Array.isArray(input))return input.every(isCleanPublicData);
  if(input && typeof input==="object"){
    return Object.entries(input).every(([key,value])=>!forbiddenPublicKeys.has(key) && isCleanPublicData(value));
  }
  return true;
}
function sameIds(one,two){
  return one.length===two.length && new Set(one).size===one.length &&
    one.every(x=>two.includes(x));
}

export function createDraft({languageSlug,courseSlug,title,catalog}){
  if(!validSlug(languageSlug)||!validSlug(courseSlug))fail("language/course slug must be lowercase kebab-case");
  if(typeof title!=="string"||!title.trim()||title.length>120)fail("course title required");
  if(!Array.isArray(catalog))fail("catalog required");
  const id="language."+toId(languageSlug);
  const match=catalog.find(x=>x.id===id);
  if(match && (match.kind!=="language"||match.slug!==languageSlug))fail("language namespace collision");
  const entry=match?null:{
    id,slug:languageSlug,kind:"language",name:languageSlug.charAt(0).toUpperCase()+languageSlug.slice(1),
    summary:placeholder+" Dil açıklaması",level:"Başlangıç",runnable:false,tags:[]
  };
  const lessonId="lesson."+toId(languageSlug)+"."+toId(courseSlug)+".intro";
  const questionId=toId(languageSlug)+"."+toId(courseSlug)+".intro.prediction";
  const pub={
    language:entry,
    course:{
      id:"course."+toId(languageSlug)+"."+toId(courseSlug),
      slug:courseSlug,languageId:id,title:title.trim(),
      summary:placeholder+" Kurs açıklaması",level:"Başlangıç",locale:"tr",
      editorLanguage:languageSlug==="java"?"java":languageSlug==="javascript"?"javascript":languageSlug==="python"?"python":"plain",
      runtimeId:languageSlug==="javascript"?"nodejs-24":null,
      capabilities:{editor:true,run:false,codeAssessment:false},
      lessonIds:[lessonId]
    },
    lessons:[{
      id:lessonId,slug:"giris",title:placeholder+" İlk ders",
      level:"Başlangıç",durationMinutes:8,
      objective:placeholder+" Ölçülebilir ders hedefi",
      summary:placeholder+" Ders özeti",
      explanation:placeholder+" Dersin doğru teknik açıklaması",
      code:placeholder+" İncelenmiş dil örneği",
      takeaways:[placeholder+" Doğrulanmış ana fikir"],
      questionIds:[questionId],prerequisites:[]
    }],
    questions:[{
      id:questionId,lessonId,
      prompt:placeholder+" Çıktı sorusu",code:placeholder+" Gözden geçirilmiş örnek kod",
      options:[{id:"a",text:placeholder+" Olası çıktı A"},{id:"b",text:placeholder+" Olası çıktı B"}]
    }]
  };
  const priv={
    review:{contentReviewed:false,codeExamplesVerified:false},
    answers:{[questionId]:{optionId:"a",explanation:placeholder+" Doğru yanıtın teknik açıklaması"}}
  };
  return {publicDraft:pub,privateDraft:priv};
}

export function preparePublication(snapshot,publicDraft,privateDraft){
  if(!snapshot||!publicDraft||!privateDraft)fail("missing source data");
  const {courses,lessons,questions,catalog,answers}=snapshot;
  if(![courses,lessons,questions,catalog].every(Array.isArray) ||
     !answers || typeof answers!=="object" || Array.isArray(answers))fail("invalid existing course registry");
  if(!sameIds(Object.keys(publicDraft).sort(),["language","course","lessons","questions"].sort()))
    fail("unexpected public draft fields");
  if(!sameIds(Object.keys(privateDraft).sort(),["review","answers"].sort()))
    fail("unexpected private draft fields");
  if(privateDraft.review?.contentReviewed!==true || privateDraft.review?.codeExamplesVerified!==true)
    fail("content and examples must be explicitly reviewed");
  if(!isCleanPublicData(publicDraft))fail("private answer or solution details inside public course data");
  const content=JSON.stringify(publicDraft);
  if(content.includes(placeholder)||JSON.stringify(privateDraft.answers).includes(placeholder))
    fail("replace every draft placeholder before publishing");
  const course=publicDraft.course;
  if(!course || !validSlug(course.slug)||!Array.isArray(publicDraft.lessons) ||
      !Array.isArray(publicDraft.questions)||publicDraft.lessons.length<1 ||
      publicDraft.questions.length<1)fail("missing course, lessons or questions");
  // Runtime capability cannot be enabled by content tooling.
  if(course.capabilities?.run!==false ||course.capabilities?.codeAssessment!==false)
    fail("code execution and grading must remain disabled");
  if(courses.some(item=>item.id===course.id ||item.slug===course.slug))
    fail("course ID or slug already exists");
  let nextCatalog=[...catalog];
  if(publicDraft.language!==null){
    const lang=publicDraft.language;
    if(!lang||lang.kind!=="language"||!validSlug(lang.slug)||
       lang.id!=="language."+toId(lang.slug)||lang.runnable!==false||
       catalog.some(c=>c.id===lang.id ||(c.kind==="language"&&c.slug===lang.slug)))
      fail("invalid or duplicate new language");
    nextCatalog.push(lang);
  }else if(!catalog.some(c=>c.id===course.languageId&&c.kind==="language"))
    fail("language missing from catalog");
  if(publicDraft.language && course.languageId!==publicDraft.language.id)
    fail("course/language ID mismatch");
  const newQuestions=publicDraft.questions;
  const keyIds=Object.keys(privateDraft.answers??{});
  if(!sameIds(newQuestions.map(q=>q.id),keyIds))fail("answer keys do not cover every new question");
  for(const question of newQuestions){
    const key=privateDraft.answers[question.id];
    if(!key||typeof key.optionId!=="string" ||
       !question.options?.some(opt=>opt.id===key.optionId)||
       typeof key.explanation!=="string"||!key.explanation.trim()||key.explanation.length>4000)
      fail("invalid private answer key for "+question.id);
  }
  const next={
    catalog:nextCatalog,
    courses:[...courses,course],
    lessons:[...lessons,...publicDraft.lessons],
    questions:[...questions,...newQuestions],
    answers:{...answers,...privateDraft.answers}
  };
  // Validate entire graph before proposing any file mutation.
  validateCourseCatalog({
    catalog:next.catalog,courses:next.courses,lessons:next.lessons,
    questions:next.questions,answerKeyIds:Object.keys(next.answers)
  });
  // Check all current and new answers against the exact question option choices.
  for(const question of next.questions){
    const key=next.answers[question.id];
    if(!key ||!question.options.some(option=>option.id===key.optionId) ||
       typeof key.explanation!=="string"||!key.explanation.trim())
      fail("stale or invalid key "+question.id);
  }
  return next;
}
