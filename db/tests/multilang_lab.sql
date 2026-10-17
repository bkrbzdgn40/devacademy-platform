\set ON_ERROR_STOP on
BEGIN;
DO $verify$
DECLARE user_id uuid;
DECLARE invalid boolean;
BEGIN
 INSERT INTO learner_accounts DEFAULT VALUES RETURNING id INTO user_id;
 INSERT INTO execution_jobs(learner_id,request_id,source_code,mode,exercise_id,exercise_revision,runtime_id)
 VALUES(user_id,gen_random_uuid(),'def sum_even(x): return 0','assess','python.sum-even',1,'python-3.12');
 INSERT INTO execution_jobs(learner_id,request_id,source_code,mode,exercise_id,exercise_revision,runtime_id)
 VALUES(user_id,gen_random_uuid(),'class Solution{}','assess','java.clamp',1,'java-21');
 invalid:=false;
 BEGIN
   INSERT INTO execution_jobs(learner_id,request_id,source_code,mode,runtime_id)
   VALUES(user_id,gen_random_uuid(),'malicious','run','java-21');
 EXCEPTION WHEN check_violation THEN invalid:=true;
 END;
 IF NOT invalid THEN RAISE EXCEPTION 'non-JS raw run unexpectedly allowed'; END IF;
 IF (SELECT count(*) FROM execution_jobs WHERE learner_id=user_id)<>2
 THEN RAISE EXCEPTION 'multilang jobs were not accepted'; END IF;
 DELETE FROM learner_accounts WHERE id=user_id;
 IF (SELECT count(*) FROM execution_jobs WHERE learner_id=user_id)<>0
 THEN RAISE EXCEPTION 'multilang jobs survived deletion'; END IF;
 RAISE NOTICE 'M7.2 runtime-mode constraints and cascading deletion PASS';
END $verify$;
ROLLBACK;
