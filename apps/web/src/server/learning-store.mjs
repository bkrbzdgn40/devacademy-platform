import { database, transaction } from "./db.mjs";
import lessons from "../data/lessons.json" with { type: "json" };
import questions from "../data/questions.json" with { type: "json" };

const byId = new Map(lessons.map((lesson) => [lesson.id, lesson]));
const exerciseLesson = new Map(questions.map((q) => [q.id, q.lessonId]));
export function isKnownLesson(lessonId) { return typeof lessonId === "string" && byId.has(lessonId); }
export function revisionForExercise(exerciseId) { return exerciseLesson.has(exerciseId) ? 1 : null; }

export async function recordAttempt(learnerId, grade, selectedOptionId) {
  const lessonId = exerciseLesson.get(grade.questionId);
  if (!lessonId) throw new Error("UNKNOWN_EXERCISE");
  return transaction(async (client) => {
    await client.query(`
      INSERT INTO learning_attempts(learner_id,lesson_id,exercise_id,exercise_revision,selected_option_id,is_correct,evaluator_version)
      VALUES($1,$2,$3,1,$4,$5,1)
    `, [learnerId, lessonId, grade.questionId, selectedOptionId, grade.correct]);
    await client.query(`
      INSERT INTO lesson_progress(learner_id,lesson_id,last_viewed_at) VALUES($1,$2,now())
      ON CONFLICT (learner_id,lesson_id) DO UPDATE SET last_viewed_at=now()
    `, [learnerId, lessonId]);
    return true;
  });
}

export async function getLearningProgress(learnerId) {
  const [progress, attempts] = await Promise.all([
    database().query(`SELECT lesson_id AS "lessonId",last_viewed_at AS "lastViewedAt",completed_at AS "completedAt"
      FROM lesson_progress WHERE learner_id=$1 ORDER BY last_viewed_at DESC LIMIT 200`, [learnerId]),
    database().query(`SELECT lesson_id AS "lessonId",exercise_id AS "exerciseId",is_correct AS "correct",attempted_at AS "attemptedAt"
      FROM learning_attempts WHERE learner_id=$1 ORDER BY attempted_at DESC LIMIT 50`, [learnerId]),
  ]);
  return { lessons: progress.rows, recentAttempts: attempts.rows };
}

export async function updateLessonProgress(learnerId, lessonId, operation) {
  const lesson = byId.get(lessonId);
  if (!lesson || !["view","complete"].includes(operation)) return { status: "invalid" };
  if (operation === "view") {
    await database().query(`
      INSERT INTO lesson_progress(learner_id,lesson_id,last_viewed_at) VALUES($1,$2,now())
      ON CONFLICT (learner_id,lesson_id) DO UPDATE SET last_viewed_at=now()
    `, [learnerId, lessonId]);
    return { status: "saved" };
  }
  return transaction(async(client) => {
    const graded = await client.query(`
      SELECT COUNT(DISTINCT exercise_id)::int AS solved
      FROM learning_attempts
      WHERE learner_id=$1 AND lesson_id=$2 AND exercise_id=ANY($3::text[])
        AND exercise_revision=1 AND is_correct=true
    `,[learnerId, lessonId, lesson.questionIds]);
    if (graded.rows[0].solved !== lesson.questionIds.length) return { status: "incomplete" };
    await client.query(`
      INSERT INTO lesson_progress(learner_id,lesson_id,last_viewed_at,completed_at)
      VALUES($1,$2,now(),now())
      ON CONFLICT (learner_id,lesson_id) DO UPDATE SET last_viewed_at=now(),completed_at=COALESCE(lesson_progress.completed_at,now())
    `,[learnerId,lessonId]);
    return { status: "completed" };
  });
}
