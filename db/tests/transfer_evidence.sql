\set ON_ERROR_STOP on
BEGIN;
DO $verify$
DECLARE
  owner_a uuid;
  owner_b uuid;
  invalid boolean;
BEGIN
  INSERT INTO learner_accounts DEFAULT VALUES RETURNING id INTO owner_a;
  INSERT INTO learner_accounts DEFAULT VALUES RETURNING id INTO owner_b;
  INSERT INTO learning_transfer_trials (learner_id,lesson_id,stage,variant_seed)
    VALUES(owner_a,'lesson.javascript.let-const',0,12345);
  invalid:=false;
  BEGIN
    INSERT INTO learning_transfer_trials(learner_id,lesson_id,stage,variant_seed)
      VALUES(owner_a,'lesson.javascript.let-const',2,99);
  EXCEPTION WHEN check_violation THEN invalid:=true;
  END;
  IF NOT invalid THEN RAISE EXCEPTION 'invalid evidence stage accepted'; END IF;
  invalid:=false;
  BEGIN
    INSERT INTO learning_transfer_trials(learner_id,lesson_id,stage,variant_seed)
      VALUES(owner_a,'lesson.javascript.let-const',0,99);
  EXCEPTION WHEN unique_violation THEN invalid:=true;
  END;
  IF NOT invalid THEN RAISE EXCEPTION 'duplicate evidence accepted'; END IF;
  DELETE FROM learner_accounts WHERE id=owner_a;
  IF EXISTS(SELECT 1 FROM learning_transfer_trials WHERE learner_id=owner_a)
    THEN RAISE EXCEPTION 'evidence orphaned after owner deletion'; END IF;
  IF EXISTS(SELECT 1 FROM learning_transfer_trials WHERE learner_id=owner_b)
    THEN RAISE EXCEPTION 'other owner received evidence'; END IF;
  RAISE NOTICE 'M8.1 transfer FK/cascade/uniqueness and range checks PASS';
END;
$verify$;
ROLLBACK;
