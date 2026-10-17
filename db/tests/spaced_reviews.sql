\set ON_ERROR_STOP on
BEGIN;
DO $check$
DECLARE a uuid; b uuid; exercise varchar(128):='python.variables.division';
BEGIN
 INSERT INTO learner_accounts DEFAULT VALUES RETURNING id INTO a;
 INSERT INTO learner_accounts DEFAULT VALUES RETURNING id INTO b;
 INSERT INTO learning_review_schedule(learner_id,exercise_id,lesson_id,stage,lapses,attempts,due_at,last_answer_correct)
 VALUES(a,exercise,'lesson.python.variables',0,1,1,now()-interval '1 minute',false);
 IF (SELECT count(*) FROM learning_review_schedule WHERE learner_id=a AND due_at<=now())<>1
 THEN RAISE EXCEPTION 'due item not found'; END IF;
 IF (SELECT count(*) FROM learning_review_schedule WHERE learner_id=b)<>0
 THEN RAISE EXCEPTION 'review leaked to another learner'; END IF;
 DELETE FROM learner_accounts WHERE id=a;
 IF (SELECT count(*) FROM learning_review_schedule WHERE learner_id=a)<>0
 THEN RAISE EXCEPTION 'review survived account deletion'; END IF;
 DELETE FROM learner_accounts WHERE id=b;
 RAISE NOTICE 'M7 review owner and cascading deletion PASS';
END $check$;
ROLLBACK;
