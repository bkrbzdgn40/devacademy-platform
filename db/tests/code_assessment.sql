\set ON_ERROR_STOP on
BEGIN;
DO $verify$
DECLARE owner uuid; job uuid; invalid boolean;
BEGIN
  INSERT INTO learner_accounts DEFAULT VALUES RETURNING id INTO owner;
  invalid:=false;
  BEGIN
    INSERT INTO execution_jobs(learner_id,request_id,mode,source_code)
    VALUES(owner,gen_random_uuid(),'assess','function f(){}');
  EXCEPTION WHEN check_violation THEN invalid:=true;
  END;
  IF NOT invalid THEN RAISE EXCEPTION 'assessment with no exercise ID accepted'; END IF;
  INSERT INTO execution_jobs(learner_id,request_id,mode,exercise_id,exercise_revision,source_code)
  VALUES(owner,gen_random_uuid(),'assess','js.sum-even',1,'function sumEven(n){return 1}')
  RETURNING id INTO job;
  UPDATE execution_jobs SET status='running',started_at=now(),lease_token_hash=repeat('a',64),
    lease_deadline=now()+interval '30 seconds' WHERE id=job;
  UPDATE execution_jobs SET status='completed',source_code='',lease_token_hash=NULL,lease_deadline=NULL,
    completed_at=now(),
    assessment='{"verdict":"failed","passed":1,"total":5,"publicCases":[{"label":"Example","passed":true}]}'::jsonb WHERE id=job;
  IF NOT EXISTS (SELECT 1 FROM execution_jobs WHERE id=job AND mode='assess'
    AND source_code='' AND assessment->>'verdict'='failed')
  THEN RAISE EXCEPTION 'assessment was not stored with scrubbed source'; END IF;
  DELETE FROM learner_accounts WHERE id=owner;
  IF EXISTS(SELECT 1 FROM execution_jobs WHERE id=job) THEN RAISE EXCEPTION 'account deletion left assessment data'; END IF;
  RAISE NOTICE 'M4 assessment SQL constraints and owner deletion PASS';
END;
$verify$;
ROLLBACK;
