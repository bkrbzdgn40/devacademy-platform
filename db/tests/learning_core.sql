-- Integration tests execute against a disposable PostgreSQL 16 instance only.
\set ON_ERROR_STOP on
BEGIN;

DO $verify$
DECLARE
  learner uuid;
  foreign_id uuid := gen_random_uuid();
  unexpected_success boolean;
  expected_failure boolean;
BEGIN
  INSERT INTO learner_accounts DEFAULT VALUES RETURNING id INTO learner;
  INSERT INTO learning_attempts
    (learner_id, lesson_id, exercise_id, exercise_revision, selected_option_id, is_correct)
  VALUES (learner, 'lesson.javascript.let-const', 'js.binding.increment', 1, 'b', true);
  INSERT INTO lesson_progress (learner_id, lesson_id)
  VALUES (learner, 'lesson.javascript.let-const');

  IF (SELECT count(*) FROM learning_attempts WHERE learner_id=learner) != 1 THEN
    RAISE EXCEPTION 'attempt insert did not persist';
  END IF;
  -- A learner can revisit a completed lesson without losing their completion timestamp.
  UPDATE lesson_progress SET completed_at=now() WHERE learner_id=learner;
  UPDATE lesson_progress SET last_viewed_at=now() + interval '1 day' WHERE learner_id=learner;
  IF (SELECT count(*) FROM lesson_progress WHERE learner_id=learner) != 1 THEN
    RAISE EXCEPTION 'progress insert did not persist';
  END IF;

  expected_failure := false;
  BEGIN
    INSERT INTO learning_attempts (learner_id, lesson_id, exercise_id, exercise_revision, selected_option_id, is_correct)
    VALUES (learner, 'lesson.javascript.let-const', 'js.binding.increment', 0, 'b', true);
  EXCEPTION WHEN check_violation THEN expected_failure := true;
  END;
  IF NOT expected_failure THEN RAISE EXCEPTION 'zero revision was accepted'; END IF;

  expected_failure := false;
  BEGIN
    INSERT INTO learning_attempts (learner_id, lesson_id, exercise_id, exercise_revision, selected_option_id, is_correct)
    VALUES (foreign_id, 'lesson.javascript.let-const', 'js.binding.increment', 1, 'b', true);
  EXCEPTION WHEN foreign_key_violation THEN expected_failure := true;
  END;
  IF NOT expected_failure THEN RAISE EXCEPTION 'unknown learner was accepted'; END IF;

  expected_failure := false;
  BEGIN
    INSERT INTO lesson_progress (learner_id, lesson_id)
    VALUES (learner, 'lesson.javascript.let-const');
  EXCEPTION WHEN unique_violation THEN expected_failure := true;
  END;
  IF NOT expected_failure THEN RAISE EXCEPTION 'duplicate progress was accepted'; END IF;

  DELETE FROM learner_accounts WHERE id=learner;
  IF EXISTS (SELECT 1 FROM learning_attempts WHERE learner_id=learner) THEN
    RAISE EXCEPTION 'attempts did not cascade-delete';
  END IF;
  IF EXISTS (SELECT 1 FROM lesson_progress WHERE learner_id=learner) THEN
    RAISE EXCEPTION 'progress did not cascade-delete';
  END IF;
  RAISE NOTICE 'Learning schema constraints, attempt insertion and deletion cascade PASS';
END;
$verify$;

ROLLBACK;
