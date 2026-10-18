import { database, transaction } from "./db.mjs";
import lessons from "../data/lessons.json" with { type: "json" };
import questions from "../data/questions.json" with { type: "json" };
import {nextReview} from "./review-algorithm.mjs";

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
    // Lock one learner+question while updating the spaced review schedule.
    // The row is inserted first to avoid a race between two grading requests.
    await client.query(`
      INSERT INTO learning_review_schedule
        (learner_id,exercise_id,lesson_id,stage,lapses,attempts,due_at,last_answer_correct)
      VALUES($1,$2,$3,0,0,0,now(),false)
      ON CONFLICT(learner_id,exercise_id) DO NOTHING
    `,[learnerId,grade.questionId,lessonId]);
    const existing=await client.query(`
      SELECT stage,lapses,attempts,due_at AS "dueAt"
      FROM learning_review_schedule
      WHERE learner_id=$1 AND exercise_id=$2 FOR UPDATE
    `,[learnerId,grade.questionId]);
    const item=existing.rows[0];
    const next=nextReview(item,grade.correct);
    await client.query(`
      UPDATE learning_review_schedule SET stage=$3,lapses=$4,attempts=$5,
        due_at=$6,last_answer_correct=$7,updated_at=now()
      WHERE learner_id=$1 AND exercise_id=$2
    `,[learnerId,grade.questionId,next.stage,next.lapses,next.attempts,next.dueAt,grade.correct]);
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
  const [due,stats]=await Promise.all([
    database().query(`
      SELECT exercise_id AS "exerciseId",lesson_id AS "lessonId",due_at AS "dueAt",
        stage,lapses
      FROM learning_review_schedule
      WHERE learner_id=$1 AND due_at<=now()
      ORDER BY due_at,exercise_id LIMIT 12
    `,[learnerId]),
    database().query(`
      SELECT COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE due_at<=now())::int AS due
      FROM learning_review_schedule WHERE learner_id=$1
    `,[learnerId])
  ]);
  const transfer=await database().query(`
    SELECT COUNT(*) FILTER (WHERE stage=0 AND passed_at IS NOT NULL)::int AS first,
      COUNT(*) FILTER (WHERE stage=1 AND passed_at IS NOT NULL)::int AS retained
    FROM learning_transfer_trials WHERE learner_id=$1
  `,[learnerId]);
  return { lessons:progress.rows,recentAttempts:attempts.rows,
    reviewDue:due.rows,reviewSummary:stats.rows[0],transferSummary:transfer.rows[0] };
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
