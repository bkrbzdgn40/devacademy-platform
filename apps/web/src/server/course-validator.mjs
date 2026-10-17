// Pure curriculum contract: safe to validate untrusted content descriptions without executing examples.
const name = (value)=>typeof value==="string" && value.trim().length>0;
const unique = (values)=>new Set(values).size===values.length;
const ids = /^[-a-z0-9.]+$/;
function fail(message){throw new Error("CURRICULUM_INVALID: "+message);}

export function validateCourseCatalog({courses,lessons,questions,catalog,answerKeyIds}) {
  if(!Array.isArray(courses)||!Array.isArray(lessons)||!Array.isArray(questions)||
     !Array.isArray(catalog)||!Array.isArray(answerKeyIds))fail("input collections");
  const langs=new Set(catalog.filter(c=>c.kind==="language").map(c=>c.id));
  if(!unique(courses.map(c=>c.id))||!unique(courses.map(c=>c.slug)))fail("duplicate course");
  if(!unique(lessons.map(l=>l.id)))fail("duplicate lesson ID");
  if(!unique(questions.map(q=>q.id)))fail("duplicate question ID");
  if(!unique(answerKeyIds)||!unique(questions.map(q=>q.id).concat([]))||
    answerKeyIds.length!==questions.length ||
    answerKeyIds.some(id=>!questions.some(q=>q.id===id)))fail("private answer key coverage");
  const byLesson=new Map(lessons.map(l=>[l.id,l]));
  const byQuestion=new Map(questions.map(q=>[q.id,q]));
  const lessonOwner=new Map();
  for(const course of courses){
    if(!name(course.id)||!course.id.startsWith("course.")||!ids.test(course.id)||
       !name(course.slug)||!ids.test(course.slug)||
       !name(course.title)||!name(course.summary)||course.locale!=="tr"||
       !langs.has(course.languageId)||!Array.isArray(course.lessonIds)||
       course.lessonIds.length<1||!unique(course.lessonIds)||
       !["java","javascript","python","plain"].includes(course.editorLanguage)||
       course.capabilities?.editor!==true ||
       course.capabilities?.run!==false ||course.capabilities?.codeAssessment!==false)fail("invalid course "+course.id);
    if(course.editorLanguage!=="javascript" && course.runtimeId!==null)fail("Unsupported runtime advertised");
    if(course.editorLanguage==="javascript" && course.runtimeId!=="nodejs-24")fail("unknown JS runtime");
    const localSlugs=[];
    for(let i=0;i<course.lessonIds.length;i++){
      const id=course.lessonIds[i],lesson=byLesson.get(id);
      if(!lesson||lessonOwner.has(id))fail("missing or reused lesson "+id);
      lessonOwner.set(id,course.id);
      if(!name(lesson.slug)||!ids.test(lesson.slug)||!name(lesson.title)||
         !name(lesson.objective)||!name(lesson.summary)||!name(lesson.explanation)||
         !name(lesson.code)||!Number.isInteger(lesson.durationMinutes)||lesson.durationMinutes<1||
         !Array.isArray(lesson.takeaways)||lesson.takeaways.length<1||
         !Array.isArray(lesson.questionIds)||lesson.questionIds.length<1||
         !unique(lesson.questionIds)||!Array.isArray(lesson.prerequisites))fail("invalid lesson "+id);
      localSlugs.push(lesson.slug);
      for(const prereq of lesson.prerequisites){
        const position=course.lessonIds.indexOf(prereq);
        if(position<0||position>=i)fail("missing, future or cyclic prerequisite "+prereq);
      }
      for(const qid of lesson.questionIds){
        const q=byQuestion.get(qid);
        if(!q||q.lessonId!==id||!name(q.prompt)||!name(q.code)||
           !Array.isArray(q.options)||q.options.length<2||!unique(q.options.map(x=>x.id))||
           q.options.some(x=>!name(x.id)||!name(x.text))||
           "correctOptionId" in q||"explanation" in q)fail("invalid public question "+qid);
      }
    }
    if(!unique(localSlugs))fail("duplicate lesson slug in "+course.id);
  }
  if(lessonOwner.size!==lessons.length)fail("unassigned lesson");
  const linkedQuestions=lessons.flatMap(lesson=>lesson.questionIds);
  if(!unique(linkedQuestions)||linkedQuestions.length!==questions.length)fail("orphan or duplicate question");
  return {courseCount:courses.length,lessonCount:lessons.length,questionCount:questions.length};
}
