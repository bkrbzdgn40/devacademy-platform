import test from "node:test";
import assert from "node:assert/strict";
import { randomBytes, createHash } from "node:crypto";
import { database } from "../src/server/db.mjs";
import { createAccount, authenticate, issueSession, currentLearner, deleteLearnerAccount, revokeSession, hashPassword, verifyPassword, normalizeUsername } from "../src/server/auth.mjs";
import { cleanupAuthState } from "../src/server/auth-maintenance.mjs";
import { recordAttempt, getLearningProgress, updateLessonProgress } from "../src/server/learning-store.mjs";
import { gradeSubmission } from "../src/server/grade.ts";
import { isSameOrigin } from "../src/server/http.mjs";

const password = "Correct-Horse-Battery-Staple-2026";
const namespace = randomBytes(5).toString("hex");
const userA = "alpha_" + namespace, userB = "beta_" + namespace;

test("auth, durable progress, authorization and cascade integration", async () => {
  assert.equal(normalizeUsername("  "+userA.toUpperCase()+"  "), userA);
  assert.equal(normalizeUsername("not valid!"), null);
  const passhash = await hashPassword(password);
  assert.equal(passhash.includes(password), false);
  assert.equal(await verifyPassword(password,passhash), true);
  assert.equal(await verifyPassword("not-the-password",passhash), false);

  const a = await createAccount(userA,password);
  assert.equal(a.status,"created");
  const duplicate = await createAccount(userA,password);
  assert.equal(duplicate.status,"conflict");
  const b = await createAccount(userB,password);
  assert.equal(b.status,"created");

  try {
    assert.equal((await authenticate(userA,"incorrect-password-long")).status,"invalid");
    assert.equal((await authenticate(userA,password)).status,"authenticated");
    const sessionA = await issueSession(a.learnerId);
    const sessionB = await issueSession(b.learnerId);
    const url = "http://localhost:3000/api/progress";
    const requestA = new Request(url,{headers:{cookie:"devacademy_session="+sessionA.token}});
    const requestB = new Request(url,{headers:{cookie:"devacademy_session="+sessionB.token}});
    assert.equal((await currentLearner(requestA)).learnerId,a.learnerId);
    assert.equal((await currentLearner(requestB)).learnerId,b.learnerId);
    assert.equal(await currentLearner(new Request(url,{headers:{cookie:"devacademy_session=abc"}})),null);
    assert.equal(isSameOrigin(new Request(url,{headers:{origin:"http://evil.example"}})),false);
    assert.equal(isSameOrigin(new Request(url,{headers:{origin:"http://localhost:3000"}})),true);

    const lessonId="lesson.javascript.let-const";
    assert.equal((await updateLessonProgress(a.learnerId,lessonId,"complete")).status,"incomplete");
    await updateLessonProgress(a.learnerId,lessonId,"view");
    const wrong=gradeSubmission({questionId:"js.binding.increment",optionId:"a"});
    assert.equal(wrong.status,"graded");
    await recordAttempt(a.learnerId,wrong,"a");
    assert.equal((await updateLessonProgress(a.learnerId,lessonId,"complete")).status,"incomplete");
    for(const [id,optionId] of [["js.binding.increment","b"],["js.binding.object","c"]]){
      const grade=gradeSubmission({questionId:id,optionId});
      assert.equal(grade.correct,true);
      await recordAttempt(a.learnerId,grade,optionId);
    }
    assert.equal((await updateLessonProgress(a.learnerId,lessonId,"complete")).status,"completed");
    const own=await getLearningProgress(a.learnerId);
    const other=await getLearningProgress(b.learnerId);
    assert.ok(own.lessons.some(x=>x.lessonId===lessonId&&x.completedAt));
    assert.equal(own.recentAttempts.length,3);
    assert.equal(other.lessons.length,0);
    assert.equal(other.recentAttempts.length,0);
    assert.equal(own.reviewSummary.total,2);
    assert.equal(other.reviewSummary.total,0);
    const savedReview=await database().query("SELECT stage,lapses,attempts FROM learning_review_schedule WHERE learner_id=$1 AND exercise_id='js.binding.increment'",[a.learnerId]);
    assert.equal(savedReview.rows[0].stage,1);
    assert.equal(savedReview.rows[0].lapses,1);
    assert.equal(savedReview.rows[0].attempts,2);
    assert.equal((await updateLessonProgress(b.learnerId,lessonId,"complete")).status,"incomplete");

    // Course Engine v1: Java learning follows identical owner-scoped progress rules.
    const javaLesson="lesson.java.variables";
    assert.equal((await updateLessonProgress(b.learnerId,javaLesson,"complete")).status,"incomplete");
    assert.equal((await updateLessonProgress(b.learnerId,javaLesson,"view")).status,"saved");
    for(const [id,choice] of [["java.variables.increment","b"],["java.variables.division","b"],["debug.java.variables","a"]]){
      const result=gradeSubmission({questionId:id,optionId:choice});
      assert.equal(result.status,"graded");
      assert.equal(result.correct,true);
      await recordAttempt(b.learnerId,result,choice);
    }
    assert.equal((await updateLessonProgress(b.learnerId,javaLesson,"complete")).status,"completed");
    const javaProgress=await getLearningProgress(b.learnerId);
    assert.ok(javaProgress.lessons.some(x=>x.lessonId===javaLesson && x.completedAt));
    assert.equal(javaProgress.recentAttempts.filter(x=>x.lessonId===javaLesson).length,3);
    assert.equal((await getLearningProgress(a.learnerId)).lessons.some(x=>x.lessonId===javaLesson),false);

    await revokeSession(requestA);
    assert.equal(await currentLearner(requestA),null);
    const fresh = await issueSession(a.learnerId);
    const requestFresh=new Request(url,{headers:{cookie:"devacademy_session="+fresh.token}});
    assert.ok(await currentLearner(requestFresh));
    assert.equal(await deleteLearnerAccount(a.learnerId,"incorrect-password-long"),false);
    assert.ok(await currentLearner(requestFresh));
    assert.equal(await deleteLearnerAccount(a.learnerId,password),true);
    assert.equal(await currentLearner(requestFresh),null);
    assert.equal((await database().query("SELECT count(*)::int AS n FROM learning_attempts WHERE learner_id=$1",[a.learnerId])).rows[0].n,0);
    assert.equal((await database().query("SELECT count(*)::int AS n FROM learner_sessions WHERE learner_id=$1",[a.learnerId])).rows[0].n,0);
    assert.equal((await database().query("SELECT count(*)::int AS n FROM learning_review_schedule WHERE learner_id=$1",[a.learnerId])).rows[0].n,0);
    assert.ok(await currentLearner(requestB),"another account is not deleted");
  } finally {
    await database().query("DELETE FROM learner_accounts WHERE id=ANY($1::uuid[])",[[a.learnerId,b.learnerId]]);
  }
});

