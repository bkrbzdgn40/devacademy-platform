\set ON_ERROR_STOP on
BEGIN;
DO $check$
DECLARE a uuid; b uuid; job uuid; failure boolean:=false;
BEGIN
  INSERT INTO learner_accounts DEFAULT VALUES RETURNING id INTO a;
  INSERT INTO learner_accounts DEFAULT VALUES RETURNING id INTO b;
  INSERT INTO execution_jobs(learner_id,request_id,source_code) VALUES
    (a,gen_random_uuid(),'console.log(42)') RETURNING id INTO job;
  IF NOT EXISTS (SELECT 1 FROM execution_jobs WHERE id=job AND status='queued') THEN
    RAISE EXCEPTION 'enqueue state missing';
  END IF;
  BEGIN
    INSERT INTO execution_jobs(learner_id,request_id,source_code) VALUES
      (a,gen_random_uuid(),repeat('x',8193));
  EXCEPTION WHEN check_violation THEN failure:=true;
  END;
  IF NOT failure THEN RAISE EXCEPTION 'oversize source accepted'; END IF;
  failure:=false;
  BEGIN
    UPDATE execution_jobs SET status='running' WHERE id=job;
  EXCEPTION WHEN check_violation THEN failure:=true;
  END;
  IF NOT failure THEN RAISE EXCEPTION 'running without lease accepted'; END IF;
  UPDATE execution_jobs SET status='running',lease_deadline=now()+interval '30 sec',
    lease_token_hash=repeat('f',64),started_at=now() WHERE id=job;
  UPDATE execution_jobs SET status='completed',source_code='',lease_deadline=NULL,
    lease_token_hash=NULL,completed_at=now() WHERE id=job;
  IF (SELECT source_code FROM execution_jobs WHERE id=job) <> '' THEN
    RAISE EXCEPTION 'source code not cleared';
  END IF;
  DELETE FROM learner_accounts WHERE id=a;
  IF EXISTS (SELECT 1 FROM execution_jobs WHERE id=job) THEN
    RAISE EXCEPTION 'account deletion left execution job behind';
  END IF;
  IF (SELECT count(*) FROM learner_accounts WHERE id=b)<>1 THEN
    RAISE EXCEPTION 'unrelated account deleted';
  END IF;
  RAISE NOTICE 'Execution queue constraints, lease and user deletion PASS';
END;
$check$;
ROLLBACK;
