import lessonsJson from "@/data/lessons.json";
import questionsJson from "@/data/questions.json";

export type Lesson = (typeof lessonsJson)[number];
export type PublicQuestion = (typeof questionsJson)[number];
export const lessons: readonly Lesson[] = lessonsJson;
export const questions: readonly PublicQuestion[] = questionsJson;
export const findLesson = (slug: string): Lesson | undefined => lessons.find((lesson) => lesson.slug === slug);
export const questionsForLesson = (lesson: Lesson): PublicQuestion[] => lesson.questionIds.map((id) => {
  const question = questions.find((item) => item.id === id);
  if (!question) throw new Error(`Missing question: ${id}`);
  return question;
});
