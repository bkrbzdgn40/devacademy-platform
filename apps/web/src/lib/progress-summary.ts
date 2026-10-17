export type ProgressLesson = { lessonId: string; completedAt: string | null; lastViewedAt: string };
export type ProgressAttempt = { exerciseId: string; lessonId: string; correct: boolean; attemptedAt: string };
export function summarizeProgress(totalLessons: number, lessons: ProgressLesson[], attempts: ProgressAttempt[]) {
  const total = Math.max(0, totalLessons);
  const started = Math.min(new Set(lessons.map((x) => x.lessonId)).size,total);
  const completed = Math.min(new Set(lessons.filter(x=>x.completedAt).map(x=>x.lessonId)).size,total);
  const recentCorrectCount=attempts.filter(x=>x.correct).length;
  return {total,started,completed,percent:total?Math.round(100*completed/total):0,
    recentAttemptCount:attempts.length,recentCorrectCount,
    recentCorrectPercent:attempts.length?Math.round(100*recentCorrectCount/attempts.length):null};
}