test("login throttling is enforced at database layer", async () => {
  const username="throttle_" + randomBytes(4).toString("hex");
  for(let i=0;i<5;i++) assert.equal((await authenticate(username,password)).status,"invalid");
  assert.equal((await authenticate(username,password)).status,"limited");
  await database().query("DELETE FROM auth_attempt_limits WHERE key_hash=$1",[createHash("sha256").update("login:"+username).digest("hex")]);
});

test("registration quotas reject hostile traffic before account insertion", async()=>{
  const name="blocked_"+randomBytes(5).toString("hex");
  const perName=createHash("sha256").update("register:"+name).digest("hex");
  const global=createHash("sha256").update("register:global").digest("hex");
  await database().query("INSERT INTO auth_attempt_limits(key_hash,attempt_count,window_start) VALUES($1,5,now()) ON CONFLICT(key_hash) DO UPDATE SET attempt_count=5,window_start=now()",[perName]);
  try {
    assert.equal((await createAccount(name,password)).status,"limited");
    assert.equal((await database().query("SELECT 1 FROM learner_credentials WHERE username=$1",[name])).rowCount,0);
    await database().query("INSERT INTO auth_attempt_limits(key_hash,attempt_count,window_start) VALUES($1,120,now()) ON CONFLICT(key_hash) DO UPDATE SET attempt_count=120,window_start=now()",[global]);
    const different="global_"+randomBytes(5).toString("hex");
    assert.equal((await createAccount(different,password)).status,"limited");
    assert.equal((await database().query("SELECT 1 FROM learner_credentials WHERE username=$1",[different])).rowCount,0);
  } finally {
    await database().query("DELETE FROM auth_attempt_limits WHERE key_hash=ANY($1::char(64)[])",[[perName,global]]);
  }
});

test("retention dry run, bounded apply and live-session preservation", async()=>{
  const account=await createAccount("clean_"+randomBytes(5).toString("hex"),password);
  assert.equal(account.status,"created");
  const session=await issueSession(account.learnerId);
  const expired=["expired_s1","expired_s2"].map(s=>createHash("sha256").update(namespace+s).digest("hex"));
  const stale=["stale_l1","stale_l2"].map(s=>createHash("sha256").update(namespace+s).digest("hex"));
  const active=createHash("sha256").update(namespace+"active_l").digest("hex");
  try {
    for(const value of expired) await database().query(
      "INSERT INTO learner_sessions(token_hash,learner_id,created_at,expires_at) VALUES($1,$2,now()-interval '9 days',now()-interval '2 days')",[value,account.learnerId]);
    for(const value of stale)await database().query(
      "INSERT INTO auth_attempt_limits(key_hash,attempt_count,window_start) VALUES($1,1,now()-interval '2 days')",[value]);
    await database().query("INSERT INTO auth_attempt_limits(key_hash,attempt_count,window_start) VALUES($1,1,now())",[active]);
    assert.throws(()=>cleanupAuthState({batchSize:0}),RangeError);
    const dry=await cleanupAuthState();
    assert.equal(dry.applied,false);
    assert.ok(dry.expiredSessions>=2);
    assert.ok(dry.staleLimits>=2);
    assert.equal((await database().query("SELECT count(*)::int AS n FROM learner_sessions WHERE token_hash=ANY($1::char(64)[])",[expired])).rows[0].n,2);
    const first=await cleanupAuthState({apply:true,batchSize:1});
    assert.equal(first.expiredSessions,1);
    assert.equal(first.staleLimits,1);
    await cleanupAuthState({apply:true,batchSize:1000});
    assert.equal((await database().query("SELECT count(*)::int AS n FROM learner_sessions WHERE token_hash=ANY($1::char(64)[])",[expired])).rows[0].n,0);
    assert.equal((await database().query("SELECT count(*)::int AS n FROM auth_attempt_limits WHERE key_hash=ANY($1::char(64)[])",[stale])).rows[0].n,0);
    assert.equal((await database().query("SELECT count(*)::int AS n FROM auth_attempt_limits WHERE key_hash=$1",[active])).rows[0].n,1);
    const request=new Request("http://localhost:3000/api/me",{headers:{cookie:"devacademy_session="+session.token}});
    assert.ok(await currentLearner(request));
  } finally {
    await database().query("DELETE FROM auth_attempt_limits WHERE key_hash=ANY($1::char(64)[])",[[...stale,active]]);
    await database().query("DELETE FROM learner_accounts WHERE id=$1",[account.learnerId]);
  }
});

test.after(async () => { await database().end(); });
