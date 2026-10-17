\set ON_ERROR_STOP on
BEGIN;
DO $verify$
DECLARE
  first_id uuid;
  second_id uuid;
  verified boolean;
BEGIN
  INSERT INTO learner_accounts DEFAULT VALUES RETURNING id INTO first_id;
  INSERT INTO learner_accounts DEFAULT VALUES RETURNING id INTO second_id;
  INSERT INTO learner_credentials (learner_id,username,password_hash)
  VALUES (first_id,'tester_a','scrypt$test'),(second_id,'tester_b','scrypt$test');
  INSERT INTO learner_sessions (token_hash,learner_id,expires_at)
  VALUES (repeat('a',64),first_id,now()+interval '1 day'),
         (repeat('b',64),second_id,now()+interval '1 day');
  INSERT INTO learning_attempts (learner_id,lesson_id,exercise_id,exercise_revision,selected_option_id,is_correct)
  VALUES (first_id,'lesson.javascript.let-const','js.binding.increment',1,'b',true);

  verified := false;
  BEGIN
    INSERT INTO learner_credentials (learner_id,username,password_hash) VALUES (gen_random_uuid(),'tester_c','scrypt$test');
  EXCEPTION WHEN foreign_key_violation THEN verified:=true;
  END;
  IF NOT verified THEN RAISE EXCEPTION 'unlinked identity accepted'; END IF;

  verified := false;
  BEGIN
    UPDATE learner_credentials SET username='tester_a' WHERE learner_id=second_id;
  EXCEPTION WHEN unique_violation THEN verified:=true;
  END;
  IF NOT verified THEN RAISE EXCEPTION 'duplicate username accepted'; END IF;

  verified := false;
  BEGIN
    INSERT INTO learner_sessions(token_hash,learner_id,expires_at) VALUES (repeat('x',64),first_id,now()+interval '1 day');
  EXCEPTION WHEN check_violation THEN verified:=true;
  END;
  IF NOT verified THEN RAISE EXCEPTION 'invalid token hash accepted'; END IF;

  DELETE FROM learner_accounts WHERE id=first_id;
  IF EXISTS (SELECT 1 FROM learner_credentials WHERE learner_id=first_id) OR
     EXISTS (SELECT 1 FROM learner_sessions WHERE learner_id=first_id) OR
     EXISTS (SELECT 1 FROM learning_attempts WHERE learner_id=first_id)
  THEN RAISE EXCEPTION 'cascade deletion failed'; END IF;
  IF (SELECT COUNT(*) FROM learner_sessions WHERE learner_id=second_id) <> 1 THEN
    RAISE EXCEPTION 'other learner session was affected'; END IF;
  RAISE NOTICE 'Auth FK, uniqueness, validation and account deletion isolation PASS';
END;
$verify$;
ROLLBACK;
